"use client";

import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/components/ToastProvider";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function CartClient() {
  const { items, removeFromCart, updateQty, total } = useCart();
  const { showToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted mb-4">Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-brand text-white font-semibold
                       rounded-lg hover:bg-brand-dark transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color}`}
                className="p-3 sm:p-4 bg-white rounded-xl border border-border"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-16 h-20 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-surface-alt"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="w-full h-full object-cover"
                      sizes="(min-width: 640px) 96px, 64px"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-xs sm:text-sm font-semibold text-foreground hover:text-brand line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    {item.color && (
                      <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">
                        Color: {item.color}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 sm:mt-2">
                      <p className="text-sm font-bold text-brand">
                        {formatPrice(item.price)}
                      </p>
                      {/* Mobile line total inline */}
                      <p className="text-xs font-medium text-muted sm:hidden">
                        × {item.qty} = {formatPrice(item.price * item.qty)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => {
                            updateQty(item.productId, item.color, item.qty - 1);
                            showToast("Quantity updated", "info");
                          }}
                          disabled={item.qty <= 1}
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 hover:bg-surface-alt transition-colors text-sm
                                     disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => {
                            updateQty(item.productId, item.color, item.qty + 1);
                            showToast("Quantity updated", "info");
                          }}
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 hover:bg-surface-alt transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.productId, item.color);
                          showToast("Item removed from cart", "warning");
                        }}
                        className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line total - desktop */}
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 bg-surface-alt rounded-xl p-6 border border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted">Items subtotal</span>
              <span className="font-semibold text-foreground">{formatPrice(total)}</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-sm">
              <span className="text-muted">Delivery fee</span>
              <span className="font-semibold text-foreground">{formatPrice(29)}</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Flat ₹29 delivery fee on every order
            </p>
            <div className="mt-3 flex justify-between items-center text-lg font-bold border-t border-border pt-3">
              <span>Payable total</span>
              <span className="text-brand">{formatPrice(total + 29)}</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Payment: Cash on Delivery
            </p>
            <Link
              href="/checkout"
              className="mt-4 block w-full text-center py-3 bg-brand text-white font-semibold
                         rounded-lg hover:bg-brand-dark transition-colors text-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
