import { cache } from "react";
import { createPublicReadClient } from "@/lib/supabase/public-read";
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

function fallbackCategoryCards() {
  return CATEGORIES.map((name) => ({
    name,
    image: categoryPlaceholders[name] || "/placeholder.svg",
    count: 0,
  }));
}

export const getHomeLatestProducts = cache(async (): Promise<Product[]> => {
  try {
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .gt("stock_qty", 0)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[stree] home latest products:", error.message);
      return [];
    }
    return (data as Product[]) || [];
  } catch (e) {
    console.error("[stree] home latest products:", e);
    return [];
  }
});

export const getHomeCategoryCards = cache(
  async (): Promise<{ name: string; image: string; count: number }[]> => {
    try {
      const supabase = createPublicReadClient();
      const { data: catRows, error: catErr } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true)
        .gt("stock_qty", 0)
        .not("category", "is", null);

      if (catErr) {
        console.error("[stree] home categories:", catErr.message);
        return fallbackCategoryCards();
      }

      const counts = new Map<string, number>();
      for (const row of catRows || []) {
        const c = (row as { category: string }).category;
        counts.set(c, (counts.get(c) || 0) + 1);
      }

      const dbCategories = Array.from(counts.keys());
      const allCategoryNames = Array.from(
        new Set([...CATEGORIES, ...dbCategories])
      );

      const previews = await Promise.all(
        allCategoryNames.map(async (cat) => {
          const { data: top, error: topErr } = await supabase
            .from("products")
            .select("images")
            .eq("is_active", true)
            .eq("category", cat)
            .gt("stock_qty", 0)
            .order("created_at", { ascending: false })
            .limit(1);

          if (topErr) {
            console.error("[stree] home category preview:", cat, topErr.message);
          }

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
    } catch (e) {
      console.error("[stree] home category cards:", e);
      return fallbackCategoryCards();
    }
  }
);
