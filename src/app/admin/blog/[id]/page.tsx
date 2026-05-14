'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminNav } from '@/components/admin-nav';
import { useLang } from '@/components/lang-provider';
import { adminFetch } from '@/lib/admin-auth';
import { BlogEditor, BlogFormData } from '@/components/admin/blog-editor';
import type { BlogPost } from '../page';

export default function BlogEditPage() {
  const { isAuthenticated, checking } = useAdminAuth();
  const { lang } = useLang();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    if (isNew) return;

    const loadPost = async () => {
      setLoading(true);
      try {
        // Fetch all posts and find the one with this id
        const res = await adminFetch('/api/admin/blog?page=1&page_size=100');
        if (res.ok) {
          const json = await res.json();
          const found = (json.data?.posts || []).find((p: BlogPost) => p.id === id);
          if (found) {
            setPost(found);
          } else {
            setError(lang === 'zh' ? '文章不存在' : 'Post not found');
          }
        }
      } catch {
        setError(lang === 'zh' ? '加载失败' : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [checking, isAuthenticated, isNew, id, lang]);

  const handleSave = async (data: BlogFormData, publish: boolean) => {
    setError('');
    setSaving(true);
    const published_at = publish ? new Date().toISOString() : null;
    try {
      if (isNew) {
        const res = await adminFetch('/api/admin/blog', {
          method: 'POST',
          body: JSON.stringify({ ...data, published_at }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || (lang === 'zh' ? '创建失败' : 'Failed to create post'));
          return;
        }
        router.push('/admin/blog');
      } else if (post) {
        const res = await adminFetch(`/api/admin/blog/${post.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...data, published_at }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || (lang === 'zh' ? '保存失败' : 'Failed to save'));
          return;
        }
        router.push('/admin/blog');
      }
    } catch {
      setError(lang === 'zh' ? '网络错误' : 'Network error');
    } finally {
      setSaving(false);
    }
  };

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
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <Badge className="border-coral/20 bg-coral/10 text-coral">{lang === 'zh' ? '管理后台' : 'Admin'}</Badge>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
              {isNew ? (lang === 'zh' ? '新建文章' : 'New Post') : (lang === 'zh' ? '编辑文章' : 'Edit Post')}
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          </div>
        ) : error && !post && !isNew ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={() => router.push('/admin/blog')}>
              {lang === 'zh' ? '返回列表' : 'Back to List'}
            </Button>
          </div>
        ) : (
          <div>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <BlogEditor
              initialData={post ? {
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || '',
                content: post.content,
                faqs: post.faqs || [],
              } : undefined}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}
      </section>
    </main>
  );
}
