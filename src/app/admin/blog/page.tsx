'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminNav } from '@/components/admin-nav';
import { useLang } from '@/components/lang-provider';
import { adminFetch } from '@/lib/admin-auth';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  faqs: Array<{ question: string; answer: string }>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'published' | 'draft';

export default function BlogPage() {
  const { isAuthenticated, checking } = useAdminAuth();
  const { lang } = useLang();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toggleId, setToggleId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (pg: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), page_size: String(PAGE_SIZE) });
      if (q) params.set('q', q);
      const res = await adminFetch(`/api/admin/blog?${params}`);
      if (res.ok) {
        const json = await res.json();
        let data: BlogPost[] = json.data?.posts || [];
        // Apply client-side status filter (API doesn't filter by published_at)
        if (statusFilter === 'published') data = data.filter(p => p.published_at);
        else if (statusFilter === 'draft') data = data.filter(p => !p.published_at);
        setPosts(data);
        setPagination(json.data?.pagination || null);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    fetchPosts(page, search);
  }, [checking, isAuthenticated, page, search, fetchPosts]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => { setPage(1); fetchPosts(1, val); }, 400);
    setSearchTimer(timer);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(lang === 'zh' ? `确定删除「${post.title}」？` : `Delete "${post.title}"?`)) return;
    setDeletingId(post.id);
    try {
      const res = await adminFetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== post.id));
      }
    } finally { setDeletingId(null); }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setToggleId(post.id);
    try {
      const published_at = post.published_at ? null : new Date().toISOString();
      const res = await adminFetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ slug: post.slug, title: post.title, content: post.content, excerpt: post.excerpt, faqs: post.faqs, published_at }),
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published_at } : p));
      }
    } finally { setToggleId(null); }
  };

  const totalPages = pagination?.total_pages || 1;

  if (checking) {
    return (
      <main className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="gradient-bg min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <Badge className="border-coral/20 bg-coral/10 text-coral">{lang === 'zh' ? '管理后台' : 'Admin'}</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {lang === 'zh' ? '博客管理' : 'Blog Management'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          {lang === 'zh'
            ? '管理所有博客文章，支持新建、编辑、发布和删除。'
            : 'Manage all blog posts. Support create, edit, publish, and delete.'}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{lang === 'zh' ? '文章列表' : 'Post List'}</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* 状态筛选 */}
              <div className="flex items-center gap-1 rounded-full bg-stone-100 p-1">
                {(['all', 'published', 'draft'] as StatusFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => { setStatusFilter(f); setPage(1); fetchPosts(1, search); }}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition',
                      statusFilter === f
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-500 hover:text-stone-700'
                    )}
                  >
                    {f === 'all' ? (lang === 'zh' ? '全部' : 'All') :
                     f === 'published' ? (lang === 'zh' ? '已发布' : 'Published') :
                     (lang === 'zh' ? '草稿' : 'Draft')}
                  </button>
                ))}
              </div>
              {/* 搜索 */}
              <Input
                placeholder={lang === 'zh' ? '搜索标题…' : 'Search by title...'}
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full sm:w-56"
              />
              {/* 新建 */}
              <Button onClick={() => router.push('/admin/blog/new')}>
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {lang === 'zh' ? '新建文章' : 'New Post'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '标题' : 'Title'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">Slug</th>
                    <th className="py-3 pr-4 text-center font-semibold text-stone-600">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '发布时间' : 'Published At'}</th>
                    <th className="py-3 text-left font-semibold text-stone-600">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        {search ? (lang === 'zh' ? '未找到匹配的文章' : 'No matching posts') : (lang === 'zh' ? '暂无文章' : 'No posts')}
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="border-b border-stone-100 transition-colors hover:bg-stone-50">
                        <td className="py-3 pr-4 font-medium text-stone-900 max-w-[240px] truncate">{post.title}</td>
                        <td className="py-3 pr-4 text-stone-500 font-mono text-xs max-w-[160px] truncate">{post.slug}</td>
                        <td className="py-3 pr-4 text-center">
                          <Badge className={cn('border',
                            post.published_at
                              ? 'border-sea/20 bg-sea/10 text-sea'
                              : 'border-stone-300/70 bg-stone-100 text-stone-600'
                          )}>
                            {post.published_at ? (lang === 'zh' ? '已发布' : 'Published') : (lang === 'zh' ? '草稿' : 'Draft')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-stone-500">{formatDate(post.published_at)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => router.push(`/admin/blog/${post.id}`)}
                            >
                              {lang === 'zh' ? '编辑' : 'Edit'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn('h-7 px-2 text-xs', post.published_at ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-sea hover:text-sea hover:bg-sea/5')}
                              onClick={() => handleTogglePublish(post)}
                              disabled={toggleId === post.id}
                            >
                              {toggleId === post.id ? '…' : post.published_at ? (lang === 'zh' ? '下架' : 'Unpublish') : (lang === 'zh' ? '发布' : 'Publish')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-500 hover:bg-red-50"
                              onClick={() => handleDelete(post)}
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? '…' : (lang === 'zh' ? '删除' : 'Delete')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && (pagination?.total || 0) > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-stone-400">{lang === 'zh' ? '共' : 'Total'} {pagination?.total} {lang === 'zh' ? '条' : 'records'}</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 w-8 p-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={cn('h-8 w-8 p-0 text-xs', pageNum !== page && 'text-stone-600')}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 w-8 p-0">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
