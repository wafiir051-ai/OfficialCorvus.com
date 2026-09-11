"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOwnBankInfo } from "@/lib/actions/affiliate";

export function BankInfoForm({
  defaultBankName,
  defaultBankAccountNumber,
  defaultBankAccountName,
}: {
  defaultBankName: string;
  defaultBankAccountNumber: string;
  defaultBankAccountName: string;
}) {
  const router = useRouter();
  const hasExistingInfo = Boolean(
    defaultBankName || defaultBankAccountNumber || defaultBankAccountName
  );

  const [editing, setEditing] = useState(!hasExistingInfo);
  const [bankName, setBankName] = useState(defaultBankName);
  const [bankAccountNumber, setBankAccountNumber] = useState(defaultBankAccountNumber);
  const [bankAccountName, setBankAccountName] = useState(defaultBankAccountName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateOwnBankInfo(bankName, bankAccountNumber, bankAccountName);

    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="mt-6 rounded border border-border bg-off-white-soft px-4 py-5">
        <p className="text-xs tracking-editorial uppercase text-stone-dark">
          Rekening Pencairan Komisi
        </p>
        <p className="mt-2 text-sm">
          {bankName} &middot; {bankAccountNumber}
        </p>
        <p className="text-sm text-stone-dark">a.n. {bankAccountName}</p>
        {success && (
          <p className="mt-2 text-sm text-green-700">Info rekening berhasil disimpan.</p>
        )}
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setSuccess(false);
          }}
          className="mt-3 text-xs tracking-editorial uppercase underline"
        >
          Ubah Rekening
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <p className="text-xs tracking-editorial uppercase text-stone-dark">
        Rekening Pencairan Komisi
      </p>
      <p className="text-sm text-stone-dark">
        Isi rekening kamu supaya komisi bisa kami transfer.
      </p>

      <div>
        <label className="text-xs tracking-editorial uppercase text-stone-dark">Nama Bank</label>
        <input
          type="text"
          required
          placeholder="BCA"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="mt-1 w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-rust"
        />
      </div>

      <div>
        <label className="text-xs tracking-editorial uppercase text-stone-dark">
          Nomor Rekening
        </label>
        <input
          type="text"
          required
          placeholder="1234567890"
          value={bankAccountNumber}
          onChange={(e) => setBankAccountNumber(e.target.value)}
          className="mt-1 w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-rust"
        />
      </div>

      <div>
        <label className="text-xs tracking-editorial uppercase text-stone-dark">
          Nama Pemilik Rekening
        </label>
        <input
          type="text"
          required
          placeholder="Sesuai buku tabungan"
          value={bankAccountName}
          onChange={(e) => setBankAccountName(e.target.value)}
          className="mt-1 w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-rust"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-rust px-8 py-3 text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-rust-dark disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Simpan Rekening"}
        </button>
        {hasExistingInfo && (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="px-4 py-3 text-xs tracking-editorial uppercase underline"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
