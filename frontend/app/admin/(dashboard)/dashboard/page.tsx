import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get stats
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: activeCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: newOrderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "NEW");

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, customer_name, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      label: "Total Products",
      value: productCount || 0,
      icon: "📦",
      href: "/admin/products",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active Products",
      value: activeCount || 0,
      icon: "✅",
      href: "/admin/products",
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Total Orders",
      value: orderCount || 0,
      icon: "🛒",
      href: "/admin/orders",
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "New Orders",
      value: newOrderCount || 0,
      icon: "🔔",
      href: "/admin/orders",
      color: "bg-brand-50 text-brand",
    },
  ];

  const statusColors: Record<string, string> = {
    NEW: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-border p-3 sm:p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg ${stat.color}`}
              >
                {stat.icon}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
        <Link
          href="/admin/products/new"
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors text-xs sm:text-sm"
        >
          + Add Product
        </Link>
        <Link
          href="/admin/orders"
          className="px-3 py-2 sm:px-5 sm:py-2.5 border border-border rounded-lg hover:bg-surface-alt transition-colors text-xs sm:text-sm font-medium"
        >
          View All Orders
        </Link>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm sm:text-base">Recent Orders</h2>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            No orders yet.
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-border">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface-alt/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{o.customer_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          statusColors[o.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="text-[10px] text-muted">
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand shrink-0 ml-3">
                    {formatPrice(o.total_amount)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt border-b border-border">
                    <th className="text-left px-5 py-3 font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">
                      Amount
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-alt/50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-foreground hover:text-brand"
                        >
                          {o.customer_name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatPrice(o.total_amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            statusColors[o.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-muted text-xs">
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

