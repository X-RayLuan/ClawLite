'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';

export interface EzrouterKey {
  id: string;
  name: string;
  key_prefix: string;
  ezrouter_key_id: string;
  is_shared: boolean;
  load_weight: number;
  status: 'active' | 'inactive';
  use_count: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-stone-300/70 bg-white p-6 shadow-elevated">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface KeyFormData {
  ezrouter_key_id: string;
  plaintext_key: string;
  key_prefix: string;
  name: string;
  is_shared: boolean;
  load_weight: number;
}

export default function EzrouterKeysPage() {
  const { isAuthenticated, checking } = useAdminAuth();

  const [keys, setKeys] = useState<EzrouterKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<EzrouterKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<KeyFormData>({
    ezrouter_key_id: '', plaintext_key: '', key_prefix: '', name: '',
    is_shared: false, load_weight: 100,
  });
  const [formError, setFormError] = useState('');

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ezrouter-keys', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
      });
      if (res.ok) {
        const json = await res.json();
        setKeys(json.data || []);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!isAuthenticated) return;
    fetchKeys();
  }, [checking, isAuthenticated, fetchKeys]);

  const openAdd = () => {
    setForm({ ezrouter_key_id: '', plaintext_key: '', key_prefix: '', name: '', is_shared: false, load_weight: 100 });
    setFormError('');
    setShowAddModal(true);
  };

  const openEdit = (key: EzrouterKey) => {
    setEditingKey(key);
    setForm({
      ezrouter_key_id: key.ezrouter_key_id,
      plaintext_key: '',
      key_prefix: key.key_prefix,
      name: key.name,
      is_shared: key.is_shared,
      load_weight: key.load_weight,
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const url = editingKey ? `/api/admin/ezrouter-keys/${editingKey.id}` : '/api/admin/ezrouter-keys';
      const method = editingKey ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '保存失败');
      await fetchKeys();
      setShowAddModal(false);
      setEditingKey(null);
    } catch (err: any) {
      setFormError(err.message);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (key: EzrouterKey) => {
    if (!confirm(`确定删除 Key「${key.name}」？`)) return;
    try {
      const res = await fetch(`/api/admin/ezrouter-keys/${key.id}`, { method: 'DELETE' });
      if (res.ok) await fetchKeys();
    } catch { /* silently fail */ }
  };

  const handleToggleStatus = async (key: EzrouterKey) => {
    const newStatus = key.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/ezrouter-keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) await fetchKeys();
    } catch { /* silently fail */ }
  };

  const isEditing = editingKey !== null;
  const modalTitle = isEditing ? '编辑 Key' : '添加 Key';

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
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <Badge className="border-coral/20 bg-coral/10 text-coral">管理后台</Badge>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">EZRouter Key 池</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500 sm:text-base">
          管理 EZRouter 的 Key 池，支持添加、编辑、删除和状态切换。
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Key 列表</CardTitle>
            <Button size="sm" onClick={openAdd}>
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加 Key
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">名称</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">Key 前缀</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">状态</th>
                    <th className="py-3 pr-4 text-right font-semibold text-stone-600">使用次数</th>
                    <th className="py-3 pr-4 text-right font-semibold text-stone-600">余额</th>
                    <th className="py-3 pr-4 text-left font-semibold text-stone-600">创建时间</th>
                    <th className="py-3 text-left font-semibold text-stone-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : keys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">暂无 Key</td>
                    </tr>
                  ) : (
                    keys.map((key) => (
                      <tr key={key.id} className="border-b border-stone-100 transition-colors hover:bg-stone-50">
                        <td className="py-3 pr-4 font-medium text-stone-900">{key.name}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-stone-500">{key.key_prefix}***</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleToggleStatus(key)}
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
                              key.status === 'active'
                                ? 'border-sea/30 bg-sea/10 text-sea cursor-pointer'
                                : 'border-stone-300/70 bg-stone-100 text-stone-500 cursor-pointer'
                            )}
                          >
                            {key.status === 'active' ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-right text-stone-600">{key.use_count ?? 0}</td>
                        <td className="py-3 pr-4 text-right font-medium text-stone-900">
                          ${(key.balance ?? 0).toFixed(4)}
                        </td>
                        <td className="py-3 pr-4 text-stone-500">{formatDate(key.created_at)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(key)} className="h-7 px-2 text-xs">
                              编辑
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(key)} className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
                              删除
                            </Button>
                          </div>
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

      {/* Add / Edit Modal */}
      <Modal open={showAddModal || isEditing} onClose={() => { setShowAddModal(false); setEditingKey(null); }} title={modalTitle}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">名称 *</label>
            <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如: Production Key 1" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">Key ID *</label>
            <Input required value={form.ezrouter_key_id} onChange={e => setForm(f => ({ ...f, ezrouter_key_id: e.target.value }))} placeholder="ezrouter_key_xxx" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">Key 内容（明文） *</label>
            <Input required type="password" value={form.plaintext_key} onChange={e => setForm(f => ({ ...f, plaintext_key: e.target.value }))} placeholder="sk-xxx..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">Key 前缀 *</label>
            <Input required value={form.key_prefix} onChange={e => setForm(f => ({ ...f, key_prefix: e.target.value }))} placeholder="sk-" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-600">负载权重</label>
              <Input type="number" min={1} max={1000} value={form.load_weight} onChange={e => setForm(f => ({ ...f, load_weight: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input type="checkbox" checked={form.is_shared} onChange={e => setForm(f => ({ ...f, is_shared: e.target.checked }))} className="rounded border-stone-300" />
                共享 Key
              </label>
            </div>
          </div>
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowAddModal(false); setEditingKey(null); }}>取消</Button>
            <Button type="submit" disabled={submitting}>{submitting ? '保存中…' : '保存'}</Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
