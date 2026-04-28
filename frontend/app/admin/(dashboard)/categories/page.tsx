import { createClient } from "@/lib/supabase/server";
import CategoryManager from "./CategoryManager";
import { CATEGORIES } from "@/lib/constants";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: managedData } = await supabase
    .from("site_categories")
    .select("name")
    .order("name", { ascending: true });

  const { data: productCategoryRows } = await supabase
    .from("products")
    .select("category")
    .order("category", { ascending: true });

  const counts = new Map<string, number>();
  for (const row of productCategoryRows || []) {
    const category = row.category?.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  const managedSet = new Set((managedData || []).map((row) => row.name));
  const allCategoryNames = Array.from(
    new Set([
      ...CATEGORIES,
      ...Array.from(managedSet),
      ...Array.from(counts.keys()),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const categories = allCategoryNames.map((name) => ({
    name,
    productCount: counts.get(name) || 0,
    managed: managedSet.has(name),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site Categories</h1>
        <p className="text-sm text-muted">
          Manage categories shown in home page curated collections.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
