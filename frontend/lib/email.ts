import nodemailer from "nodemailer";

const WEBSITE_FROM = '"Stree Sarees Website" <info.streesarees@gmail.com>';

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
  customer_email: string;
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

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendOrderEmail(data: OrderEmailData) {
  const transporter = createGmailTransport();
  const mailTo = getRequiredEnv("MAIL_TO");
  const placedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const itemCount = data.items.reduce((total, item) => total + item.qty, 0);

  const itemRows = data.items
    .map(
      (item, index) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;color:#6b7280;">
          ${index + 1}
        </td>
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
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;color:#111827;">
          ₹${item.price.toLocaleString("en-IN")}
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
          <table style="width:100%;">
            <tr>
              <td>
                <p style="margin:0;font-size:14px;color:#6b7280;">Order ID</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">${escapeHtml(data.orderId)}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0;font-size:14px;color:#6b7280;">Placed At (IST)</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#111827;">${escapeHtml(placedAt)}</p>
              </td>
            </tr>
          </table>
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
            <td style="padding:6px 0;color:#6b7280;">Email</td>
            <td style="padding:6px 0;color:#111827;font-weight:600;">${escapeHtml(data.customer_email)}</td>
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
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:600;">#</th>
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:600;">Image</th>
              <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:600;">Product</th>
              <th style="padding:10px 12px;text-align:center;color:#6b7280;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;color:#6b7280;font-weight:600;">Unit Price</th>
              <th style="padding:10px 12px;text-align:right;color:#6b7280;font-weight:600;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
          <p style="margin:0;color:#374151;font-size:14px;">
            <strong>Total Items:</strong> ${itemCount} &nbsp;|&nbsp;
            <strong>Line Items:</strong> ${data.items.length}
          </p>
        </div>

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

  const subject = `🛍️ New Order — ${data.customer_name} (₹${data.total_amount.toLocaleString("en-IN")})`;

  try {
    const adminInfo = await transporter.sendMail({
      from: WEBSITE_FROM,
      to: mailTo,
      subject,
      html,
    });

    const customerSubject = `Thanks for purchasing with Stree Sarees - Order #${data.orderId}`;
    const customerText = [
      `Hi ${data.customer_name},`,
      "",
      "Thank you for purchasing with Stree Sarees.",
      `Your order number is ${data.orderId}.`,
      "",
      "Order summary:",
      ...data.items.map(
        (item) =>
          `- ${item.title}${item.color ? ` (${item.color})` : ""} x ${item.qty} = ₹${(
            item.price * item.qty
          ).toLocaleString("en-IN")}`
      ),
      "",
      `Total Amount: ₹${data.total_amount.toLocaleString("en-IN")}`,
      "Payment Mode: Cash on Delivery",
      "",
      "We will contact you soon for confirmation.",
      "",
      "Team Stree Sarees",
    ].join("\n");

    const customerHtml = `
      <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;color:#111827;">
        <div style="background:#b91c1c;padding:20px 24px;border-radius:12px 12px 0 0;color:#fff;">
          <h1 style="margin:0;font-size:24px;">Thank you for ordering with Stree Sarees</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#fee2e2;">Your order has been placed successfully.</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 12px;">Hi <strong>${escapeHtml(data.customer_name)}</strong>,</p>
          <p style="margin:0 0 16px;">Your order number is <strong>${escapeHtml(data.orderId)}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Item</th>
                <th style="padding:10px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
                <th style="padding:10px;border:1px solid #e5e7eb;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `<tr>
                    <td style="padding:10px;border:1px solid #e5e7eb;">
                      ${escapeHtml(item.title)}
                      ${item.color ? `<br /><span style="font-size:12px;color:#6b7280;">Color: ${escapeHtml(item.color)}</span>` : ""}
                    </td>
                    <td style="padding:10px;border:1px solid #e5e7eb;text-align:center;">${item.qty}</td>
                    <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">₹${(item.price * item.qty).toLocaleString("en-IN")}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <p style="margin:16px 0 0;font-size:16px;font-weight:700;">Total: ₹${data.total_amount.toLocaleString("en-IN")}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Payment: Cash on Delivery</p>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Thanks for purchasing with Stree Sarees.</p>
        </div>
      </div>
    `;

    const customerInfo = await transporter.sendMail({
      from: WEBSITE_FROM,
      to: data.customer_email,
      subject: customerSubject,
      text: customerText,
      html: customerHtml,
    });

    console.log(
      "[stree] Order emails sent:",
      mailTo,
      data.customer_email,
      adminInfo.messageId ?? "",
      customerInfo.messageId ?? ""
    );
    return { ok: true as const, id: adminInfo.messageId };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[stree] Gmail SMTP order email failed:", message);
    return { ok: false as const, reason: "smtp_failed" as const, error: message };
  }
}

function getRequiredEnv(name: "SMTP_USER" | "SMTP_PASS" | "MAIL_TO"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createGmailTransport() {
  const smtpUser = getRequiredEnv("SMTP_USER");
  const smtpPass = getRequiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendContactEmail(data: ContactEmailData) {
  const transporter = createGmailTransport();
  const mailTo = getRequiredEnv("MAIL_TO");

  const subject = `New website enquiry from ${data.name}`;
  const text = [
    "New contact form submission",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone?.trim() || "Not provided"}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px;">New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(data.phone?.trim() || "Not provided")}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
  `;

  return transporter.sendMail({
    from: WEBSITE_FROM,
    to: mailTo,
    replyTo: data.email,
    subject,
    text,
    html,
  });
}
