"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ShopSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-w-[140px] sm:min-w-[200px]">
      <div className="relative">
        <input
          type="text"
          placeholder="Search sarees..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
    </form>
  );
}

