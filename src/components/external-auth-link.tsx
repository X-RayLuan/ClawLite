"use client";

import Link from "next/link";
import { MouseEvent, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase";

const ALLOWED_EXTERNALS = new Set([
  "https://buy.stripe.com/cNidR8fPO5HS3mW6lB8IU00",
  "https://openrouter.ezsite.ai",
]);

function getSafeExternalTarget(href: string) {
  return ALLOWED_EXTERNALS.has(href) ? href : null;
}

export function ExternalAuthLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const supabase = useMemo(() => getSupabaseClient(), []);

  async function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    const safeTarget = getSafeExternalTarget(href);
    if (!safeTarget) {
      e.preventDefault();
      return;
    }

    if (!supabase) {
      e.preventDefault();
      window.location.href = `/login?external=${encodeURIComponent(safeTarget)}`;
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      e.preventDefault();
      window.location.href = `/login?external=${encodeURIComponent(safeTarget)}`;
      return;
    }
  }

  return (
    <Link href={href} target="_blank" rel="noreferrer" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
