'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { LangToggle } from '@/components/lang-toggle';

const navItems = (lang: string) => [
  { href: '/admin/blog', label: lang === 'zh' ? '博客' : 'Blog' },
  { href: '/admin/customers', label: lang === 'zh' ? '客户管理' : 'Customers' },
  { href: '/admin/usage', label: lang === 'zh' ? '消费统计' : 'Usage' },
  { href: '/admin/admins', label: lang === 'zh' ? '管理员' : 'Admins' },
];

export function AdminNav() {
  const pathname = usePathname();
  const { lang } = useLang();

  const labels = navItems(lang);
  const logoutLabel = lang === 'zh' ? '退出' : 'Logout';

  return (
    <div className="flex items-center gap-1 border-b border-stone-200 bg-white px-6 py-3">
      <div className="flex items-center gap-1 flex-1">
        {labels.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <LangToggle className="mr-2" />
      <div className="text-sm text-stone-400">
        <Link href="/admin/login" className="hover:text-stone-600">{logoutLabel}</Link>
      </div>
    </div>
  );
}
