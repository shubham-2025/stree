import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) return { title: "Product Not Found" };
  return {
    title: `${data.title} — स्त्री`,
    description: data.description || `Buy ${data.title} at स्त्री`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) notFound();

  const product = data as Product;
  const discount = product.mrp
    ? getDiscountPercent(product.price, product.mrp)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav className="text-xs sm:text-sm text-muted mb-4 sm:mb-6 overflow-hidden">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <span className="mx-1.5 sm:mx-2">›</span>
        <Link href="/shop" className="hover:text-brand">
          Shop
        </Link>
        <span className="mx-1.5 sm:mx-2">›</span>
        <span className="text-foreground line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Images */}
        <ImageGallery images={product.images} title={product.title} />

        {/* Info */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-medium text-muted bg-surface-alt px-2 py-1 rounded">
              {product.category}
            </span>
            {product.fabric && (
              <span className="text-[10px] sm:text-xs font-medium text-muted bg-surface-alt px-2 py-1 rounded">
                {product.fabric}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 sm:mt-6 flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-brand">
              {formatPrice(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-base sm:text-lg text-muted line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mt-3">
            {product.stock_qty > 0 ? (
              <span className="text-sm text-green-600 font-medium">
                ✓ In Stock ({product.stock_qty} available)
              </span>
            ) : (
              <span className="text-sm text-red-600 font-medium">
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Details
            </h3>
            <dl className="text-sm space-y-2">
              <div className="flex">
                <dt className="w-24 text-muted">Category</dt>
                <dd className="text-foreground">{product.category}</dd>
              </div>
              {product.fabric && (
                <div className="flex">
                  <dt className="w-24 text-muted">Fabric</dt>
                  <dd className="text-foreground">{product.fabric}</dd>
                </div>
              )}
              {product.colors.length > 0 && (
                <div className="flex">
                  <dt className="w-24 text-muted">Colors</dt>
                  <dd className="text-foreground">
                    {product.colors.join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* COD badge */}
          <div className="mt-6 bg-surface-alt rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted">
                Pay when you receive your order
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

