import Link from "next/link";
import HomeWhyChooseUs from "@/components/home/HomeWhyChooseUs";
import ProductCard from "@/components/ProductCard";
import {
  getHomeCategoryCards,
  getHomeLatestProducts,
} from "@/lib/data/home";

export default async function HomeCatalogSections() {
  const [newArrivals, categoryCards] = await Promise.all([
    getHomeLatestProducts(),
    getHomeCategoryCards(),
  ]);

  return (
    <>
      {newArrivals.length > 0 && (
        <section className="py-10 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-10">
              <h2 className="text-xl font-bold text-foreground sm:text-3xl">
                New Arrivals
              </h2>
              <p className="mt-1 text-xs text-muted sm:mt-2 sm:text-sm">
                Fresh additions to our collection
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
              {newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                View More
                <svg
                  className="h-4 w-4"
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

      <HomeWhyChooseUs />

      {categoryCards.length > 0 && (
        <section className="bg-[#fdf2f0] py-10 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-10">
              <h2 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-3xl">
                Shop by Category
              </h2>
              <p className="mt-1 text-xs text-muted sm:mt-2 sm:text-sm">
                Browse our curated collections
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {categoryCards.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group block"
                >
                  <div
                    className="rounded-xl border border-white/80 bg-white p-2 shadow-sm transition-all duration-500
                               hover:-translate-y-1 hover:shadow-xl sm:rounded-2xl sm:p-3"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-50 sm:rounded-xl">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105
                          ${cat.count === 0 ? "opacity-60 grayscale-[30%]" : ""}`}
                        loading="lazy"
                      />
                      {cat.count === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <span
                            className="rounded-full border border-brand/20 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase
                                       tracking-wider text-brand shadow-md backdrop-blur-sm sm:text-xs"
                          >
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pb-1 pt-2.5 text-center sm:pt-3">
                      <h3 className="text-xs font-bold leading-tight text-foreground transition-colors group-hover:text-brand sm:text-sm">
                        {cat.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-muted sm:text-xs">
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
    </>
  );
}
