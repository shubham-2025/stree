"use client";

import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    landmark: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createOrder({
        ...form,
        items: items.map((i) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          qty: i.qty,
          color: i.color,
          image: i.image,
        })),
        total_amount: total,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      clearCart();
      window.location.href = `/order-success/${result.orderId}`;
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted mb-4">Your cart is empty.</p>
        <Link
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-brand text-white font-semibold
                     rounded-lg hover:bg-brand-dark transition-colors text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <h2 className="text-lg font-semibold text-foreground">
            Delivery Details
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="customer_name"
                required
                value={form.customer_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="address_line1"
              required
              value={form.address_line1}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="House no., Street, Area"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address_line2"
              value={form.address_line2}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                State *
              </label>
              <select
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                required
                value={form.pincode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="6-digit pincode"
                maxLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Landmark
            </label>
            <input
              type="text"
              name="landmark"
              value={form.landmark}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="Near temple, school, etc. (optional)"
            />
          </div>

          <div className="bg-surface-alt rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted">
                Pay when your order is delivered
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand text-white font-semibold rounded-lg
                       hover:bg-brand-dark transition-colors text-sm disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Place Order (Cash on Delivery)"}
          </button>
        </form>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-surface-alt rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.color}`}
                  className="flex gap-3"
                >
                  <div className="w-12 h-14 rounded-lg overflow-hidden bg-white shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">
                      {item.title}
                    </p>
                    {item.color && (
                      <p className="text-xs text-muted">{item.color}</p>
                    )}
                    <p className="text-xs text-muted">Qty: {item.qty}</p>
                  </div>
                  <p className="text-xs font-semibold text-foreground shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

