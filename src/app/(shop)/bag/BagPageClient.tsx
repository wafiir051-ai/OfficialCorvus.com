"use client";

import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { formatPrice } from "@/lib/utils/format";

export function BagPageClient() {
  const { items, updateQuantity, removeItem, subtotal } = useBag();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl">Your bag is empty</h1>
        <p className="mt-4 text-sm text-ink-soft">
          Browse the shop and add something you like.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block border border-ink px-6 py-3 text-sm tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors"
        >
          Go to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xs tracking-editorial uppercase text-stone-dark">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <span>/</span>
        <span className="text-ink">Bag</span>
      </div>

      <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-6xl">Your Bag</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 border-t border-ink pt-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Items
          </h2>

          <div className="mt-4 divide-y divide-border border-b border-border">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 py-5">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-off-white-soft">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm">{item.productName}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {item.size} / {item.color}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center hover:bg-off-white-soft"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center hover:bg-off-white-soft"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-stone-dark underline hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-sm">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
            Order Summary
          </h2>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm tracking-editorial uppercase text-ink-soft">
              Subtotal
            </span>
            <span className="text-lg">{formatPrice(subtotal)}</span>
          </div>

          <p className="mt-2 text-xs text-stone-dark">
            Shipping and final total will be confirmed via WhatsApp.
          </p>

          <Link
            href="/checkout"
            className="mt-6 block w-full bg-ink px-6 py-3 text-center text-sm tracking-editorial uppercase text-off-white transition-colors hover:bg-ink-soft"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/shop"
            className="mt-3 block w-full border border-border px-6 py-3 text-center text-sm tracking-editorial uppercase text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
