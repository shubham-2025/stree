"use client";

import { useEffect, useState } from "react";
import { useFavourites } from "@/components/FavouritesProvider";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import Link from "next/link";

export default function FavouritesPage() {
  const { favourites } = useFavourites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      if (favourites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", favourites)
        .eq("is_active", true);
      setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetchFavs();
  }, [favourites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
        ♥ My Favourites
      </h1>
      <p className="text-muted text-xs sm:text-sm mb-6 sm:mb-8">
        {favourites.length} item{favourites.length !== 1 ? "s" : ""} saved
      </p>

      {loading ? (
        <div className="text-center py-20 text-muted">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">💝</span>
          <p className="text-lg text-muted mb-4">
            No favourites yet. Start exploring!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-brand text-white font-semibold
                       rounded-xl hover:bg-brand-dark transition-colors text-sm"
          >
            Browse Sarees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

