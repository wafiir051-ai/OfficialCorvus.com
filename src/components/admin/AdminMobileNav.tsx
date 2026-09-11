"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOutAdmin } from "@/lib/actions/admin-auth";

type NavItem = { href: string; label: string };

export function AdminMobileNav({ navItems }: { navItems: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded hover:bg-off-white-soft transition-colors"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink text-off-white">
            <div className="flex items-center justify-between px-6 py-6">
              <div>
                <span className="font-display text-xl tracking-editorial">CORVUS</span>
                <p className="mt-1 text-xs tracking-editorial uppercase text-stone">Admin</p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded hover:bg-ink-soft transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2 text-sm tracking-editorial uppercase text-stone hover:bg-ink-soft hover:text-off-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-ink-soft px-6 py-4">
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="w-full border border-stone px-3 py-2 text-xs tracking-editorial uppercase text-stone hover:bg-ink-soft hover:text-off-white transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
