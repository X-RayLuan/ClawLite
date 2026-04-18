'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setAdminToken } from '@/lib/admin-auth';
import { useLang } from '@/components/lang-provider';

type Step = 'email' | 'verify' | 'loading' | 'error';

export default function AdminLoginPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendCode = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(lang === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || (lang === 'zh' ? '发送失败' : 'Failed to send'));
      setSentEmail(email);
      setStep('verify');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || (lang === 'zh' ? '发送验证码失败，请稍后重试' : 'Failed to send code. Please try again later.'));
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [email, lang]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    // Focus last filled or first empty
    const focusIndex = Math.min(pasted.length, 5);
    codeRefs.current[Math.min(focusIndex, 5)]?.focus();
  };

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || (lang === 'zh' ? '发送失败' : 'Failed to send'));
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || (lang === 'zh' ? '重新发送失败，请稍后重试' : 'Failed to resend. Please try again later.'));
    } finally {
      setLoading(false);
    }
  }, [sentEmail, resendCooldown, lang]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError(lang === 'zh' ? '请输入完整的6位验证码' : 'Please enter the complete 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, code: codeStr }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || (lang === 'zh' ? '登录失败' : 'Login failed'));
      if (json.token) {
        setAdminToken(json.token);
        router.push('/admin/customers');
      } else {
        throw new Error('登录响应缺少 token');
      }
    } catch (err: any) {
      setError(err.message || (lang === 'zh' ? '验证码错误，请重试' : 'Verification failed. Please try again.'));
      setLoading(false);
    }
  }, [code, sentEmail, router, lang]);

  const handleBack = () => {
    setStep('email');
    setError('');
    setCode(['', '', '', '', '', '']);
  };

  const isLoading = step === 'loading';

  return (
    <main className="gradient-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-white mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-stone-900">{lang === 'zh' ? '管理员登录' : 'Admin Login'}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {step === 'email' && (lang === 'zh' ? '请输入管理员邮箱以继续' : 'Enter admin email to continue')}
            {step === 'verify' && `${lang === 'zh' ? '验证码已发送至' : 'Code sent to'} ${sentEmail}`}
            {step === 'error' && (lang === 'zh' ? '出错了，请重试' : 'Error occurred. Please try again.')}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2.2rem] bg-white/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
                  <span className="text-sm text-stone-500">{lang === 'zh' ? '处理中…' : 'Processing...'}</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && step === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-stone-600">{lang === 'zh' ? '邮箱地址' : 'Email address'}</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoFocus
                    required
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (lang === 'zh' ? '发送中…' : 'Sending...') : (lang === 'zh' ? '发送验证码' : 'Send Code')}
                </Button>
              </form>
            )}

            {/* ── Step 2: Verification Code ── */}
            {step === 'verify' && (
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Code input grid */}
                <div>
                  <label className="mb-2 block text-center text-xs font-semibold text-stone-600">
                    {lang === 'zh' ? '输入6位验证码' : 'Enter 6-digit code'}
                  </label>
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { codeRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleCodeChange(i, e.target.value)}
                        onKeyDown={e => handleCodeKeyDown(i, e)}
                        className="h-12 w-11 rounded-2xl border border-black/10 bg-white text-center text-lg font-semibold shadow-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10 transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-center text-sm text-red-500">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading || code.join('').length < 6}>
                  {loading ? (lang === 'zh' ? '验证中…' : 'Verifying...') : (lang === 'zh' ? '登录' : 'Login')}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    ← {lang === 'zh' ? '更换邮箱' : 'Change email'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-coral hover:text-coral/80 transition-colors disabled:text-stone-300 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? (lang === 'zh' ? `${resendCooldown}s 后重新发送` : `Resend in ${resendCooldown}s`) : (lang === 'zh' ? '重新发送' : 'Resend')}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3: Error state (back option) ── */}
            {step === 'error' && !isLoading && (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
                <Button onClick={handleBack} variant="secondary" className="w-full">
                  {lang === 'zh' ? '返回重新输入邮箱' : 'Back to re-enter email'}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-stone-400">
          {lang === 'zh' ? '仅为授权管理员提供服务' : 'Service for authorized admins only'}
        </p>
      </div>
    </main>
  );
}
