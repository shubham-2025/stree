"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOrderEmail } from "@/lib/email";

interface CheckoutData {
  customer_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  items: {
    productId: string;
    title: string;
    price: number;
    qty: number;
    color: string;
    image: string;
  }[];
  total_amount: number;
}

export async function createOrder(data: CheckoutData) {
  // Validate required fields
  if (
    !data.customer_name?.trim() ||
    !data.phone?.trim() ||
    !data.address_line1?.trim() ||
    !data.city?.trim() ||
    !data.state?.trim() ||
    !data.pincode?.trim()
  ) {
    return { error: "Please fill all required fields." };
  }

  if (!data.items || data.items.length === 0) {
    return { error: "Cart is empty." };
  }

  // Validate phone (10-digit Indian mobile)
  const phoneClean = data.phone.replace(/\s+/g, "");
  if (!/^[6-9]\d{9}$/.test(phoneClean)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  // Validate pincode (6-digit)
  if (!/^\d{6}$/.test(data.pincode.trim())) {
    return { error: "Please enter a valid 6-digit pincode." };
  }

  const supabase = await createClient();

  // Generate UUID on the server so we don't need SELECT permission
  // (RLS only allows admin to SELECT from orders)
  const orderId = crypto.randomUUID();

  const { error } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      customer_name: data.customer_name.trim(),
      phone: phoneClean,
      address_line1: data.address_line1.trim(),
      address_line2: data.address_line2?.trim() || null,
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
      landmark: data.landmark?.trim() || null,
      items: data.items,
      total_amount: data.total_amount,
      status: "NEW",
    });

  if (error) {
    console.error("Order creation error:", error);
    return { error: "Failed to place order. Please try again." };
  }

  // Send email notification to admin (non-blocking)
  sendOrderEmail({
    orderId,
    customer_name: data.customer_name.trim(),
    phone: phoneClean,
    address_line1: data.address_line1.trim(),
    address_line2: data.address_line2?.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: data.pincode.trim(),
    landmark: data.landmark?.trim(),
    items: data.items.map((i) => ({
      title: i.title,
      price: i.price,
      qty: i.qty,
      color: i.color,
      image: i.image,
    })),
    total_amount: data.total_amount,
  }).catch((err) => console.error("Email send error:", err));

  return { orderId };
}
