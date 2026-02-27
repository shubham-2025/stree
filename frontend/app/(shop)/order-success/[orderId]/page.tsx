import Link from "next/link";

export const dynamic = "force-dynamic";

interface OrderSuccessProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderId } = await params;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 text-center">
      <div className="bg-green-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        Order Placed Successfully!
      </h1>
      <p className="text-muted text-sm sm:text-base mb-4 sm:mb-6">
        Thank you for shopping with{" "}
        <span className="text-brand font-semibold">स्त्री</span>
      </p>

      <div className="bg-surface-alt rounded-xl border border-border p-4 sm:p-6 mb-6 sm:mb-8 text-left">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted">Order ID</span>
            <span className="font-mono text-xs text-foreground break-all ml-4">
              {orderId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Payment</span>
            <span className="text-foreground">Cash on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Status</span>
            <span className="text-green-600 font-medium">Confirmed</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted mb-6">
        We will call you to confirm your order. Please keep your phone handy.
      </p>

      <Link
        href="/shop"
        className="inline-flex items-center px-8 py-3 bg-brand text-white font-semibold
                   rounded-lg hover:bg-brand-dark transition-colors text-sm"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

