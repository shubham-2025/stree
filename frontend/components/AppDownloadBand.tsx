import Link from "next/link";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.streesarees.mobile";

/**
 * Mid-page invitation to install the Stree Android app from Google Play.
 */
export default function AppDownloadBand() {
  return (
    <section
      aria-labelledby="stree-app-download-heading"
      className="relative overflow-hidden bg-foreground text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #dc2626 0, transparent 42%), radial-gradient(circle at 85% 70%, #faf7f2 0, transparent 35%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/10 sm:h-80 sm:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-white/10 sm:h-60 sm:w-60"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-light">
            Pocket-ready shopping
          </p>
          <h2
            id="stree-app-download-heading"
            className="mt-3 max-w-xl text-2xl font-bold leading-tight sm:text-4xl"
          >
            Take स्त्री with you — download the app on Google Play
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-300 sm:text-base">
            Browse new drops, save favourites, and place Cash on Delivery orders
            from your phone. The same curated saree edit, built for on-the-go
            shopping.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-foreground transition-transform hover:-translate-y-0.5"
              aria-label="Download Stree on Google Play"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#01875f] text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  aria-hidden
                  fill="currentColor"
                >
                  <path d="M3.6 2.9c-.4.2-.6.6-.6 1.1v16c0 .5.2.9.6 1.1l9.7-9.1L3.6 2.9zm11.2 5.4-2.2 2 5.4 5.1 2.5-1.4c.7-.4.7-1.5 0-1.9l-5.7-3.8zM12.6 13.7l-2.3 2.1 3.3 1.9 2.3-1.3-3.3-2.7zm-2.9-1.7L3.9 19.8l8.3-4.8-2.5-2.9z" />
                </svg>
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[10px] uppercase tracking-wide text-muted">
                  Get it on
                </span>
                <span className="block text-sm font-bold sm:text-base">
                  Google Play
                </span>
              </span>
            </a>

            <Link
              href="/shop"
              className="text-sm font-medium text-gray-300 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Or continue shopping on the web
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[280px]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#2a2a2a] to-[#111] p-3 shadow-2xl shadow-black/40">
            <div className="rounded-[1.5rem] bg-[#FAF7F2] px-5 py-8 text-foreground">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                Stree app
              </p>
              <p className="mt-2 text-lg font-bold leading-snug">
                New arrivals in your pocket
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Wishlist · COD checkout · Order tracking emails
              </p>
              <div className="mt-6 space-y-2">
                <div className="h-16 rounded-xl bg-brand/10" />
                <div className="h-16 rounded-xl bg-brand/10" />
                <div className="h-10 rounded-full bg-brand text-center text-xs font-semibold leading-10 text-white">
                  Shop sarees
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
