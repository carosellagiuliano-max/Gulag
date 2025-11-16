import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

import { DEFAULT_SALON_ID } from "@/lib/constants";
import { formatPrice } from "@/lib/marketing-content";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  stock: number;
  sku?: string | null;
  featured: boolean;
  imageUrl?: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  price_cents?: number | null;
  currency?: string | null;
  stock?: number | null;
  sku?: string | null;
  featured?: boolean | null;
  product_images?: { image_url?: string | null; position?: number | null }[] | null;
};

const fallbackProducts: Product[] = [
  {
    id: "fallback-1",
    name: "Repair & Shine Shampoo",
    slug: "repair-shine-shampoo",
    description: "Sanfte Reinigung mit Proteinen und Glanz-Booster, ideal nach Farbservices.",
    priceCents: 3400,
    currency: "CHF",
    stock: 12,
    sku: "SW-SHAMPOO-01",
    featured: true,
    imageUrl: "/window.svg",
  },
  {
    id: "fallback-2",
    name: "Hydrate Leave-In Mist",
    slug: "hydrate-leave-in-mist",
    description: "Leichter Feuchtigkeits-Spray mit Hitzeschutz für tägliches Styling.",
    priceCents: 2900,
    currency: "CHF",
    stock: 20,
    sku: "SW-LEAVEIN-01",
    featured: true,
    imageUrl: "/globe.svg",
  },
  {
    id: "fallback-3",
    name: "Volume Root Lift",
    slug: "volume-root-lift",
    description: "Ansatzspray für feines Haar, langanhaltendes Volumen ohne zu beschweren.",
    priceCents: 3200,
    currency: "CHF",
    stock: 8,
    sku: "SW-VOLUME-01",
    featured: false,
    imageUrl: "/next.svg",
  },
];

function getAnonSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = getAnonSupabaseClient();

  if (!supabase) {
    return fallbackProducts;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, price_cents, currency, stock, sku, featured, product_images (image_url, position)")
      .eq("salon_id", DEFAULT_SALON_ID)
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch products", error);
      return fallbackProducts;
    }

    const productRows = (data ?? []) as ProductRow[];

    return productRows.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug ?? product.id,
      description: product.description ?? "",
      priceCents: product.price_cents ?? 0,
      currency: product.currency ?? "CHF",
      stock: product.stock ?? 0,
      sku: product.sku,
      featured: product.featured ?? false,
      imageUrl: Array.isArray(product.product_images)
        ? product.product_images.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.image_url ?? undefined
        : undefined,
    }));
  } catch (error) {
    console.error("Failed to load products from Supabase", error);
    return fallbackProducts;
  }
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = getAnonSupabaseClient();

  if (!supabase) {
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, price_cents, currency, stock, sku, featured, product_images (image_url, position)")
      .eq("salon_id", DEFAULT_SALON_ID)
      .eq("active", true)
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return fallbackProducts.find((p) => p.slug === slug) ?? null;
    }

    const product = data as ProductRow;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug ?? product.id,
      description: product.description ?? "",
      priceCents: product.price_cents ?? 0,
      currency: product.currency ?? "CHF",
      stock: product.stock ?? 0,
      sku: product.sku,
      featured: product.featured ?? false,
      imageUrl: Array.isArray(product.product_images)
        ? product.product_images.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.image_url ?? undefined
        : undefined,
    };
  } catch (error) {
    console.error("Failed to load product from Supabase", error);
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }
});

export function formatMoneyLabel(priceCents: number, currency: string) {
  return formatPrice(priceCents, currency);
}
