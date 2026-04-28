"use client";

import Link from "next/link";
import Image from "next/image";
import streeNavbarLogo from "@/assets/stree-navbar-logo.png";
import { useCart } from "@/components/CartProvider";
import { useFavourites } from "@/components/FavouritesProvider";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { items } = useCart();
  const { count: favCount } = useFavourites();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const pathname = usePathname();

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/shop", label: "Shop" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-2 sm:gap-4">
          {/* Left: logo — flex-1 so middle nav can sit true viewport-center */}
          <div className="flex min-w-0 flex-1 justify-start">
            <Link
              href="/home"
              className="relative block h-[46px] w-[230px] shrink-0 sm:h-[54px] sm:w-[270px] md:w-[290px] group"
              aria-label="Home — स्त्री Stree"
            >
              <Image
                src={streeNavbarLogo}
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 230px, (max-width: 768px) 270px, 290px"
                className="object-contain object-left transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Desktop Nav — centered between equal flex sides */}
          <nav className="hidden shrink-0 items-center gap-8 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href
                    ? "text-brand font-semibold"
                    : "text-foreground hover:text-brand"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: icons — same flex-1 as left for balance */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            {/* Favourites */}
            <Link
              href="/favourites"
              className="relative hover:text-brand transition-colors p-1"
              title="Favourites"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={favCount > 0 ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-5 h-5 ${favCount > 0 ? "text-brand" : ""}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312
                     2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3
                     8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative hover:text-brand transition-colors p-1"
              title="Cart"
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
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993
                     1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0
                     0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576
                     0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75
                     0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0
                     .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-border pt-3 flex flex-col gap-3 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`transition-colors ${
                  pathname === link.href ? "text-brand" : "hover:text-brand"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/favourites"
              onClick={() => setMobileOpen(false)}
              className="hover:text-brand transition-colors flex items-center gap-2"
            >
              ♥ Favourites{favCount > 0 && ` (${favCount})`}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
