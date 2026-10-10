import { NextResponse } from "next/server";

import { getHomeCategoryCards } from "@/lib/data/home";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getHomeCategoryCards();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Home categories API unexpected error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load home categories right now." },
      { status: 500 }
    );
  }
}
