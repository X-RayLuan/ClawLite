'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/components/lang-provider';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  faqs: FAQ[];
}

interface BlogEditorProps {
  initialData?: BlogFormData;
  onSave: (data: BlogFormData, publish: boolean) => Promise<void>;
  saving?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BlogEditor({ initialData, onSave, saving = false }: BlogEditorProps) {
  const { lang } = useLang();
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [faqs, setFaqs] = useState<FAQ[]>(initialData?.faqs || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = lang === 'zh' ? '标题不能为空' : 'Title is required';
    if (!slug.trim()) errs.slug = lang === 'zh' ? 'Slug 不能为空' : 'Slug is required';
    if (!content.trim()) errs.content = lang === 'zh' ? '正文不能为空' : 'Content is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish: boolean) => {
    if (!validate()) return;
    await onSave({ title: title.trim(), slug: slug.trim(), excerpt: excerpt.trim(), content, faqs }, publish);
  };

  const addFaq = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }]);
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    setFaqs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">
          {lang === 'zh' ? '标题' : 'Title'} <span className="text-red-500">*</span>
        </label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={lang === 'zh' ? '输入文章标题…' : 'Enter post title...'}
          className={errors.title ? 'border-red-400' : ''}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">
          Slug <span className="text-red-500">*</span>
          <span className="ml-2 font-normal text-stone-400">
            ({lang === 'zh' ? '从标题自动生成' : 'auto-generated from title'})
          </span>
        </label>
        <Input
          value={slug}
          onChange={e => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
          placeholder="my-blog-post-slug"
          className={errors.slug ? 'border-red-400' : ''}
        />
        {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
      </div>

      {/* 摘要 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">
          {lang === 'zh' ? '摘要（可选）' : 'Excerpt (optional)'}
        </label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder={lang === 'zh' ? '简短摘要，用于列表页展示…' : 'Short excerpt for list page...'}
          rows={3}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {/* 正文 */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">
          {lang === 'zh' ? '正文' : 'Content'} <span className="text-red-500">*</span>
          <span className="ml-2 font-normal text-stone-400">(Markdown)</span>
        </label>
        <div data-color-mode="light" className={errors.content ? 'ring-2 ring-red-300 rounded-xl' : ''}>
          <MDEditor
            value={content}
            onChange={v => setContent(v || '')}
            height={400}
            preview="edit"
            style={{ borderRadius: '0.75rem', border: errors.content ? '1px solid #f87171' : '1px solid #d6d3d1' }}
          />
        </div>
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>

      {/* FAQ 管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            {lang === 'zh' ? 'FAQ（可选）' : 'FAQ (optional)'}
          </CardTitle>
          <Button type="button" variant="secondary" size="sm" onClick={addFaq}>
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {lang === 'zh' ? '添加 FAQ' : 'Add FAQ'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">
              {lang === 'zh' ? '暂无 FAQ，点击上方按钮添加' : 'No FAQs yet. Click "Add FAQ" above.'}
            </p>
          ) : (
            faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-stone-200 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-600">
                        {lang === 'zh' ? '问题' : 'Question'}
                      </label>
                      <Input
                        value={faq.question}
                        onChange={e => updateFaq(i, 'question', e.target.value)}
                        placeholder={lang === 'zh' ? '问题内容…' : 'Question...'}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-600">
                        {lang === 'zh' ? '回答' : 'Answer'}
                      </label>
                      <textarea
                        value={faq.answer}
                        onChange={e => updateFaq(i, 'answer', e.target.value)}
                        placeholder={lang === 'zh' ? '回答内容…' : 'Answer...'}
                        rows={3}
                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="mt-7 rounded-full p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 底部按钮 */}
      <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? (lang === 'zh' ? '保存中…' : 'Saving...') : (lang === 'zh' ? '保存草稿' : 'Save as Draft')}
        </Button>
        <Button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {lang === 'zh' ? '发布' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
