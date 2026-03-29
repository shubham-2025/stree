import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/lib/types";

const categoryPlaceholders: Record<string, string> = {
  Silk: "/categories/silk.svg",
  Cotton: "/categories/cotton.svg",
  "Party Wear": "/categories/party-wear.svg",
  Casual: "/categories/casual.svg",
  Banarasi: "/categories/banarasi.svg",
  Chanderi: "/categories/chanderi.svg",
  Paithani: "/categories/paithani.svg",
  Tussar: "/categories/tussar.svg",
};

export const getHomeLatestProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("stock_qty", 0)
    .order("created_at", { ascending: false })
    .limit(6);
  return (data as Product[]) || [];
});

export const getHomeCategoryCards = cache(
  async (): Promise<{ name: string; image: string; count: number }[]> => {
    const supabase = await createClient();
    // Light query: only category strings (avoids shipping every product's images JSON).
    const { data: catRows } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true)
      .gt("stock_qty", 0)
      .not("category", "is", null);

    const counts = new Map<string, number>();
    for (const row of catRows || []) {
      const c = (row as { category: string }).category;
      counts.set(c, (counts.get(c) || 0) + 1);
    }

    const dbCategories = Array.from(counts.keys());
    const allCategoryNames = Array.from(
      new Set([...CATEGORIES, ...dbCategories])
    );

    // One small query per category, all in parallel (same latency as one round-trip).
    const previews = await Promise.all(
      allCategoryNames.map(async (cat) => {
        const { data: top } = await supabase
          .from("products")
          .select("images")
          .eq("is_active", true)
          .eq("category", cat)
          .gt("stock_qty", 0)
          .order("created_at", { ascending: false })
          .limit(1);

        const row = top?.[0] as { images: string[] | null } | undefined;
        const hasRealImage = row?.images && row.images.length > 0;
        const count = counts.get(cat) ?? 0;
        const img = hasRealImage
          ? row!.images![0]
          : categoryPlaceholders[cat] || "/placeholder.svg";
        return { name: cat, image: img, count };
      })
    );

    return previews;
  }
);
