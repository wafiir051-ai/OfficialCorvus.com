"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAffiliate } from "@/lib/actions/affiliate";

export function AffiliateForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await registerAffiliate(fullName, phone);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="text-xs tracking-editorial uppercase text-stone-dark">Nama Lengkap</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-rust"
        />
      </div>

      <div>
        <label className="text-xs tracking-editorial uppercase text-stone-dark">Nomor WhatsApp</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-rust"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full bg-rust px-8 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-rust-dark disabled:opacity-50"
      >
        {submitting ? "Mengirim..." : "Daftar Sekarang"}
      </button>
    </form>
  );
}
