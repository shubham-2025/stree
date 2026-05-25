import { NextResponse } from "next/server";

import {
  buildMobileApiUser,
  mergeMobileUserMetadata,
  MobileAuthError,
  requireMobileRequestContext,
} from "@/lib/mobile-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ProfileUpdateBody = {
  name?: unknown;
  phone?: unknown;
  defaultAddress?: unknown;
  default_address?: unknown;
};

function asOptionalTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export async function PATCH(request: Request) {
  try {
    const context = await requireMobileRequestContext(request);
    const body = (await request.json()) as ProfileUpdateBody;
    const nextName = asOptionalTrimmedString(body.name);
    const nextPhone = asOptionalTrimmedString(body.phone);
    const hasDefaultAddress =
      Object.prototype.hasOwnProperty.call(body, "defaultAddress") ||
      Object.prototype.hasOwnProperty.call(body, "default_address");
    const nextDefaultAddress = hasDefaultAddress
      ? body.defaultAddress ?? body.default_address
      : undefined;

    if (
      typeof nextName === "undefined" &&
      typeof nextPhone === "undefined" &&
      !hasDefaultAddress
    ) {
      return NextResponse.json(
        { success: false, error: "No profile changes were provided." },
        { status: 400 }
      );
    }

    if (typeof body.name !== "undefined" && !nextName) {
      return NextResponse.json(
        { success: false, error: "Please enter your name." },
        { status: 400 }
      );
    }

    const userMetadata = mergeMobileUserMetadata(context.user, {
      name: nextName,
      phone: nextPhone ?? "",
      ...(hasDefaultAddress ? { defaultAddress: nextDefaultAddress } : {}),
    });
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.updateUserById(
      context.user.id,
      {
        user_metadata: userMetadata,
      }
    );

    if (error) {
      console.error("Mobile profile update error:", error);
      return NextResponse.json(
        { success: false, error: "Unable to save your profile right now." },
        { status: 500 }
      );
    }

    const updatedUser = data.user ?? {
      ...context.user,
      user_metadata: userMetadata,
    };

    return NextResponse.json({
      success: true,
      data: buildMobileApiUser(updatedUser),
    });
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("Mobile profile unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to save your profile right now." },
      { status: 500 }
    );
  }
}
