import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, getDiscountPercent } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.mrp
    ? getDiscountPercent(product.price, product.mrp)
    : 0;
  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder.svg";

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-surface-alt block"
      >
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg">
            {discount}% OFF
          </span>
        )}
        {product.images.length > 1 && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/50 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-sm">
            {product.images.length} photos
          </span>
        )}
        {product.stock_qty <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-foreground text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 group-hover:text-brand transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>
        <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">{product.category}</p>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-brand">
            {formatPrice(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[10px] sm:text-xs text-muted line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {/* Color dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mt-1.5 sm:mt-2">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                title={c}
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border"
                style={{ backgroundColor: getColorHex(c) }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] sm:text-xs text-muted self-center">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-auto pt-2 sm:pt-3">
          <Link
            href={`/product/${product.slug}`}
            className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5
                       bg-foreground text-white text-[10px] sm:text-xs font-semibold rounded-lg sm:rounded-xl
                       hover:bg-brand transition-colors duration-200"
          >
            View Details
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  Red: "#DC2626",
  Maroon: "#7F1D1D",
  Pink: "#EC4899",
  Orange: "#EA580C",
  Yellow: "#EAB308",
  Green: "#16A34A",
  Blue: "#2563EB",
  Navy: "#1E3A5F",
  Purple: "#9333EA",
  Gold: "#B8860B",
  Black: "#171717",
  White: "#FFFFFF",
  Cream: "#FFFDD0",
  Beige: "#F5F5DC",
};

function getColorHex(name: string): string {
  return COLOR_MAP[name] || "#999";
}
