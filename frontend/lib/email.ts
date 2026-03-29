import { Resend } from "resend";

/** Where new-order alerts go. Override with ORDER_NOTIFICATION_EMAIL in env. */
const DEFAULT_ORDER_EMAIL = "shubhammahapure1010@gmail.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Safe for HTML attribute (e.g. img src) */
function escapeAttr(s: string): string {
  return s.replace(/"/g, "%22").replace(/'/g, "%27");
}

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
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[stree] RESEND_API_KEY not set — order email skipped. Add it in Vercel → Environment Variables."
    );
    return { ok: false as const, reason: "missing_api_key" };
  }

  const toEmail =
    process.env.ORDER_NOTIFICATION_EMAIL?.trim() || DEFAULT_ORDER_EMAIL;
  const fromEmail =
    process.env.RESEND_FROM?.trim() ||
    "Stree Orders <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <img src="${escapeAttr(item.image || "")}" alt="${escapeHtml(item.title)}" width="60" height="75"
               style="object-fit:cover;border-radius:8px;border:1px solid #eee;" />
        </td>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          <strong style="color:#111827;">${escapeHtml(item.title)}</strong>
          ${item.color ? `<br/><span style="color:#6b7280;font-size:13px;">Color: ${escapeHtml(item.color)}</span>` : ""}
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
    .map((line) => escapeHtml(String(line)))
    .join("<br/>");

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#b91c1c;padding:24px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">🛍️ New Order Received!</h1>
        <p style="margin:4px 0 0;color:#fca5a5;font-size:14px;">स्त्री (Stree) — Cash on Delivery</p>
      </div>

      <div style="padding:24px 32px;">
        <div style="background:#fef2f2;border-radius:8px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#6b7280;">Order ID</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">${escapeHtml(data.orderId)}</p>
        </div>

        <h2 style="font-size:16px;color:#111827;margin:0 0 12px;border-bottom:2px solid #b91c1c;padding-bottom:8px;">
          👤 Customer Details
        </h2>
        <table style="width:100%;font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:6px 0;color:#6b7280;width:120px;">Name</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(data.customer_name)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;">Phone</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(data.phone)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Address</td>
            <td style="padding:6px 0;color:#111827;">${address}</td>
          </tr>
        </table>

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

        <div style="background:#111827;border-radius:8px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
          <table style="width:100%;"><tr>
            <td style="color:#fff;font-size:18px;font-weight:700;">Total Amount</td>
            <td style="text-align:right;color:#fca5a5;font-size:22px;font-weight:800;">₹${data.total_amount.toLocaleString("en-IN")}</td>
          </tr></table>
        </div>

        <div style="margin-top:16px;text-align:center;padding:16px;background:#fef2f2;border-radius:8px;">
          <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:600;">💵 Payment Method: Cash on Delivery</p>
        </div>
      </div>

      <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#6b7280;">
          This is an automated email from स्त्री (Stree). Please confirm this order.
        </p>
      </div>
    </div>
  </body>
  </html>`;

  // Resend SDK returns { data, error } — it does NOT throw on 4xx/5xx.
  const { data: sent, error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: `🛍️ New Order — ${data.customer_name} (₹${data.total_amount.toLocaleString("en-IN")})`,
    html,
  });

  if (error) {
    console.error("[stree] Resend order email failed:", JSON.stringify(error));
    return { ok: false as const, reason: "resend_api", error };
  }

  console.log("[stree] Order email sent to", toEmail, sent?.id ?? "");
  return { ok: true as const, id: sent?.id };
}
