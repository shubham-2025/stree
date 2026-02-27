"use client";

import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQty, total } = useCart();

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
                    className="w-16 h-20 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-surface-alt"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
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
                          onClick={() =>
                            updateQty(item.productId, item.color, item.qty - 1)
                          }
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
                          onClick={() =>
                            updateQty(item.productId, item.color, item.qty + 1)
                          }
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 hover:bg-surface-alt transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.color)}
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
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Shipping: Free · Payment: Cash on Delivery
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

