import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";

export const runtime = "nodejs";

type SendEmailBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  company?: unknown;
};

function asTrimmedString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendEmailBody;

    const company = asTrimmedString(body.company);
    if (company) {
      // Honeypot hit: silently act as success to avoid tipping off bots.
      return NextResponse.json({ success: true });
    }

    const name = asTrimmedString(body.name);
    const email = asTrimmedString(body.email);
    const message = asTrimmedString(body.message);
    const phone = asTrimmedString(body.phone);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await sendContactEmail({
      name,
      email,
      phone: phone || undefined,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
