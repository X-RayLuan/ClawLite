"use client";

import Link from "next/link";
import { MouseEvent, useMemo } from "react";
import { isAllowedExternalAuthTarget } from "@/lib/pricing";
import { getSupabaseClient } from "@/lib/supabase";

function getSafeExternalTarget(href: string) {
  return isAllowedExternalAuthTarget(href) ? href : null;
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
