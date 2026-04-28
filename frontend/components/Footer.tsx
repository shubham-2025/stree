import Link from "next/link";
import Image from "next/image";
import streeNavbarLogo from "@/assets/stree-navbar-logo.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-auto">
      {/* Top wave decoration */}
      <div className="bg-surface">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
          <path
            d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 28C672 36 768 48 864 48C960 48 1056 36 1152 28C1248 20 1344 16 1392 14L1440 12V60H0Z"
            fill="#111827"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/home"
              className="relative inline-block h-11 w-[200px] shrink-0 sm:h-12 sm:w-[230px] md:w-[250px]"
              aria-label="Home — स्त्री Stree"
            >
              <Image
                src={streeNavbarLogo}
                alt="स्त्री — Stree, Sarees & Ethnic Wear"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 200px, (max-width: 1024px) 230px, 250px"
              />
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-3 sm:mt-4 max-w-xs">
              Premium sarees celebrating Indian tradition and elegance.
              Handpicked collections for every occasion, delivered to your
              doorstep.
            </p>
            {/* Social icons placeholder */}
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand transition-all cursor-pointer text-xs sm:text-sm">
                📷
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand transition-all cursor-pointer text-xs sm:text-sm">
                📘
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand transition-all cursor-pointer text-xs sm:text-sm">
                💬
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider text-gray-300">
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li>
                <Link
                  href="/home"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <span className="text-brand">›</span> Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <span className="text-brand">›</span> Shop Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <span className="text-brand">›</span> Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/favourites"
                  className="hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <span className="text-brand">›</span> My Favourites
                </Link>
              </li>
            </ul>
          </div>

          {/* Why Us */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider text-gray-300">
              Why Choose Us
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">✓</span>
                <span>Handpicked premium sarees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">✓</span>
                <span>Free shipping across India</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">✓</span>
                <span>Cash on Delivery available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">✓</span>
                <span>Quality guaranteed</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-semibold mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-wider text-gray-300">
              Get in Touch
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-lg">📧</span>
                <a
                  href="mailto:info@streesarees.com"
                  className="break-all text-gray-400 transition-colors hover:text-brand-light"
                >
                  info@streesarees.com
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-lg">📍</span>
                <span>Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-lg">💵</span>
                <span>Cash on Delivery Only</span>
              </li>
            </ul>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700/50 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="text-brand-light font-semibold">स्त्री (Stree)</span>.
            All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Secure Checkout
            </span>
            <span>🚚 Free Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
