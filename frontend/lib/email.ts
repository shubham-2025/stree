import { Resend } from "resend";

const ADMIN_EMAIL = "shubhammahapure7@gmail.com";

interface OrderEmailData {
  orderId: string;
  customer_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  items: {
    title: string;
    price: number;
    qty: number;
    color: string;
    image: string;
  }[];
  total_amount: number;
}

export async function sendOrderEmail(data: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping order email.");
    return;
  }

  const resend = new Resend(apiKey);

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <img src="${item.image}" alt="${item.title}" width="60" height="75"
               style="object-fit:cover;border-radius:8px;border:1px solid #eee;" />
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <strong style="color:#111827;">${item.title}</strong>
          ${item.color ? `<br/><span style="color:#6b7280;font-size:13px;">Color: ${item.color}</span>` : ""}
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;color:#111827;">
          ${item.qty}
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;color:#111827;font-weight:600;">
          ₹${(item.price * item.qty).toLocaleString("en-IN")}
        </td>
      </tr>`
    )
    .join("");

  const address = [
    data.address_line1,
    data.address_line2,
    data.city + ", " + data.state + " - " + data.pincode,
    data.landmark ? `Landmark: ${data.landmark}` : "",
  ]
    .filter(Boolean)
    .join("<br/>");

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background:#b91c1c;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">🛍️ New Order Received!</h1>
        <p style="margin:4px 0 0;color:#fca5a5;font-size:14px;">स्त्री (Stree) — Cash on Delivery</p>
      </div>

      <div style="padding:24px 32px;">
        <!-- Order ID -->
        <div style="background:#fef2f2;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#6b7280;">Order ID</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">${data.orderId}</p>
        </div>

        <!-- Customer Details -->
        <h2 style="font-size:16px;color:#111827;margin:0 0 12px;border-bottom:2px solid #b91c1c;padding-bottom:8px;">
          👤 Customer Details
        </h2>
        <table style="width:100%;font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;width:120px;">Name</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;">${data.customer_name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;">Phone</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Address</td>
            <td style="padding:6px 0;color:#111827;">${address}</td>
          </tr>
        </table>

        <!-- Order Items -->
        <h2 style="font-size:16px;color:#111827;margin:0 0 12px;border-bottom:2px solid #b91c1c;padding-bottom:8px;">
          📦 Order Items
        </h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:600;">Image</th>
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:600;">Product</th>
              <th style="padding:10px 12px;text-align:center;color:#6b7280;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;color:#6b7280;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- Total -->
        <div style="background:#111827;border-radius:8px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
          <table style="width:100%;"><tr>
            <td style="color:#fff;font-size:18px;font-weight:700;">Total Amount</td>
            <td style="text-align:right;color:#fca5a5;font-size:22px;font-weight:800;">₹${data.total_amount.toLocaleString("en-IN")}</td>
          </tr></table>
        </div>

        <!-- Payment -->
        <div style="margin-top:16px;text-align:center;padding:16px;background:#fef2f2;border-radius:8px;">
          <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:600;">💵 Payment Method: Cash on Delivery</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#6b7280;">
          This is an automated email from स्त्री (Stree). Please confirm this order.
        </p>
      </div>
    </div>
  </body>
  </html>`;

  try {
    await resend.emails.send({
      from: "Stree Orders <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🛍️ New Order Details — ${data.customer_name} (₹${data.total_amount.toLocaleString("en-IN")})`,
      html,
    });
    console.log("Order email sent to", ADMIN_EMAIL);
  } catch (err) {
    console.error("Failed to send order email:", err);
  }
}

