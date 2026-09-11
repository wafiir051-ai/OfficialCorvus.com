"use client";

import { useState } from "react";

export function ReferralLinkCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${referralCode}`
      : `/?ref=${referralCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable, ignore
    }
  }

  return (
    <div className="mt-4">
      <p className="text-xs tracking-editorial uppercase text-stone-dark">Link Referral</p>
      <div className="mt-2 flex items-stretch gap-2">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="flex-1 truncate border border-border bg-white px-3 py-2 text-sm text-ink-soft outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 border border-ink px-4 py-2 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
        >
          {copied ? "Tersalin!" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-dark">
        Bagikan link ini ke calon pembeli. Kode referral akan otomatis terisi saat mereka checkout.
      </p>
    </div>
  );
}
