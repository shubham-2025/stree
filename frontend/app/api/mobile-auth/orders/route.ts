import { NextResponse } from "next/server";

import { MobileAuthError, requireMobileRequestContext } from "@/lib/mobile-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type PostgrestErrorLike = {
  code?: string | null;
  message?: string | null;
};

function isMissingOrdersUserIdColumn(error: PostgrestErrorLike | null | undefined) {
  return (
    (error?.code === "PGRST204" || error?.code === "42703") &&
    typeof error.message === "string" &&
    (error.message.includes("'user_id' column") ||
      error.message.includes("orders.user_id"))
  );
}

export async function GET(request: Request) {
  try {
    const context = await requireMobileRequestContext(request);
    const adminClient = createAdminClient();
    let { data, error } = await adminClient
      .from("orders")
      .select("*")
      .eq("user_id", context.user.id)
      .order("created_at", { ascending: false });

    if (isMissingOrdersUserIdColumn(error)) {
      const normalizedEmail = context.user.email?.trim().toLowerCase();

      if (!normalizedEmail) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      console.warn(
        "Mobile orders fetch fallback: 'user_id' column missing, filtering by customer_email."
      );

      ({ data, error } = await adminClient
        .from("orders")
        .select("*")
        .eq("customer_email", normalizedEmail)
        .order("created_at", { ascending: false }));
    }

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
