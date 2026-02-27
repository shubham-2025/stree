import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { FavouritesProvider } from "@/components/FavouritesProvider";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <FavouritesProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </FavouritesProvider>
    </CartProvider>
  );
}
