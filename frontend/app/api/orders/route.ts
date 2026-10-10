import { NextResponse } from "next/server";

import { getOptionalMobileRequestContext, MobileAuthError } from "@/lib/mobile-auth";
import { sendOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

type OrderItemInput = {
  productId?: unknown;
  title?: unknown;
  price?: unknown;
  qty?: unknown;
  color?: unknown;
  image?: unknown;
};

type OrderBody = {
  customer_name?: unknown;
  customer_email?: unknown;
  phone?: unknown;
  address_line1?: unknown;
  address_line2?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
  landmark?: unknown;
  items?: unknown;
  total_amount?: unknown;
};

type PostgrestErrorLike = {
  code?: string | null;
  message?: string | null;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitizeOrderItems(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const sanitizedItems = items
    .filter(isRecord)
    .map((item) => {
      const source = item as OrderItemInput;
      const productId = asTrimmedString(source.productId);
      const title = asTrimmedString(source.title);
      const image = asTrimmedString(source.image);
      const price = Number(source.price);
      const qty = Number(source.qty);
      const color = asTrimmedString(source.color);

      if (!productId || !title || !image) {
        return null;
      }

      if (!Number.isFinite(price) || price < 0 || !Number.isFinite(qty) || qty < 1) {
        return null;
      }

      return {
        productId,
        title,
        price,
        qty,
        color,
        image,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return sanitizedItems.length > 0 ? sanitizedItems : null;
}

function isMissingOrdersUserIdColumn(error: PostgrestErrorLike | null | undefined) {
  return (
    error?.code === "PGRST204" &&
    typeof error.message === "string" &&
    error.message.includes("'user_id' column")
  );
}

export async function POST(request: Request) {
  try {
    const context = await getOptionalMobileRequestContext(request);
    const body = (await request.json()) as OrderBody;
    const customerName = asTrimmedString(body.customer_name);
    const authEmail = context.user?.email?.trim().toLowerCase() || "";
    const customerEmail =
      asTrimmedString(body.customer_email).toLowerCase() || authEmail;
    const phone = asTrimmedString(body.phone).replace(/\s+/g, "");
    const addressLine1 = asTrimmedString(body.address_line1);
    const addressLine2 = asTrimmedString(body.address_line2);
    const city = asTrimmedString(body.city);
    const state = asTrimmedString(body.state);
    const pincode = asTrimmedString(body.pincode);
    const landmark = asTrimmedString(body.landmark);
    const items = sanitizeOrderItems(body.items);
    const totalAmount = Number(body.total_amount);

    if (
      !customerName ||
      !customerEmail ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        { success: false, error: "Please fill all required fields." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    if (!items) {
      return NextResponse.json(
        { success: false, error: "Cart is empty." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      return NextResponse.json(
        { success: false, error: "Order total is invalid." },
        { status: 400 }
      );
    }

    const orderId = crypto.randomUUID();

    const orderRecord = {
      id: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2 || null,
      city,
      state,
      pincode,
      landmark: landmark || null,
      items,
      total_amount: totalAmount,
      status: "NEW",
    };

    let { error } = await context.client.from("orders").insert({
      ...orderRecord,
      user_id: context.user?.id ?? null,
    });

    if (isMissingOrdersUserIdColumn(error)) {
      console.warn(
        "Orders API insert fallback: 'user_id' column missing, retrying without it."
      );
      ({ error } = await context.client.from("orders").insert(orderRecord));
    }

    if (error) {
      console.error("Orders API insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to place order. Please try again." },
        { status: 500 }
      );
    }

    try {
      await sendOrderEmail({
        orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2 || undefined,
        city,
        state,
        pincode,
        landmark: landmark || undefined,
        items,
        total_amount: totalAmount,
        delivery_fee: 29,
      });
    } catch (emailError) {
      console.error("Orders API email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
      },
    });
  } catch (error) {
    if (error instanceof MobileAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("Orders API unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to place your order right now." },
      { status: 500 }
    );
  }
}
