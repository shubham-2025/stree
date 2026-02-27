import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Admin can read all products (including inactive) via RLS
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const product = data as Product;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
        Edit Product
      </h1>
      <div className="bg-white rounded-xl border border-border p-3 sm:p-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}

