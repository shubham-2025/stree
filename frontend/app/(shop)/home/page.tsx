import Link from "next/link";
import { Suspense } from "react";
import HomeCarouselCell from "./HomeCarouselCell";
import HomeCatalogSections from "./HomeCatalogSections";

export const revalidate = 60;

/** Solid placeholders only — no pulse/spinner so they don’t clash with real content. */
function CarouselSkeleton() {
  return (
    <div
      className="h-full min-h-[200px] w-full rounded-2xl bg-white/70"
      aria-hidden
    />
  );
}

function CatalogSkeleton() {
  return (
    <div aria-hidden>
      <section className="py-10 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-8 w-44 rounded-md bg-border/50 sm:mb-10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-border/40" />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-10 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-48 rounded-md bg-border/50 sm:mb-12" />
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-surface-alt/80 p-6"
              >
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-border/40" />
                <div className="mx-auto mb-2 h-4 w-24 rounded bg-border/40" />
                <div className="h-10 rounded bg-border/30" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#fdf2f0] py-10 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 h-8 w-56 rounded-md bg-border/40 sm:mb-10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/5] rounded-xl bg-white/70" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="bg-[#fce8e4]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <h1 className="text-2xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                Effortless Elegance for Your Everyday Look
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-muted sm:mt-4 sm:text-base lg:mx-0">
                Discover our exquisite collection of handpicked sarees, crafted
                with premium fabrics and woven with love. From traditional
                Banarasi to modern party wear — find your perfect drape.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4 lg:justify-start">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-white shadow-lg
                             shadow-brand/25 transition-all hover:bg-brand-dark sm:px-8 sm:py-3 sm:text-sm"
                >
                  Shop Now
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="inline-flex items-center rounded-full border-2 border-foreground px-6 py-2.5 text-xs font-semibold
                             text-foreground transition-all hover:bg-foreground hover:text-white sm:px-8 sm:py-3 sm:text-sm"
                >
                  Explore
                </Link>
              </div>
            </div>

            <div className="relative order-1 aspect-[4/3] max-h-[350px] w-full sm:aspect-[4/3] sm:max-h-[500px] lg:order-2 lg:aspect-[3/4]">
              <Suspense fallback={<CarouselSkeleton />}>
                <HomeCarouselCell />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <HomeCatalogSections />
      </Suspense>

      <section className="relative overflow-hidden bg-[#f9f9f9] py-10 sm:py-20">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-20">
            <div className="relative">
              <div className="pointer-events-none absolute -right-3 -top-3 z-10 sm:-right-6 sm:-top-6">
                <div className="grid grid-cols-6 gap-[4px] sm:grid-cols-8 sm:gap-[6px]">
                  {[...Array(36)].map((_, i) => (
                    <span
                      key={`dot-img-${i}`}
                      className="h-1 w-1 rounded-full bg-brand/30 sm:h-[5px] sm:w-[5px]"
                    />
                  ))}
                </div>
              </div>

              <div className="relative mx-auto aspect-[4/5] max-w-xs overflow-hidden rounded-xl shadow-2xl sm:max-w-md sm:rounded-2xl">
                <img
                  src="/Bridesmaid outfits.jpg"
                  alt="Our Story — स्त्री"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 mt-6 text-xl font-bold text-foreground sm:mb-6 sm:text-3xl lg:mt-0">
                Our Story
              </h2>
              <p className="mb-5 text-xs leading-relaxed text-muted sm:mb-8 sm:text-base">
                We started with a simple dream — to bring the timeless charm of
                sarees to women everywhere. From a small beginning, our passion
                for quality fabrics and authentic craftsmanship has grown into a
                trusted saree destination. Every saree in our collection is a
                blend of tradition and modern style, made to celebrate your
                unique moments.
              </p>

              <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 sm:gap-y-5">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand sm:mt-1.5 sm:h-2.5 sm:w-2.5" />
                  <p className="text-xs leading-relaxed text-muted sm:text-sm">
                    We began as a small boutique, dedicated to offering authentic
                    sarees crafted with care and tradition.
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand sm:mt-1.5 sm:h-2.5 sm:w-2.5" />
                  <p className="text-xs leading-relaxed text-muted sm:text-sm">
                    We choose only premium fabrics and skilled craftsmanship.
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand sm:mt-1.5 sm:h-2.5 sm:w-2.5" />
                  <p className="text-xs leading-relaxed text-muted sm:text-sm">
                    Designs that respect heritage while embracing contemporary
                    fashion.
                  </p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand sm:mt-1.5 sm:h-2.5 sm:w-2.5" />
                  <p className="text-xs leading-relaxed text-muted sm:text-sm">
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
