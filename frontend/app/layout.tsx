import type { Metadata } from "next";
import "./globals.css";
import GlobalActivityLoader from "@/components/GlobalActivityLoader";
import { Suspense } from "react";

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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <GlobalActivityLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
