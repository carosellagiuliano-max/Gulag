"use server";

import Stripe from "stripe";

import { DEFAULT_SALON_ID } from "@/lib/constants";
import { getServiceSupabaseClient } from "@/lib/supabase-admin";

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

type ProductRow = {
  id: string;
  name: string;
  price_cents: number | null;
  currency: string | null;
  sku: string | null;
  stock: number | null;
};

type CheckoutResult = { url?: string; error?: string };

export async function startCheckout(
  items: CheckoutItem[],
  email: string,
  customerId?: string | null
): Promise<CheckoutResult> {
  if (!items || items.length === 0) {
    return { error: "Warenkorb ist leer" };
  }

  if (!email) {
    return { error: "E-Mail erforderlich" };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return { error: "Stripe ist nicht konfiguriert" };
  }

  const supabase = getServiceSupabaseClient();
  if (!supabase) {
    return { error: "Supabase Service Key fehlt" };
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  const uniqueIds = [...new Set(items.map((item) => item.productId))];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, price_cents, currency, sku, stock")
    .in("id", uniqueIds)
    .eq("salon_id", DEFAULT_SALON_ID)
    .eq("active", true);

  if (productError || !products || products.length === 0) {
    return { error: "Produkte konnten nicht geladen werden" };
  }

  type ValidatedItem = { product: ProductRow; quantity: number; subtotal: number };

  const validated = items
    .map((item) => {
      const product = (products as ProductRow[]).find((p) => p.id === item.productId);
      if (!product) return null;
      const quantity = Math.max(1, Math.min(item.quantity, product.stock ?? 0));
      if (quantity === 0) return null;
      return {
        product,
        quantity,
        subtotal: quantity * (product.price_cents ?? 0),
      } satisfies ValidatedItem;
    })
    .filter(Boolean) as ValidatedItem[];

  if (validated.length === 0) {
    return { error: "Keine gültigen Produkte im Warenkorb" };
  }

  const currency = validated[0].product.currency ?? "CHF";
  const totalCents = validated.reduce((sum, entry) => sum + entry.subtotal, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      salon_id: DEFAULT_SALON_ID,
      customer_id: customerId ?? null,
      email,
      status: "pending",
      total_cents: totalCents,
      currency,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Bestellung konnte nicht erstellt werden" };
  }

  const orderItems = validated.map((entry) => ({
    order_id: order.id,
    product_id: entry.product.id,
    name: entry.product.name,
    sku: entry.product.sku,
    quantity: entry.quantity,
    unit_price_cents: entry.product.price_cents ?? 0,
    currency: entry.product.currency ?? currency,
    subtotal_cents: entry.subtotal,
  }));

  const { error: itemError } = await supabase.from("order_items").insert(orderItems);
  if (itemError) {
    return { error: "Bestellpositionen konnten nicht gespeichert werden" };
  }

  await Promise.all(
    validated.map((entry) =>
      supabase
        .from("products")
        .update({ stock: Math.max(0, (entry.product.stock ?? 0) - entry.quantity) })
        .eq("id", entry.product.id)
    )
  );

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: validated.map((entry) => ({
      quantity: entry.quantity,
      price_data: {
        currency,
        unit_amount: entry.product.price_cents ?? 0,
        product_data: {
          name: entry.product.name,
          metadata: { sku: entry.product.sku ?? "" },
        },
      },
    })),
    success_url: `${origin}/shop/success?orderId=${order.id}`,
    cancel_url: `${origin}/shop`,
    metadata: { order_id: order.id },
  });

  await supabase
    .from("orders")
    .update({ stripe_session_id: session.id, status: "requires_payment" })
    .eq("id", order.id);

  return { url: session.url ?? `${origin}/shop` };
}
