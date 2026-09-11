import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { getAffiliateInfo } from "@/lib/actions/affiliate";
import { AffiliateForm } from "./AffiliateForm";
import { ReferralLinkCard } from "./ReferralLinkCard";
import { BankInfoForm } from "./BankInfoForm";

export default async function AffiliatePage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login?redirect=/affiliate");
  }

  const info = await getAffiliateInfo();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-ink-soft">Affiliate Program</p>
      <h1 className="mt-2 font-display text-3xl">Gabung Jadi Affiliate</h1>

      {info?.status === "none" && (
        <>
          <p className="mt-4 text-sm text-stone-dark">
            Daftar sebagai affiliate CORVUS dan dapatkan komisi dari setiap penjualan
            lewat kode referral kamu. Pendaftaran akan ditinjau oleh tim kami.
          </p>
          <AffiliateForm
            defaultName={customer.full_name ?? ""}
            defaultPhone={customer.phone ?? ""}
          />
        </>
      )}

      {info?.status === "pending" && (
        <div className="mt-6 rounded border border-border bg-off-white-soft px-4 py-6 text-center">
          <p className="text-sm font-medium">Pendaftaran kamu sedang ditinjau.</p>
          <p className="mt-2 text-sm text-stone-dark">
            Tim kami akan meninjau pendaftaranmu. Kami akan memberi tahu jika sudah disetujui.
          </p>
        </div>
      )}

      {info?.status === "approved" && (
        <div className="mt-6 rounded border border-border bg-off-white-soft px-4 py-6 text-center">
          <p className="text-sm font-medium">Selamat! Kamu resmi jadi affiliate CORVUS.</p>
          <p className="mt-4 text-xs tracking-editorial uppercase text-stone-dark">Kode Referral</p>
          <p className="mt-1 font-display text-2xl tracking-editorial">{info.referralCode}</p>
          {info.referralCode && <ReferralLinkCard referralCode={info.referralCode} />}
        </div>
      )}

      {info?.status === "approved" && (
        <BankInfoForm
          defaultBankName={info.bankName ?? ""}
          defaultBankAccountNumber={info.bankAccountNumber ?? ""}
          defaultBankAccountName={info.bankAccountName ?? ""}
        />
      )}

      {info?.status === "rejected" && (
        <div className="mt-6 rounded border border-border bg-off-white-soft px-4 py-6 text-center">
          <p className="text-sm font-medium">Pendaftaran kamu belum bisa kami setujui saat ini.</p>
          <p className="mt-2 text-sm text-stone-dark">
            Hubungi kami lewat WhatsApp jika ada pertanyaan.
          </p>
        </div>
      )}
    </div>
  );
}
