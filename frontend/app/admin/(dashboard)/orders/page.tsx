import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-yellow-50 text-yellow-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders: Order[] = (data as Order[]) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-muted bg-white rounded-xl border border-border">
          <p className="text-lg">No orders yet.</p>
          <p className="text-sm mt-1">
            Orders will appear here when customers place them.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="sm:hidden space-y-3">
            {orders.map((order) => {
              const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block bg-white rounded-xl border border-border p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted">{order.phone}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                        STATUS_COLORS[order.status] || "bg-gray-100"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-brand">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-muted mt-1.5">
                    #{order.id.slice(0, 8)}
                  </p>
                </Link>
              );
            })}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden sm:block bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Order
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Items
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => {
                    const itemCount = order.items.reduce(
                      (s, i) => s + i.qty,
                      0
                    );
                    return (
                      <tr key={order.id} className="hover:bg-surface-alt/50">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-muted">
                            {order.id.slice(0, 8)}…
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-muted">{order.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                              STATUS_COLORS[order.status] || "bg-gray-100"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted text-xs hidden md:table-cell">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs text-brand hover:underline font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

