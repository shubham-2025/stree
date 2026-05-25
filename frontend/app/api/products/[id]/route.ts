import { NextResponse } from "next/server";

import { createRequestClient } from "@/lib/supabase/request";

export const runtime = "nodejs";

interface ProductRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: Request, { params }: ProductRouteProps) {
  const { id } = await params;

  try {
    const supabase = createRequestClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Product details API unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load this product right now." },
      { status: 500 }
    );
  }
}
