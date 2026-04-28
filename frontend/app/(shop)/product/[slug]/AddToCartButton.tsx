"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useFavourites } from "@/components/FavouritesProvider";
import { useToast } from "@/components/ToastProvider";
import { startGlobalLoader } from "@/components/GlobalActivityLoader";
import type { Product } from "@/lib/types";
import { COLORS } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isFavourite, toggleFavourite } = useFavourites();
  const { showToast } = useToast();
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState(
    product.colors.length > 0 ? product.colors[0] : ""
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const colorMap = Object.fromEntries(COLORS.map((c) => [c.name, c.hex]));
  const isFav = isFavourite(product.id);

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      qty,
      color: selectedColor,
      image: product.images[0] || "/placeholder.svg",
      slug: product.slug,
    });
    setAdded(true);
    showToast("Added to cart", "success");
    setTimeout(() => setAdded(false), 3000);
  };

  const handleBuyNow = () => {
    startGlobalLoader();
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      qty,
      color: selectedColor,
      image: product.images[0] || "/placeholder.svg",
      slug: product.slug,
    });
    showToast("Proceeding to checkout", "info");
    router.push("/checkout");
  };

  const outOfStock = product.stock_qty <= 0;

  return (
    <div className="space-y-4">
      {/* Color selector */}
      {product.colors.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Color:{" "}
            <span className="text-muted font-normal">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                title={c}
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  selectedColor === c
                    ? "border-brand scale-110 ring-2 ring-brand/30"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: colorMap[c] || "#999" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Quantity
        </label>
        <div className="flex items-center border border-border rounded-xl w-fit">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 hover:bg-surface-alt transition-colors text-lg rounded-l-xl"
          >
            −
          </button>
          <span className="px-5 py-2.5 text-sm font-semibold min-w-[48px] text-center border-x border-border">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2.5 hover:bg-surface-alt transition-colors text-lg rounded-r-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex gap-3">
        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
            outOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : added
              ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
              : "bg-brand text-white hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/25"
          }`}
        >
          {outOfStock
            ? "Out of Stock"
            : added
            ? "✓ Added to Cart!"
            : "🛒 Add to Cart"}
        </button>

        {/* Favourite button */}
        <button
          onClick={() => {
            toggleFavourite(product.id);
            showToast(
              isFav ? "Removed from favourites" : "Added to favourites",
              "info"
            );
          }}
          className={`w-14 rounded-xl border-2 flex items-center justify-center transition-all ${
            isFav
              ? "border-brand bg-brand-50 text-brand"
              : "border-border text-muted hover:border-brand hover:text-brand"
          }`}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isFav ? 0 : 1.5}
            className={`w-6 h-6 transition-transform ${isFav ? "scale-110" : "hover:scale-110"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312
                 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3
                 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>
      </div>

      {!outOfStock && (
        <button
          onClick={handleBuyNow}
          className="w-full rounded-xl border-2 border-brand py-3 text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-white"
        >
          Buy Now
        </button>
      )}

      {/* View Cart link (shows after adding) */}
      {added && (
        <Link
          href="/cart"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl
                     border-2 border-foreground text-foreground text-sm font-semibold
                     hover:bg-foreground hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993
                 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0
                 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576
                 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75
                 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0
                 .375.375 0 0 1 .75 0Z" />
          </svg>
          View Cart →
        </Link>
      )}
    </div>
  );
}
