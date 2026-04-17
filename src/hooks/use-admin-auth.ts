'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/admin-auth';

export function useAdminAuth(redirectToLogin = true) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      setIsAuthenticated(true);
    } else if (redirectToLogin) {
      router.replace('/admin/login');
    }
    setChecking(false);
  }, [redirectToLogin, router]);

  return { isAuthenticated, checking };
}
