import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import type { Product } from "@/lib/types";
import { ITEMS_PER_PAGE, CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import ShopSearch from "./ShopSearch";
import SortSelect from "./SortSelect";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    fabric?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch distinct categories from DB (merges with defaults)
  const { data: catData } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const dbCategories = catData
    ? Array.from(new Set(catData.map((d: { category: string }) => d.category)))
    : [];
  const allCategories = Array.from(
    new Set([...CATEGORIES, ...dbCategories])
  ).sort();

  const page = parseInt(params.page || "1");
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.fabric) {
    query = query.eq("fabric", params.fabric);
  }
  if (params.color) {
    query = query.contains("colors", [params.color]);
  }
  if (params.minPrice) {
    query = query.gte("price", parseInt(params.minPrice));
  }
  if (params.maxPrice) {
    query = query.lte("price", parseInt(params.maxPrice));
  }
  if (params.inStock === "true") {
    query = query.gt("stock_qty", 0);
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, count } = await query;
  const products: Product[] = (data as Product[]) || [];
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shop Sarees</h1>
        <p className="text-muted text-xs sm:text-sm mt-1">
          {count || 0} product{count !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="lg:flex gap-8">
        {/* Sidebar with dynamic categories */}
        <FilterSidebar categories={allCategories} />

        {/* Main content */}
        <div className="flex-1 mt-4 lg:mt-0">
          {/* Search + Sort */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <ShopSearch />
            <SortSelect />
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              {params.category ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 bg-brand-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-brand">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Coming Soon!</h3>
                  <p className="text-muted text-sm max-w-sm mx-auto">
                    We&apos;re curating the best <span className="font-semibold text-brand">{params.category}</span> sarees for you. Check back soon for exciting new arrivals!
                  </p>
                  <Link href="/shop" className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-full hover:bg-brand-dark transition-colors">
                    Browse All Sarees
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-lg text-muted">No products found.</p>
                  <p className="text-sm text-muted mt-1">
                    Try adjusting your filters or search query.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              {page > 1 && (
                <PaginationLink
                  page={page - 1}
                  params={params}
                  label="← Prev"
                />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  page={p}
                  params={params}
                  label={String(p)}
                  active={p === page}
                />
              ))}
              {page < totalPages && (
                <PaginationLink
                  page={page + 1}
                  params={params}
                  label="Next →"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaginationLink({
  page,
  params,
  label,
  active,
}: {
  page: number;
  params: Record<string, string | undefined>;
  label: string;
  active?: boolean;
}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && k !== "page") sp.set(k, v);
  });
  sp.set("page", String(page));

  return (
    <Link
      href={`/shop?${sp.toString()}`}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-brand text-white"
          : "bg-surface-alt text-foreground hover:bg-brand-50 border border-border"
      }`}
    >
      {label}
    </Link>
  );
}
