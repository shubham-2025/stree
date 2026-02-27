"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { FABRICS, COLORS } from "@/lib/constants";

interface FilterSidebarProps {
  categories?: string[];
}

export default function FilterSidebar({ categories = [] }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentFabric = searchParams.get("fabric") || "";
  const currentColor = searchParams.get("color") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("inStock") === "true";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/shop");
  }, [router]);

  const hasFilters =
    currentCategory ||
    currentFabric ||
    currentColor ||
    currentMinPrice ||
    currentMaxPrice ||
    currentInStock;

  const filterContent = (
    <div className="space-y-6">
      {/* Clear All */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs text-brand font-medium hover:underline"
        >
          Clear All Filters
        </button>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Category
          </h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  checked={currentCategory === cat}
                  onChange={() =>
                    updateFilter(
                      "category",
                      currentCategory === cat ? "" : cat
                    )
                  }
                  className="accent-brand"
                />
                <span className="text-sm text-foreground">{cat}</span>
              </label>
            ))}
            {currentCategory && (
              <button
                onClick={() => updateFilter("category", "")}
                className="text-xs text-muted hover:text-brand"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fabric */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Fabric</h4>
        <div className="space-y-2">
          {FABRICS.map((fab) => (
            <label key={fab} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="fabric"
                checked={currentFabric === fab}
                onChange={() =>
                  updateFilter("fabric", currentFabric === fab ? "" : fab)
                }
                className="accent-brand"
              />
              <span className="text-sm text-foreground">{fab}</span>
            </label>
          ))}
          {currentFabric && (
            <button
              onClick={() => updateFilter("fabric", "")}
              className="text-xs text-muted hover:text-brand"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Color */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() =>
                updateFilter("color", currentColor === c.name ? "" : c.name)
              }
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                currentColor === c.name
                  ? "border-brand scale-110 ring-2 ring-brand/30"
                  : "border-border hover:scale-105"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        {currentColor && (
          <p className="text-xs text-muted mt-2">
            Selected: {currentColor}{" "}
            <button
              onClick={() => updateFilter("color", "")}
              className="text-brand hover:underline ml-1"
            >
              Clear
            </button>
          </p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Price Range (₹)
        </h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={() =>
              updateFilter("inStock", currentInStock ? "" : "true")
            }
            className="accent-brand w-4 h-4"
          />
          <span className="text-sm text-foreground">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium
                   hover:border-brand transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
        Filters
        {hasFilters && (
          <span className="bg-brand text-white text-xs px-1.5 py-0.5 rounded-full">
            !
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4">Filters</h3>
          {filterContent}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-foreground">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5">{filterContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
