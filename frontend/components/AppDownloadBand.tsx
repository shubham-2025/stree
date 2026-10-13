import Link from "next/link";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.streesarees.mobile";

/**
 * Mid-page invitation to install the Stree Android app from Google Play.
 * Right side uses converging "approaching" line field so the phone never sits in empty space.
 */
export default function AppDownloadBand() {
  return (
    <section
      aria-labelledby="stree-app-download-heading"
      className="relative overflow-hidden bg-[#0c1220] text-white"
    >
      {/* Soft brand wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 70% at 12% 40%, rgba(220,38,38,0.22) 0%, transparent 55%), radial-gradient(ellipse 45% 55% at 88% 55%, rgba(250,247,242,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Approaching / converging line field — fills the empty right plane */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[58%] lg:block"
        viewBox="0 0 640 520"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="stree-line-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
            <stop offset="35%" stopColor="#dc2626" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#faf7f2" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#faf7f2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stree-line-soft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizon vanishing toward phone center (~x=220, y=260) */}
        {[
          [640, 20, 250, 210],
          [640, 70, 248, 225],
          [640, 120, 246, 238],
          [640, 170, 244, 248],
          [640, 220, 242, 255],
          [640, 300, 242, 265],
          [640, 350, 244, 272],
          [640, 400, 246, 282],
          [640, 450, 248, 295],
          [640, 500, 250, 310],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={`h-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 2 === 0 ? "url(#stree-line-fade)" : "url(#stree-line-soft)"}
            strokeWidth={i % 3 === 0 ? 1.25 : 0.75}
            className="stree-approach-line"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}

        {/* Vertical approach arcs from top/bottom edges */}
        {[40, 90, 140, 190, 380, 430, 480].map((x, i) => (
          <path
            key={`v-${i}`}
            d={`M ${x} 0 Q ${x + 30} 260 ${x} 520`}
            stroke="url(#stree-line-soft)"
            strokeWidth="0.7"
            className="stree-approach-line"
            style={{ animationDelay: `${0.4 + i * 0.08}s` }}
          />
        ))}

        {/* Focal rings around phone */}
        <circle
          cx="230"
          cy="260"
          r="118"
          stroke="rgba(220,38,38,0.28)"
          strokeWidth="1"
          className="stree-approach-ring"
        />
        <circle
          cx="230"
          cy="260"
          r="168"
          stroke="rgba(250,247,242,0.12)"
          strokeWidth="1"
          strokeDasharray="4 10"
          className="stree-approach-ring"
          style={{ animationDelay: "0.6s" }}
        />
        <circle
          cx="230"
          cy="260"
          r="218"
          stroke="rgba(250,247,242,0.08)"
          strokeWidth="1"
          className="stree-approach-ring"
          style={{ animationDelay: "1.1s" }}
        />
      </svg>

      {/* Mobile: compact line field behind phone */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full lg:hidden"
        viewBox="0 0 390 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="stree-m-fade" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
            <stop offset="50%" stopColor="#dc2626" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[60, 120, 180, 240, 300, 330].map((x, i) => (
          <line
            key={`m-${i}`}
            x1={x}
            y1="640"
            x2="195"
            y2="320"
            stroke="url(#stree-m-fade)"
            strokeWidth="0.8"
            className="stree-approach-line"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </svg>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:py-20">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-light">
            Pocket-ready shopping
          </p>
          <h2
            id="stree-app-download-heading"
            className="mt-3 max-w-xl text-2xl font-bold leading-tight sm:text-4xl"
          >
            Take स्त्री with you — download the app on Google Play
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Browse new drops, save favourites, and place Cash on Delivery orders
            from your phone. The same curated saree edit, built for on-the-go
            shopping.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55 sm:text-sm">
            <li className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brand-light" />
              Instant wishlist sync
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brand-light" />
              COD in a few taps
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-brand-light" />
              Order emails on every purchase
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-foreground shadow-[0_12px_40px_-12px_rgba(220,38,38,0.45)] transition-transform hover:-translate-y-0.5"
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
              className="text-sm font-medium text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Or continue shopping on the web
            </Link>
          </div>
        </div>

        {/* Phone + orbiting labels sit inside the line field */}
        <div className="relative z-10 mx-auto flex w-full max-w-[340px] items-center justify-center lg:max-w-none lg:justify-center">
          {/* Floating feature markers along approach paths */}
          <span
            aria-hidden
            className="stree-float-chip absolute left-0 top-[18%] hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-white/75 backdrop-blur-sm lg:left-[4%] lg:block"
          >
            Wishlist
          </span>
          <span
            aria-hidden
            className="stree-float-chip absolute right-0 top-[28%] hidden rounded-full border border-brand-light/30 bg-brand-light/10 px-3 py-1 text-[10px] font-medium tracking-wide text-brand-light lg:right-[2%] lg:block"
            style={{ animationDelay: "0.8s" }}
          >
            COD ready
          </span>
          <span
            aria-hidden
            className="stree-float-chip absolute bottom-[22%] left-[2%] hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-white/75 backdrop-blur-sm lg:block"
            style={{ animationDelay: "1.4s" }}
          >
            Order alerts
          </span>

          <div className="relative w-full max-w-[260px] sm:max-w-[280px]">
            {/* Soft glow under phone */}
            <div
              aria-hidden
              className="absolute -inset-8 rounded-full bg-brand-light/15 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-[2.1rem] border border-white/20 bg-gradient-to-b from-[#2c313c] to-[#0f1218] p-[10px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              {/* Notch */}
              <div
                aria-hidden
                className="absolute left-1/2 top-[14px] z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-black/80"
              />
              <div className="relative overflow-hidden rounded-[1.55rem] bg-[#FAF7F2] text-foreground">
                <div className="px-5 pb-7 pt-9">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                      Stree app
                    </p>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-semibold text-brand">
                      Live
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold leading-snug">
                    New arrivals in your pocket
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    Wishlist · COD checkout · Order tracking emails
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex gap-2.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                      <div className="h-14 w-11 shrink-0 rounded-lg bg-gradient-to-br from-[#8b1e2d] via-[#c45c3a] to-[#e8c9a0]" />
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="truncate text-[11px] font-semibold">
                          Party wear edit
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          Fresh drop · Ready to ship
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-brand">
                          ₹1,350
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                      <div className="h-14 w-11 shrink-0 rounded-lg bg-gradient-to-br from-[#1f3a2e] via-[#4a7c59] to-[#d4c4a8]" />
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="truncate text-[11px] font-semibold">
                          Tussar stories
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          Handpicked weave
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-brand">
                          ₹850
                        </p>
                      </div>
                    </div>
                    <div className="h-10 rounded-full bg-brand text-center text-xs font-semibold leading-10 text-white">
                      Shop sarees
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stree-line-draw {
          0% { stroke-dashoffset: 120; opacity: 0.15; }
          45% { opacity: 0.85; }
          100% { stroke-dashoffset: 0; opacity: 0.55; }
        }
        @keyframes stree-ring-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
        @keyframes stree-chip-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .stree-approach-line {
          stroke-dasharray: 8 14;
          animation: stree-line-draw 3.6s ease-in-out infinite alternate;
        }
        .stree-approach-ring {
          transform-origin: 230px 260px;
          animation: stree-ring-pulse 4.5s ease-in-out infinite;
        }
        .stree-float-chip {
          animation: stree-chip-float 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .stree-approach-line,
          .stree-approach-ring,
          .stree-float-chip {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
