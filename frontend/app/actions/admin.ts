"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Order status update error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

