"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addSiteCategory(rawName: string) {
  const name = rawName.trim();
  if (!name) return { error: "Category name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("site_categories").insert({ name });
  if (error) {
    console.error("site_categories insert error:", error);
    return { error: error.message };
  }

  revalidatePath("/home");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteSiteCategory(rawName: string) {
  const name = rawName.trim();
  if (!name) return { error: "Category name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("site_categories").delete().eq("name", name);
  if (error) {
    console.error("site_categories delete error:", error);
    return { error: error.message };
  }

  revalidatePath("/home");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function renameCategory(oldRawName: string, newRawName: string) {
  const oldName = oldRawName.trim();
  const newName = newRawName.trim();
  if (!oldName || !newName) {
    return { error: "Both old and new category names are required." };
  }
  if (oldName === newName) return { success: true };

  const supabase = await createClient();

  const { error: updateProductsError } = await supabase
    .from("products")
    .update({ category: newName })
    .eq("category", oldName);
  if (updateProductsError) {
    console.error("category rename products error:", updateProductsError);
    return { error: updateProductsError.message };
  }

  const { error: insertManagedError } = await supabase
    .from("site_categories")
    .insert({ name: newName });
  if (insertManagedError && insertManagedError.code !== "23505") {
    console.error("category rename insert site_categories error:", insertManagedError);
    return { error: insertManagedError.message };
  }

  const { error: deleteOldManagedError } = await supabase
    .from("site_categories")
    .delete()
    .eq("name", oldName);
  if (deleteOldManagedError) {
    console.error("category rename delete old site_categories error:", deleteOldManagedError);
    return { error: deleteOldManagedError.message };
  }

  revalidatePath("/shop");
  revalidatePath("/home");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteCategoryEverywhere(rawName: string) {
  const name = rawName.trim();
  if (!name) return { error: "Category name is required." };

  const supabase = await createClient();

  const fallbackCategory = "Uncategorized";
  const { error: moveProductsError } = await supabase
    .from("products")
    .update({ category: fallbackCategory })
    .eq("category", name);
  if (moveProductsError) {
    console.error("category move products error:", moveProductsError);
    return { error: moveProductsError.message };
  }

  const { error: insertFallbackError } = await supabase
    .from("site_categories")
    .insert({ name: fallbackCategory });
  if (insertFallbackError && insertFallbackError.code !== "23505") {
    console.error("category insert fallback site_categories error:", insertFallbackError);
    return { error: insertFallbackError.message };
  }

  const { error: managedDeleteError } = await supabase
    .from("site_categories")
    .delete()
    .eq("name", name);
  if (managedDeleteError) {
    console.error("category delete site_categories error:", managedDeleteError);
    return { error: managedDeleteError.message };
  }

  revalidatePath("/shop");
  revalidatePath("/home");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  return { success: true };
}
