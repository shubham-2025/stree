import type { Metadata } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";
import GlobalActivityLoader from "@/components/GlobalActivityLoader";
import { Suspense } from "react";

const mukta = Mukta({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mukta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "स्त्री (Stree) — Premium Sarees",
  description:
    "Discover exquisite sarees at स्त्री. Handpicked silk, cotton, and designer sarees for every occasion. Cash on Delivery available.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr">
      <body className={`${mukta.variable} min-h-screen flex flex-col`}>
        <Suspense fallback={null}>
          <GlobalActivityLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
