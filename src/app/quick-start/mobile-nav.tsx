"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  links: { href: string; label: string }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? (
          <X className="h-4 w-4 text-stone-700" />
        ) : (
          <Menu className="h-4 w-4 text-stone-700" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-stone-200/60 bg-white px-4 py-3">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
