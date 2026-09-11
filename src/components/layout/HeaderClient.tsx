"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Users, User } from "lucide-react";
import { useBag } from "@/context/BagContext";

type NavLink = { href: string; label: string };

export function HeaderClient({
  navLinks,
  isLoggedIn,
  affiliateHref,
  affiliateLabel,
}: {
  navLinks: NavLink[];
  isLoggedIn: boolean;
  affiliateHref: string | null;
  affiliateLabel: string;
}) {
  const { totalItems } = useBag();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-off-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-off-white-soft transition-colors md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>

          <Link href="/" className="font-logo text-2xl tracking-normal">
            CORVUS
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-editorial uppercase text-ink-soft hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {affiliateHref && (
            <Link
              href={affiliateHref}
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-2 text-xs tracking-editorial uppercase text-ink-soft hover:bg-off-white-soft hover:text-ink transition-colors"
            >
              <Users className="h-4 w-4" strokeWidth={1.5} />
              {affiliateLabel}
            </Link>
          )}

          {isLoggedIn ? (
            <Link
              href="/account"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-off-white-soft transition-colors"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-2 text-xs tracking-editorial uppercase text-ink-soft hover:bg-off-white-soft hover:text-ink transition-colors"
            >
              <User className="h-4 w-4" strokeWidth={1.5} />
              Login
            </Link>
          )}

          <Link
            href="/bag"
            aria-label="View bag"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-off-white-soft transition-colors"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-olive text-[10px] text-off-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-off-white px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded px-3 py-2 text-sm tracking-editorial uppercase text-ink-soft hover:bg-off-white-soft hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {affiliateHref && (
              <li>
                <Link
                  href={affiliateHref}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded px-3 py-2 text-sm tracking-editorial uppercase text-ink-soft hover:bg-off-white-soft hover:text-ink transition-colors"
                >
                  {affiliateLabel}
                </Link>
              </li>
            )}
            {!isLoggedIn && (
              <li>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded px-3 py-2 text-sm tracking-editorial uppercase text-ink-soft hover:bg-off-white-soft hover:text-ink transition-colors"
                >
                  Login / Daftar
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
