"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getContentForLang } from "@/lib/content";
import { LangToggle } from "@/components/lang-toggle";
import { useLang } from "@/components/lang-provider";
import { getSupabaseClient } from "@/lib/supabase";

export function SiteHeader() {
  const { lang } = useLang();
  const nav = getContentForLang(lang).nav;
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session?.user));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/50 bg-[rgba(248,244,237,0.85)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[var(--fd-layout-width)] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-stone-900">
          <Image src="/clawlitelogo.png" alt="clawlite logo" width={28} height={28} className="h-7 w-7 rounded-md object-cover" priority />
          <span>ClawLite</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          <Link href="/" className="transition-colors hover:text-stone-900">{nav.home}</Link>
          <Link href="/setup" className="transition-colors hover:text-stone-900">{nav.setup ?? "Setup"}</Link>
          <Link href="/marketing-agent-team" className="transition-colors hover:text-stone-900">{nav.marketingAgentTeam ?? "Marketing Agent Team"}</Link>
          <Link href="/skills" className="transition-colors hover:text-stone-900">{nav.skills ?? "Skills"}</Link>
          <Link href="/clawrouter" className="transition-colors hover:text-stone-900">{nav.clawrouter ?? "ClawRouter"}</Link>
          <Link href="/pricing" className="transition-colors hover:text-stone-900">Pricing</Link>
          <Link href="/docs" className="transition-colors hover:text-stone-900">
            {nav.docs}
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {loggedIn ? (
            <button type="button" onClick={handleLogout} className="text-sm text-stone-500 transition-colors hover:text-stone-900">
              Logout
            </button>
          ) : (
            <Link href="/login" className="text-sm text-stone-500 transition-colors hover:text-stone-900">
              Login
            </Link>
          )}
          <LangToggle />
          {/* Hamburger */}
          <button
            className="flex md:hidden p-1 text-stone-600 hover:text-stone-900"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-300/50 bg-[rgba(248,244,237,0.98)] px-4 pb-4 pt-2 space-y-1">
          {[
            { href: "/", label: nav.home },
            { href: "/setup", label: nav.setup ?? "Setup" },
            { href: "/marketing-agent-team", label: nav.marketingAgentTeam ?? "Marketing Agent Team" },
            { href: "/skills", label: nav.skills ?? "Skills" },
            { href: "/clawrouter", label: nav.clawrouter ?? "ClawRouter" },
            { href: "/pricing", label: "Pricing" },
            { href: "/docs", label: nav.docs },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              {label}
            </Link>
          ))}
          {!loggedIn && (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-stone-500 hover:text-stone-900">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
