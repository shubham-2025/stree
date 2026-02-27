"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ToastProvider";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);

    const result = await updateOrderStatus(orderId, newStatus);
    if (result.error) {
      showToast(result.error, "error");
      setStatus(currentStatus);
    } else {
      showToast(`Order status updated to ${newStatus}`, "success");
    }

    setSaving(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border
                    focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60
                    ${STATUS_COLORS[status] || "bg-gray-50 border-gray-200"}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-muted">Saving...</span>}
    </div>
  );
}
