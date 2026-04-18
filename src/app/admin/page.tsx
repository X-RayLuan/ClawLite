'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/customers');
  }, [router]);

  return (
    <main className="gradient-bg min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
    </main>
  );
}
