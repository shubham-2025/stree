import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products: Product[] = (data as Product[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-brand text-white font-semibold rounded-lg
                     hover:bg-brand-dark transition-colors text-xs sm:text-sm"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted bg-white rounded-xl border border-border">
          <p className="text-lg">No products yet.</p>
          <p className="text-sm mt-1">
            Click &ldquo;Add Product&rdquo; to create your first product.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="sm:hidden space-y-3">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-border p-3">
                <div className="flex gap-3">
                  {p.images[0] && (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-16 h-20 object-cover rounded-lg border border-border shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-brand">
                        {formatPrice(p.price)}
                      </span>
                      <span className={`text-xs ${p.stock_qty > 0 ? "text-green-600" : "text-red-500"}`}>
                        Stock: {p.stock_qty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                        p.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-3 pt-2 border-t border-border">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton
                    productId={p.id}
                    productTitle={p.title}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden sm:block bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">
                      Stock
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-alt/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] && (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-10 h-12 object-cover rounded border border-border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {p.title}
                            </p>
                            <p className="text-xs text-muted">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={
                            p.stock_qty > 0 ? "text-green-600" : "text-red-500"
                          }
                        >
                          {p.stock_qty}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            p.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="text-xs text-brand hover:underline font-medium"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton
                            productId={p.id}
                            productTitle={p.title}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

