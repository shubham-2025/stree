import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch latest 6 products for new arrivals
  const { data: latestProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("stock_qty", 0)
    .order("created_at", { ascending: false })
    .limit(6);

  const newArrivals: Product[] = (latestProducts as Product[]) || [];

  // ---- SHOP BY CATEGORY: always show all predefined + any extra DB categories ----
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

  // Fetch distinct categories that have active products in DB
  const { data: catData } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .gt("stock_qty", 0)
    .not("category", "is", null);

  const dbCategories = catData
    ? Array.from(new Set(catData.map((d: { category: string }) => d.category)))
    : [];

  // Merge: all predefined categories ALWAYS shown + any extra custom DB categories
  const allCategoryNames = Array.from(
    new Set([...CATEGORIES, ...dbCategories])
  );

  // For each category, fetch product image + count
  const categoryCards: { name: string; image: string; count: number }[] = [];
  for (const cat of allCategoryNames) {
    const { data: catProds, count } = await supabase
      .from("products")
      .select("images", { count: "exact" })
      .eq("is_active", true)
      .eq("category", cat)
      .gt("stock_qty", 0)
      .order("created_at", { ascending: false })
      .limit(1);

    const hasRealImage =
      catProds && catProds.length > 0 && catProds[0].images?.length > 0;
    const img = hasRealImage
      ? catProds[0].images[0]
      : categoryPlaceholders[cat] || "/placeholder.svg";

    categoryCards.push({ name: cat, image: img, count: count ?? 0 });
  }

  // Build carousel slides from first 3 products with images
  const slideSources = newArrivals.filter(
    (p) => p.images && p.images.length > 0
  );
  const heroSlides =
    slideSources.length >= 3
      ? [
          {
            image: slideSources[0].images[0],
            title: slideSources[0].title,
            subtitle: `Starting at ${formatPrice(slideSources[0].price)}`,
          },
          {
            image: slideSources[1].images[0],
            title: slideSources[1].title,
            subtitle: `Starting at ${formatPrice(slideSources[1].price)}`,
          },
          {
            image: slideSources[2].images[0],
            title: slideSources[2].title,
            subtitle: `Starting at ${formatPrice(slideSources[2].price)}`,
          },
        ]
      : slideSources.map((p) => ({
          image: p.images[0],
          title: p.title,
          subtitle: `Starting at ${formatPrice(p.price)}`,
        }));

  return (
    <>
      {/* ===== SECTION 1: HERO WITH SLIDER ===== */}
      <section className="bg-[#fce8e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
                Effortless Elegance for Your Everyday Look
              </h1>
              <p className="mt-3 sm:mt-4 text-xs sm:text-base text-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                Discover our exquisite collection of handpicked sarees, crafted
                with premium fabrics and woven with love. From traditional
                Banarasi to modern party wear — find your perfect drape.
              </p>
              <div className="mt-5 sm:mt-8 flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/shop"
                  className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 bg-brand text-white font-semibold
                             rounded-full hover:bg-brand-dark transition-all text-xs sm:text-sm shadow-lg shadow-brand/25"
                >
                  Shop Now
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-foreground text-foreground font-semibold
                             rounded-full hover:bg-foreground hover:text-white transition-all text-xs sm:text-sm"
                >
                  Explore
                </Link>
              </div>
            </div>

            {/* Right: Image carousel */}
            <div className="order-1 lg:order-2 w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-[3/4] max-h-[350px] sm:max-h-[500px] relative">
              {heroSlides.length > 0 ? (
                <HeroCarousel slides={heroSlides} />
              ) : (
                <div className="w-full h-full bg-white/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl sm:text-6xl block mb-3 sm:mb-4">🧵</span>
                    <p className="text-brand font-semibold text-sm sm:text-base">
                      Beautiful sarees coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: NEW ARRIVALS ===== */}
      {newArrivals.length > 0 && (
        <section className="py-10 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-10">
              <h2 className="text-xl sm:text-3xl font-bold text-foreground">
                New Arrivals
              </h2>
              <p className="text-muted text-xs sm:text-sm mt-1 sm:mt-2">
                Fresh additions to our collection
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:underline"
              >
                View More
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION 3: WHY CHOOSE US ===== */}
      <section className="bg-white py-10 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-foreground">
              Why Choose Us
            </h2>
            <p className="text-muted text-xs sm:text-sm mt-1 sm:mt-2">
              What makes स्त्री special
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {/* Feature 1 */}
            <div className="bg-surface-alt rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-border hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-8 sm:h-8 text-brand"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-xs sm:text-base">Premium Quality</h3>
              <p className="text-[10px] sm:text-sm text-muted leading-relaxed">
                Every saree is handpicked for quality. Authentic fabrics and
                exquisite weaving guaranteed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-alt rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-border hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-8 sm:h-8 text-brand"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-xs sm:text-base">Free Shipping</h3>
              <p className="text-[10px] sm:text-sm text-muted leading-relaxed">
                Free delivery across India on every order. No minimum purchase
                required. Fast and reliable.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-alt rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-border hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-8 sm:h-8 text-brand"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-xs sm:text-base">
                Cash on Delivery
              </h3>
              <p className="text-[10px] sm:text-sm text-muted leading-relaxed">
                Pay comfortably when your saree arrives at your doorstep. Zero
                risk, zero worry shopping.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-alt rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border border-border hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <svg
                  className="w-5 h-5 sm:w-8 sm:h-8 text-brand"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1 sm:mb-2 text-xs sm:text-base">Wide Variety</h3>
              <p className="text-[10px] sm:text-sm text-muted leading-relaxed">
                From Silk to Cotton, Banarasi to Paithani — explore a vast range
                of traditional and modern sarees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: SHOP BY CATEGORY ===== */}
      {categoryCards.length > 0 && (
        <section className="py-10 sm:py-20 bg-[#fdf2f0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-10">
              <h2 className="text-xl sm:text-3xl font-bold text-foreground uppercase tracking-wide">
                Shop by Category
              </h2>
              <p className="text-muted text-xs sm:text-sm mt-1 sm:mt-2">
                Browse our curated collections
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {categoryCards.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group block"
                >
                  {/* Card with frame effect */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-sm hover:shadow-xl
                                  transition-all duration-500 hover:-translate-y-1 border border-white/80">
                    {/* Image */}
                    <div className="aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 relative">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className={`w-full h-full object-cover transition-transform duration-700
                                   group-hover:scale-105 ${cat.count === 0 ? "opacity-60 grayscale-[30%]" : ""}`}
                        loading="lazy"
                      />
                      {/* Coming Soon badge */}
                      {cat.count === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <span className="bg-white/95 backdrop-blur-sm text-brand font-bold text-[10px] sm:text-xs
                                           px-3 py-1.5 rounded-full shadow-md border border-brand/20 uppercase tracking-wider">
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category info below image */}
                    <div className="pt-2.5 sm:pt-3 pb-1 text-center">
                      <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-brand transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted mt-0.5">
                        {cat.count > 0
                          ? `${cat.count} ${cat.count === 1 ? "Product" : "Products"}`
                          : "Coming Soon"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== SECTION 5: OUR STORY ===== */}
      <section className="py-10 sm:py-20 bg-[#f9f9f9] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left: Single image with decorative dots on top-right */}
            <div className="relative">
              {/* Dots on top-right of image */}
              <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 pointer-events-none z-10">
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-[4px] sm:gap-[6px]">
                  {[...Array(36)].map((_, i) => (
                    <span
                      key={`dot-img-${i}`}
                      className="w-1 h-1 sm:w-[5px] sm:h-[5px] rounded-full bg-brand/30"
                    />
                  ))}
                </div>
              </div>

              <div className="relative aspect-[4/5] max-w-xs sm:max-w-md mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/Bridesmaid outfits.jpg"
                  alt="Our Story — स्त्री"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right: Text content */}
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6 mt-6 lg:mt-0">
                Our Story
              </h2>
              <p className="text-muted text-xs sm:text-base leading-relaxed mb-5 sm:mb-8">
                We started with a simple dream — to bring the timeless charm of
                sarees to women everywhere. From a small beginning, our passion
                for quality fabrics and authentic craftsmanship has grown into a
                trusted saree destination. Every saree in our collection is a
                blend of tradition and modern style, made to celebrate your
                unique moments.
              </p>

              {/* 2×2 bullet points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-5">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 sm:mt-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand shrink-0" />
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    We began as a small boutique, dedicated to offering authentic
                    sarees crafted with care and tradition.
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 sm:mt-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand shrink-0" />
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    We choose only premium fabrics and skilled craftsmanship.
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 sm:mt-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand shrink-0" />
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    Designs that respect heritage while embracing contemporary
                    fashion.
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 sm:mt-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-brand shrink-0" />
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    Expanded with the trust and love of our valued customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
