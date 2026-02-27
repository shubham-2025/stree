import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import OrderStatusUpdater from "./OrderStatusUpdater";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const order = data as Order;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-muted hover:text-brand"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Order Details
                </h1>
                <p className="text-[10px] sm:text-xs text-muted font-mono mt-1 break-all">{order.id}</p>
                <p className="text-[10px] sm:text-xs text-muted mt-1">
                  {new Date(order.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 uppercase tracking-wider">
              Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 sm:gap-4 py-2 border-b border-border last:border-0"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-12 sm:w-12 sm:h-14 object-cover rounded border border-border shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">
                      {item.title}
                    </p>
                    {item.color && (
                      <p className="text-[10px] sm:text-xs text-muted">Color: {item.color}</p>
                    )}
                    <p className="text-[10px] sm:text-xs text-muted">Qty: {item.qty}</p>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-brand">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 uppercase tracking-wider">
              Customer
            </h2>
            <dl className="text-sm space-y-3">
              <div>
                <dt className="text-muted text-xs">Name</dt>
                <dd className="text-foreground font-medium">
                  {order.customer_name}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs">Phone</dt>
                <dd className="text-foreground">
                  <a
                    href={`tel:${order.phone}`}
                    className="text-brand hover:underline"
                  >
                    {order.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 uppercase tracking-wider">
              Shipping Address
            </h2>
            <div className="text-sm text-foreground space-y-1">
              <p>{order.address_line1}</p>
              {order.address_line2 && <p>{order.address_line2}</p>}
              <p>
                {order.city}, {order.state} — {order.pincode}
              </p>
              {order.landmark && (
                <p className="text-muted">Landmark: {order.landmark}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 uppercase tracking-wider">
              Payment
            </h2>
            <p className="text-sm text-foreground">Cash on Delivery (COD)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

