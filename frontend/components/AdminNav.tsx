"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import streeNavbarLogo from "@/assets/stree-navbar-logo.png";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    showToast("Logged out successfully", "info");
    // Small delay so toast is visible before redirect
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 800);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/admin/dashboard"
                className="relative inline-block h-9 w-[150px] shrink-0"
                aria-label="Stree Admin"
              >
                <Image
                  src={streeNavbarLogo}
                  alt="Stree Admin"
                  fill
                  className="object-contain object-left"
                  sizes="150px"
                />
              </Link>
              {/* Desktop nav */}
              <div className="hidden sm:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith(item.href)
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/home"
                className="hidden sm:inline text-xs text-gray-400 hover:text-white transition-colors"
              >
                View Site →
              </Link>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="hidden sm:inline text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-1 text-gray-300 hover:text-white"
                aria-label="Toggle admin menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-white/10 pb-3 pt-2 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/10 mt-2 pt-2 flex items-center gap-4 px-3">
                <Link
                  href="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  View Site →
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout confirmation popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-toast-in">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-brand-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-brand">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-foreground mb-1">
              Logout?
            </h3>
            <p className="text-center text-sm text-muted mb-6">
              Are you sure you want to log out of the admin panel?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium
                           hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold
                           hover:bg-brand-dark transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
