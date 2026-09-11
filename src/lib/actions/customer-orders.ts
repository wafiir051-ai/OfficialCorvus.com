"use server";

import { createClient } from "@/lib/supabase/server";

export type CustomerOrderSummary = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  created_at: string;
  tracking_number: string | null;
};

export async function getMyOrders(): Promise<CustomerOrderSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!customer) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal, created_at, tracking_number")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  return orders ?? [];
}

export type CustomerOrderDetail = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  notes: string | null;
  created_at: string;
  courier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  items: {
    id: string;
    product_name_snapshot: string;
    size_snapshot: string;
    color_snapshot: string;
    unit_price: number;
    quantity: number;
  }[];
};

export async function getMyOrderDetail(
  orderId: string
): Promise<CustomerOrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, subtotal, notes, created_at, courier, tracking_number, shipped_at"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_name_snapshot, size_snapshot, color_snapshot, unit_price, quantity")
    .eq("order_id", orderId);

  return { ...order, items: items ?? [] };
}
