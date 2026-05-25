import { NextResponse } from "next/server";

import {
  buildMobileApiUser,
  MobileAuthError,
  requireMobileRequestContext,
} from "@/lib/mobile-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await requireMobileRequestContext(request);
    return NextResponse.json({
      success: true,
      data: buildMobileApiUser(context.user),
    });
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("Mobile auth me error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load your profile right now." },
      { status: 500 }
    );
  }
}
