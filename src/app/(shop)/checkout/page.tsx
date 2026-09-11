"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { useReferral } from "@/context/ReferralContext";
import { createOrder } from "@/lib/actions/create-order";
import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearBag } = useBag();
  const { referralCode: capturedReferralCode } = useReferral();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    (async () => {
      const customer = await getCurrentCustomer();
      if (!customer) {
        router.push("/login?redirect=/checkout");
        return;
      }
      if (customer.full_name) setFullName(customer.full_name);
      if (customer.phone) setPhone(customer.phone);
      setCheckingAuth(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!checkingAuth && items.length === 0) {
      router.push("/bag");
    }
  }, [checkingAuth, items.length, router]);

  useEffect(() => {
    if (capturedReferralCode) {
      setReferralCode(capturedReferralCode);
    }
  }, [capturedReferralCode]);

  const canSubmit = items.length > 0 && fullName.trim() !== "" && phone.trim() !== "";

  async function handleCheckout() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const result = await createOrder({
      customer: {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || null,
        notes: notes.trim() || null,
      },
      items,
      referralCode: referralCode.trim() || null,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clearBag();
    window.open(result.whatsappLink, "_blank");
    router.push("/");
  }

  if (checkingAuth || items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-ink-soft">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xs tracking-editorial uppercase text-stone-dark">
        <Link href="/bag" className="hover:text-ink">Bag</Link>
        <span>/</span>
        <span className="text-ink">Checkout</span>
      </div>

      <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-6xl">Checkout</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink pt-10 lg:grid-cols-3">
        {/* Delivery details */}
        <div className="lg:col-span-2">
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Delivery Details
          </h2>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                WhatsApp number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Shipping address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
                placeholder="Street, city, postal code"
              />
            </div>

            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full border border-border px-3 py-2 text-sm focus:border-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Referral code (optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="mt-1 w-full border border-border px-3 py-2 text-sm uppercase focus:border-ink focus:outline-none"
                placeholder="e.g. WAFIIR2892"
              />
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Order Summary
          </h2>

          <div className="mt-4 divide-y divide-border border-y border-border">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between gap-3 py-3 text-sm">
                <div>
                  <p>{item.productName}</p>
                  <p className="text-xs text-ink-soft">
                    {item.size} / {item.color} × {item.quantity}
                  </p>
                </div>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm tracking-editorial uppercase text-ink-soft">
              Subtotal
            </span>
            <span className="text-lg">{formatPrice(subtotal)}</span>
          </div>

          <p className="mt-2 text-xs text-stone-dark">
            Shipping cost and final total will be confirmed via WhatsApp.
          </p>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={!canSubmit || submitting}
            className={cn(
              "mt-6 w-full px-6 py-3 text-sm tracking-editorial uppercase transition-colors",
              canSubmit && !submitting
                ? "bg-ink text-off-white hover:bg-ink-soft"
                : "cursor-not-allowed bg-stone text-stone-dark"
            )}
          >
            {submitting ? "Placing order..." : "Confirm via WhatsApp"}
          </button>

          {!canSubmit && (
            <p className="mt-3 text-xs text-stone-dark">
              Fill in your name and WhatsApp number to continue.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
