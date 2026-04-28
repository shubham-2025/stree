"use client";

import Image from "next/image";
import streeNavbarLogo from "@/assets/stree-navbar-logo.png";

interface BrandSpinnerProps {
  label?: string;
}

export default function BrandSpinner({ label = "Loading..." }: BrandSpinnerProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center">
        <div className="absolute h-36 w-36 rounded-full border-2 border-brand-100 opacity-20 animate-ping" />
        <div className="absolute h-28 w-28 rounded-full border border-brand-100 opacity-40 animate-pulse" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center">
          <Image
            src={streeNavbarLogo}
            alt="Stree loading"
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </div>

      <p className="mt-8 text-sm font-medium text-muted animate-pulse">{label}</p>
      <div className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full rounded-full bg-brand animate-loader-bar" />
      </div>
    </div>
  );
}
