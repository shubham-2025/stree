import { NextResponse } from "next/server";

import { createServerPublicClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ForgotPasswordBody = {
  email?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolvePublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.trim();

  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "[::1]"
  ) {
    return true;
  }

  const parts = normalized.split(".");
  if (parts.length !== 4) {
    return false;
  }

  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function resolvePasswordResetUrl(request: Request): string {
  const explicitUrl =
    process.env.PASSWORD_RESET_REDIRECT_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicitUrl) {
    return `${explicitUrl.replace(/\/+$/, "")}/reset-password`;
  }

  const origin = resolvePublicOrigin(request);
  const hostname = new URL(origin).hostname;

  if (isPrivateOrLocalHost(hostname)) {
    return "https://stree-sarees-com.vercel.app/reset-password";
  }

  return `${origin}/reset-password`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotPasswordBody;
    const email = asTrimmedString(body.email).toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const publicClient = createServerPublicClient();
    const redirectTo = resolvePasswordResetUrl(request);
    const { error } = await publicClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("Mobile forgot password error:", error);
      return NextResponse.json(
        { success: false, error: "Unable to send reset email right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email,
      },
      message:
        "If that email is registered with Stree, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Mobile forgot password unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to send reset email right now." },
      { status: 500 }
    );
  }
}
