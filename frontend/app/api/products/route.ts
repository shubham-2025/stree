import { NextResponse } from "next/server";

import { createRequestClient } from "@/lib/supabase/request";

export const runtime = "nodejs";

function asPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sanitizeSearchTerm(value: string) {
  return value.trim().replace(/[,*()]/g, " ").replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = asPositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(asPositiveInt(searchParams.get("limit"), 12), 48);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const supabase = createRequestClient();
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .gt("stock_qty", 0);

    const category = searchParams.get("category")?.trim();
    const search = searchParams.get("search")?.trim();
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (category) {
      query = query.eq("category", category);
    }

    if (minPrice) {
      const value = Number(minPrice);
      if (Number.isFinite(value)) {
        query = query.gte("price", value);
      }
    }

    if (maxPrice) {
      const value = Number(maxPrice);
      if (Number.isFinite(value)) {
        query = query.lte("price", value);
      }
    }

    if (search) {
      const normalized = sanitizeSearchTerm(search);
      query = query.or(
        `title.ilike.%${normalized}%,description.ilike.%${normalized}%,category.ilike.%${normalized}%,fabric.ilike.%${normalized}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Products API error:", error);
      return NextResponse.json(
        { success: false, error: "Unable to load products right now." },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    return NextResponse.json({
      success: true,
      data: {
        items: data ?? [],
        meta: {
          page,
          limit,
          total,
          hasMore: from + (data?.length ?? 0) < total,
        },
      },
    });
  } catch (error) {
    console.error("Products API unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load products right now." },
      { status: 500 }
    );
  }
}
