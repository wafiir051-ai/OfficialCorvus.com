"use server";

import { createClient } from "@/lib/supabase/server";

export type AffiliateStatus = "none" | "pending" | "approved" | "rejected";

export type AffiliateInfo = {
  status: AffiliateStatus;
  referralCode: string | null;
  affiliateId: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getAffiliateInfo(): Promise<AffiliateInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = (await supabase
    .from("affiliates")
    .select("id, status, referral_code, bank_name, bank_account_number, bank_account_name")
    .eq("user_id", user.id)
    .maybeSingle()) as {
    data: {
      id: string;
      status: AffiliateStatus;
      referral_code: string | null;
      bank_name: string | null;
      bank_account_number: string | null;
      bank_account_name: string | null;
    } | null;
  };

  if (!data) {
    return {
      status: "none",
      referralCode: null,
      affiliateId: null,
      bankName: null,
      bankAccountNumber: null,
      bankAccountName: null,
    };
  }

  return {
    status: data.status,
    referralCode: data.referral_code,
    affiliateId: data.id,
    bankName: data.bank_name,
    bankAccountNumber: data.bank_account_number,
    bankAccountName: data.bank_account_name,
  };
}

export async function registerAffiliate(
  fullName: string,
  phone: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Kamu harus login terlebih dahulu." };
  }

  if (!fullName.trim() || !phone.trim()) {
    return { ok: false, error: "Nama dan nomor telepon wajib diisi." };
  }

  const { error } = await supabase.from("affiliates").insert({
    user_id: user.id,
    full_name: fullName.trim(),
    phone: phone.trim(),
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Kamu sudah pernah mendaftar sebagai affiliate." };
    }
    return { ok: false, error: "Gagal mendaftar. Coba lagi." };
  }

  return { ok: true };
}

export async function updateOwnBankInfo(
  bankName: string,
  bankAccountNumber: string,
  bankAccountName: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Kamu harus login terlebih dahulu." };
  }

  if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) {
    return { ok: false, error: "Semua kolom rekening wajib diisi." };
  }

  const { error } = await supabase
    .from("affiliates")
    .update({
      bank_name: bankName.trim(),
      bank_account_number: bankAccountNumber.trim(),
      bank_account_name: bankAccountName.trim(),
    })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Gagal menyimpan info rekening. Coba lagi." };
  }

  return { ok: true };
}
