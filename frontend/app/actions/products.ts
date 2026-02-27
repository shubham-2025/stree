"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ProductData {
  title: string;
  slug: string;
  price: number;
  mrp?: number | null;
  category: string;
  fabric?: string;
  colors: string[];
  images: string[];
  stock_qty: number;
  description?: string;
  is_active: boolean;
}

export async function createProduct(data: ProductData) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      title: data.title.trim(),
      slug: data.slug.trim(),
      price: data.price,
      mrp: data.mrp || null,
      category: data.category,
      fabric: data.fabric || null,
      colors: data.colors,
      images: data.images,
      stock_qty: data.stock_qty,
      description: data.description?.trim() || null,
      is_active: data.is_active,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Product create error:", error);
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { id: product.id };
}

export async function updateProduct(id: string, data: ProductData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      title: data.title.trim(),
      slug: data.slug.trim(),
      price: data.price,
      mrp: data.mrp || null,
      category: data.category,
      fabric: data.fabric || null,
      colors: data.colors,
      images: data.images,
      stock_qty: data.stock_qty,
      description: data.description?.trim() || null,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error) {
    console.error("Product update error:", error);
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${data.slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Product delete error:", error);
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { success: true };
}

