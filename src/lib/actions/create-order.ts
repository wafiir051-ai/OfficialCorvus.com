"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BagItem } from "@/context/BagContext";

type CreateOrderInput = {
  customer: {
    full_name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
  };
  items: BagItem[];
  referralCode?: string | null;
};

type CreateOrderResult =
  | { ok: true; orderNumber: string; whatsappLink: string }
  | { ok: false; error: string };

function pickWeightedWhatsAppNumber(
  numbers: { phone_number: string; weight: number }[]
): string {
  const totalWeight = numbers.reduce((sum, n) => sum + n.weight, 0);
  if (totalWeight <= 0) return numbers[0].phone_number;

  let roll = Math.random() * totalWeight;
  for (const n of numbers) {
    roll -= n.weight;
    if (roll <= 0) return n.phone_number;
  }
  return numbers[numbers.length - 1].phone_number;
}

function buildWhatsAppMessage(params: {
  orderNumber: string;
  customerName: string;
  items: BagItem[];
  subtotal: number;
  address?: string | null;
  notes?: string | null;
}): string {
  const lines = [
    `Halo, saya ingin konfirmasi pesanan *${params.orderNumber}*`,
    "",
    `Nama: ${params.customerName}`,
    "",
    "Pesanan:",
    ...params.items.map(
      (i) =>
        `- ${i.productName} (${i.size}/${i.color}) x${i.quantity} — Rp${(
          i.price * i.quantity
        ).toLocaleString("id-ID")}`
    ),
    "",
    `Subtotal: Rp${params.subtotal.toLocaleString("id-ID")}`,
  ];

  if (params.address) lines.push("", `Alamat: ${params.address}`);
  if (params.notes) lines.push("", `Catatan: ${params.notes}`);

  return lines.join("\n");
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Bag is empty." };
  }

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Re-validate stock server-side before committing anything
  const variantIds = input.items.map((i) => i.variantId);
  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("product_variants")
    .select("id, size, color, inventory ( quantity )")
    .in("id", variantIds);

  if (inventoryError) {
    return { ok: false, error: "Could not verify stock. Please try again." };
  }

  type InvRow = {
    id: string;
    size: string;
    color: string;
    inventory: { quantity: number } | { quantity: number }[] | null;
  };

  const stockByVariant = new Map<string, number>();
  for (const row of (inventoryRows ?? []) as unknown as InvRow[]) {
    const inv = Array.isArray(row.inventory) ? row.inventory[0] : row.inventory;
    stockByVariant.set(row.id, inv?.quantity ?? 0);
  }

  for (const item of input.items) {
    const available = stockByVariant.get(item.variantId) ?? 0;
    if (available < item.quantity) {
      return {
        ok: false,
        error: `${item.productName} (${item.size}/${item.color}) only has ${available} left in stock.`,
      };
    }
  }

  // 2. Create or reuse customer (match by phone), and link to the logged-in
  // auth user (if any) so their order history shows up in /account.
  const {
    data: { user: loggedInUser },
  } = await supabase.auth.getUser();

  const { data: existingCustomer } = await supabaseAdmin
    .from("customers")
    .select("id, user_id")
    .eq("phone", input.customer.phone)
    .maybeSingle();

  let customerId = existingCustomer?.id;

  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        full_name: input.customer.full_name,
        phone: input.customer.phone,
        email: input.customer.email ?? null,
        address: input.customer.address ?? null,
        notes: input.customer.notes ?? null,
        user_id: loggedInUser?.id ?? null,
      })
      .select("id")
      .single();

    if (customerError || !newCustomer) {
      return { ok: false, error: "Could not save customer details." };
    }
    customerId = newCustomer.id;
  } else if (loggedInUser && !existingCustomer?.user_id) {
    // Backfill the link if this phone number's customer row predates login.
    await supabaseAdmin
      .from("customers")
      .update({ user_id: loggedInUser.id })
      .eq("id", customerId);
  }

  // 3. Pick an active WhatsApp number, weighted
  const { data: waNumbers, error: waError } = await supabaseAdmin
    .from("whatsapp_numbers")
    .select("phone_number, weight")
    .eq("is_active", true);

  if (waError || !waNumbers || waNumbers.length === 0) {
    return { ok: false, error: "No WhatsApp number is currently available." };
  }

  const chosenNumber = pickWeightedWhatsAppNumber(waNumbers);

  // 3b. Look up referral code, if provided. Invalid/unknown codes are
  // silently ignored so a typo never blocks checkout.
  let referredByAffiliateId: string | null = null;
  const trimmedReferralCode = input.referralCode?.trim();

  if (trimmedReferralCode) {
    const { data: affiliate } = await supabaseAdmin
      .from("affiliates")
      .select("id")
      .eq("referral_code", trimmedReferralCode)
      .eq("status", "approved")
      .maybeSingle();

    if (affiliate) {
      referredByAffiliateId = affiliate.id;
    }
  }

  // 4. Create the order
  const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_id: customerId,
      subtotal,
      notes: input.customer.notes ?? null,
      whatsapp_number_used: chosenNumber,
      referred_by_affiliate_id: referredByAffiliateId,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { ok: false, error: "Could not create order. Please try again." };
  }

  // 5. Insert order items (snapshotted)
  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    input.items.map((i) => ({
      order_id: order.id,
      variant_id: i.variantId,
      product_name_snapshot: i.productName,
      size_snapshot: i.size,
      color_snapshot: i.color,
      unit_price: i.price,
      quantity: i.quantity,
    }))
  );

  if (itemsError) {
    return { ok: false, error: "Could not save order items. Please try again." };
  }

  // 5b. Atomically decrement stock for each item. If any fails (e.g. lost a
  // race with another checkout), roll back the order and its items.
  for (const item of input.items) {
    const { data: stockOk, error: stockError } = await supabaseAdmin.rpc(
      "decrement_variant_stock",
      { p_variant_id: item.variantId, p_quantity: item.quantity }
    );

    if (stockError || !stockOk) {
      await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return {
        ok: false,
        error: `${item.productName} (${item.size}/${item.color}) just sold out. Please update your bag.`,
      };
    }
  }

  // 6. Build the WhatsApp link
  const message = buildWhatsAppMessage({
    orderNumber: order.order_number,
    customerName: input.customer.full_name,
    items: input.items,
    subtotal,
    address: input.customer.address,
    notes: input.customer.notes,
  });

  const whatsappLink = `https://wa.me/${chosenNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    message
  )}`;

  return { ok: true, orderNumber: order.order_number, whatsappLink };
}
