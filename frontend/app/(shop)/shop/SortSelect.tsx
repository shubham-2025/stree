"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-3 py-2 border border-border rounded-lg text-sm bg-white
                 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
    >
      <option value="">Newest First</option>
      <option value="price_asc">Price: Low → High</option>
      <option value="price_desc">Price: High → Low</option>
    </select>
  );
}

