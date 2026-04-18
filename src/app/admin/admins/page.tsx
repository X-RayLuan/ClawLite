'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminNav } from '@/components/admin-nav';
import { useLang } from '@/components/lang-provider';
import { adminFetch } from '@/lib/admin-auth';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
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

function AddAdminModal({ open, onClose, onAdded }: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await adminFetch('/api/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '添加失败');
      setEmail('');
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || '添加失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-stone-300/70 bg-white p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">添加管理员</h2>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-stone-600">管理员邮箱</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
            <Button type="submit" disabled={submitting}>{submitting ? '添加中…' : '添加'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminsPage() {
  const { isAuthenticated, checking } = useAdminAuth();
  const { lang } = useLang();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/admins', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
      });
      if (res.ok) {
        const json = await res.json();
        setAdmins(json.data || []);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    fetchAdmins();
  }, [checking, isAuthenticated, fetchAdmins]);

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`确定移除管理员 ${admin.email}？`)) return;
    setDeletingId(admin.id);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
      });
      if (res.ok) await fetchAdmins();
    } catch { /* silently fail */ }
    finally { setDeletingId(null); }
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
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <Badge className="border-coral/20 bg-coral/10 text-coral">管理后台</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">管理员管理</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          管理系统管理员账号，超级管理员拥有全部权限。
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{lang === 'zh' ? '管理员列表' : 'Admin List'}</CardTitle>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {lang === 'zh' ? '添加管理员' : 'Add Admin'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '邮箱' : 'Email'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '角色' : 'Role'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '状态' : 'Status'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '创建时间' : 'Created'}</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">{lang === 'zh' ? '最后登录' : 'Last Login'}</th>
                    <th className="py-3 text-left font-semibold text-stone-600">{lang === 'zh' ? '操作' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">{lang === 'zh' ? '暂无管理员' : 'No admins'}</td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id} className="border-b border-stone-100 transition-colors hover:bg-stone-50">
                        <td className="py-3 pr-4 font-medium text-stone-900">{admin.email}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            admin.role === 'super_admin'
                              ? 'border-coral/30 bg-coral/10 text-coral'
                              : 'border-sea/30 bg-sea/10 text-sea'
                          }`}>
                            {admin.role === 'super_admin' ? (lang === 'zh' ? '超级管理员' : 'Super Admin') : (lang === 'zh' ? '管理员' : 'Admin')}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            admin.is_active
                              ? 'border-sea/30 bg-sea/10 text-sea'
                              : 'border-stone-300/70 bg-stone-100 text-stone-500'
                          }`}>
                            {admin.is_active ? (lang === 'zh' ? '● 有效' : '● Active') : (lang === 'zh' ? '○ 已禁用' : '○ Disabled')}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-stone-500">{formatDate(admin.created_at)}</td>
                        <td className="py-3 pr-4 text-stone-500">{formatDate(admin.last_login)}</td>
                        <td className="py-3">
                          {admin.role !== 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(admin)}
                              disabled={deletingId === admin.id}
                              className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              {deletingId === admin.id ? (lang === 'zh' ? '删除中…' : 'Removing...') : (lang === 'zh' ? '移除' : 'Remove')}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <AddAdminModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={fetchAdmins}
      />
    </main>
  );
}
