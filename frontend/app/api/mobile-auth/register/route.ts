import { NextResponse } from "next/server";

import { createAdminClient, createServerPublicClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

type RegisterBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const name = asTrimmedString(body.name);
    const email = asTrimmedString(body.email).toLowerCase();
    const password = asTrimmedString(body.password);

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const publicClient = createServerPublicClient();

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        full_name: name,
      },
    });

    if (createError) {
      const message = createError.message.toLowerCase();
      const isDuplicate =
        message.includes("already") || message.includes("registered") || message.includes("exists");

      return NextResponse.json(
        {
          success: false,
          error: isDuplicate
            ? "An account with this email already exists. Please sign in instead."
            : createError.message,
        },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    const { data: signInData, error: signInError } =
      await publicClient.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.session || !signInData.user) {
      return NextResponse.json(
        {
          success: false,
          error:
            signInError?.message ??
            "Account was created, but automatic sign-in failed. Please sign in manually.",
        },
        { status: 500 }
      );
    }

    try {
      await sendWelcomeEmail({
        name,
        email,
      });
    } catch (welcomeEmailError) {
      console.error("Mobile register welcome email error:", welcomeEmailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_in: signInData.session.expires_in,
        token_type: signInData.session.token_type,
        user: signInData.user,
        created_user_id: createdUser.user?.id,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Instant account creation failed.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 503 }
    );
  }
}
