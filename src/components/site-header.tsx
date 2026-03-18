"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { content } from "@/lib/content";
import { LangToggle } from "@/components/lang-toggle";
import { useLang } from "@/components/lang-provider";
import { getSupabaseClient } from "@/lib/supabase";

export function SiteHeader() {
  const { lang } = useLang();
  const nav = content[lang].nav;
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loggedIn, setLoggedIn] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image src="/clawlitelogo.png" alt="clawlite logo" width={28} height={28} className="h-7 w-7 rounded-md object-cover" priority />
          <span>ClawLite</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/">{nav.home}</Link>
          <Link href="/setup">{nav.setup ?? "Setup"}</Link>
          <Link href="/skills">{nav.skills ?? "Skills"}</Link>
          <Link href="/troubleshoot">{nav.troubleshoot}</Link>
          <Link href="/docs" className="text-ink/70 hover:text-ink">
            {nav.docs}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <button type="button" onClick={handleLogout} className="text-sm text-ink/80 hover:text-ink">
              Logout
            </button>
          ) : (
            <Link href="/login" className="text-sm text-ink/80 hover:text-ink">
              Login
            </Link>
          )}
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
