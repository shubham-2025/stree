import { NextResponse } from "next/server";

import { MobileAuthError, requireMobileRequestContext } from "@/lib/mobile-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireMobileRequestContext(request);
    const { data, error } = await context.client
      .from("orders")
      .select("*")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Mobile orders fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Unable to load your orders right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    });
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("Mobile orders unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load your orders right now." },
      { status: 500 }
    );
  }
}
