import nodemailer from "nodemailer";

const DEFAULT_FROM = '"Stree Sarees Website" <info.streesarees@gmail.com>';

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

const DEFAULT_DELIVERY_FEE = 29;

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
  /** Flat delivery fee included in total_amount. Defaults to ₹29. */
  delivery_fee?: number;
}

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
}

export async function sendOrderEmail(data: OrderEmailData) {
  const transporter = createSmtpTransport();
  const mailTo = getRequiredEnv("MAIL_TO", ["ORDER_NOTIFICATION_EMAIL"]);
  const fromAddress = getOptionalEnv(["SMTP_FROM"]) || DEFAULT_FROM;
  const placedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const itemCount = data.items.reduce((total, item) => total + item.qty, 0);
  const itemsSubtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const deliveryFee =
    typeof data.delivery_fee === "number" && Number.isFinite(data.delivery_fee)
      ? data.delivery_fee
      : DEFAULT_DELIVERY_FEE;
  const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  const amountBreakdownHtml = `
        <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Items subtotal</td>
              <td style="padding:6px 0;text-align:right;color:#111827;font-weight:600;">${formatInr(itemsSubtotal)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Delivery fee</td>
              <td style="padding:6px 0;text-align:right;color:#111827;font-weight:600;">${formatInr(deliveryFee)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0;border-top:1px solid #e5e7eb;color:#111827;font-weight:700;">Payable total</td>
              <td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;color:#b91c1c;font-weight:800;font-size:16px;">${formatInr(data.total_amount)}</td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">
            A flat delivery fee of ${formatInr(deliveryFee)} is added to every order.
          </p>
        </div>`;

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

        ${amountBreakdownHtml}

        <div style="background:#111827;border-radius:8px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
          <table style="width:100%;"><tr>
            <td style="color:#fff;font-size:18px;font-weight:700;">Total Amount (incl. delivery)</td>
            <td style="text-align:right;color:#fca5a5;font-size:22px;font-weight:800;">${formatInr(data.total_amount)}</td>
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
      from: fromAddress,
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
      `Items subtotal: ${formatInr(itemsSubtotal)}`,
      `Delivery fee: ${formatInr(deliveryFee)}`,
      `Payable total: ${formatInr(data.total_amount)}`,
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
          <table style="width:100%;margin-top:16px;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Items subtotal</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;">${formatInr(itemsSubtotal)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;">Delivery fee</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;">${formatInr(deliveryFee)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0;border-top:1px solid #e5e7eb;font-weight:700;">Payable total</td>
              <td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-weight:800;color:#b91c1c;font-size:16px;">${formatInr(data.total_amount)}</td>
            </tr>
          </table>
          <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">A flat delivery fee of ${formatInr(deliveryFee)} is added to every order.</p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Payment: Cash on Delivery</p>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">Thanks for purchasing with Stree Sarees.</p>
        </div>
      </div>
    `;

    const customerInfo = await transporter.sendMail({
      from: fromAddress,
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
    console.error("[stree] SMTP order email failed:", message);
    return { ok: false as const, reason: "smtp_failed" as const, error: message };
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const transporter = createSmtpTransport();
  const fromAddress = getOptionalEnv(["SMTP_FROM"]) || DEFAULT_FROM;
  const subject = "Welcome to Stree Sarees";
  const safeName = escapeHtml(data.name.trim() || "Stree Customer");
  const safeEmail = data.email.trim().toLowerCase();

  const text = [
    `Hi ${data.name || "Stree Customer"},`,
    "",
    "Thanks for creating your Stree Sarees account.",
    "Your account is now ready for mobile sign-in and order tracking.",
    "",
    "What this account helps with:",
    "- your future orders stay linked to this account",
    "- you can view your order history inside the app",
    "- your saved address makes checkout faster next time",
    "",
    "If you ever forget your password, you can use the reset password link from the app sign-in screen.",
    "",
    "Team Stree Sarees",
  ].join("\n");

  const html = `
    <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;color:#111827;">
      <div style="background:#7b1e3a;padding:22px 24px;border-radius:12px 12px 0 0;color:#fff;">
        <h1 style="margin:0;font-size:24px;">Welcome to Stree Sarees</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#f8d7df;">Your account is ready.</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px;">Hi <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 16px;">
          Thank you for registering with Stree Sarees using <strong>${escapeHtml(safeEmail)}</strong>.
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;">
          <p style="margin:0 0 10px;font-weight:700;">What your account helps with:</p>
          <ul style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
            <li>Future orders stay linked to your account.</li>
            <li>You can view your order history in the mobile app.</li>
            <li>Your saved address makes checkout faster next time.</li>
          </ul>
        </div>
        <p style="margin:16px 0 0;color:#4b5563;line-height:1.7;">
          You can now sign in on the Stree mobile app and place orders with full account tracking.
        </p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: safeEmail,
      subject,
      text,
      html,
    });

    console.log("[stree] Welcome email sent:", safeEmail, info.messageId ?? "");
    return { ok: true as const, id: info.messageId };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[stree] Welcome email failed:", message);
    return { ok: false as const, reason: "smtp_failed" as const, error: message };
  }
}

function getRequiredEnv(primary: string, aliases: string[] = []): string {
  const value = getOptionalEnv([primary, ...aliases]);
  if (!value) {
    const keys = [primary, ...aliases].join(" or ");
    throw new Error(`Missing required environment variable: ${keys}`);
  }
  return value;
}

function createSmtpTransport() {
  const provider = (getOptionalEnv(["SMTP_PROVIDER"]) || "").toLowerCase();
  const explicitHost = getOptionalEnv(["SMTP_HOST"]);
  const gmailUser = getOptionalEnv(["SMTP_USER"]);
  const gmailPass = getOptionalEnv(["SMTP_PASS"]);
  const brevoHost = getOptionalEnv(["BREVO_SMTP_HOST"]);
  const brevoUser = getOptionalEnv(["BREVO_SMTP_USER"]);
  const brevoPass = getOptionalEnv(["BREVO_SMTP_PASSWORD"]);

  // Use Gmail SMTP_* whenever present, unless SMTP_PROVIDER=brevo.
  // Expired Brevo credentials were blocking purchase confirmation emails.
  const preferGmail =
    provider !== "brevo" && Boolean(gmailUser && gmailPass);
  const useBrevoCredentials =
    !preferGmail && Boolean(brevoHost && brevoUser && brevoPass);

  const smtpHost =
    explicitHost ||
    (preferGmail ? "smtp.gmail.com" : undefined) ||
    (useBrevoCredentials ? brevoHost : undefined) ||
    "smtp.gmail.com";
  const smtpPort = Number(
    getOptionalEnv(["SMTP_PORT", "BREVO_SMTP_PORT"]) ||
      (smtpHost === "smtp.gmail.com" ? "465" : "587")
  );
  const smtpUser = useBrevoCredentials
    ? getRequiredEnv("BREVO_SMTP_USER", ["SMTP_USER"])
    : getRequiredEnv("SMTP_USER", ["BREVO_SMTP_USER"]);
  const smtpPass = useBrevoCredentials
    ? getRequiredEnv("BREVO_SMTP_PASSWORD", ["SMTP_PASS"])
    : getRequiredEnv("SMTP_PASS", ["BREVO_SMTP_PASSWORD"]);
  const secure =
    getOptionalEnv(["SMTP_SECURE"])?.toLowerCase() === "true" ||
    (!getOptionalEnv(["SMTP_SECURE"]) && smtpPort === 465);

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendContactEmail(data: ContactEmailData) {
  const transporter = createSmtpTransport();
  const mailTo = getRequiredEnv("MAIL_TO", ["ORDER_NOTIFICATION_EMAIL"]);
  const fromAddress = getOptionalEnv(["SMTP_FROM"]) || DEFAULT_FROM;

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
    from: fromAddress,
    to: mailTo,
    replyTo: data.email,
    subject,
    text,
    html,
  });
}

function getOptionalEnv(names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}
