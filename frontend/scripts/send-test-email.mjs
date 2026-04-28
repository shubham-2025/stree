/**
 * One-off: node --env-file=.env.local scripts/send-test-email.mjs
 * Sends a test message to verify Brevo SMTP (not used at runtime).
 */
import nodemailer from "nodemailer";

const to = "info.streesarees@gmail.com";
const host = process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com";
const port = Number(process.env.BREVO_SMTP_PORT?.trim() || "587");
const user = process.env.BREVO_SMTP_USER?.trim();
const pass = process.env.BREVO_SMTP_PASSWORD?.trim();
const from =
  process.env.SMTP_FROM?.trim() || "Stree Orders <info@streesarees.com>";

if (!user || !pass) {
  console.error("Missing BREVO_SMTP_USER or BREVO_SMTP_PASSWORD in env.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

const info = await transporter.sendMail({
  from,
  to,
  subject: "Stree — Brevo SMTP test",
  text:
    "This is an automated SMTP test from the Stree project. If you received this, Brevo relay is working.",
  html: `<p>This is an automated <strong>Brevo SMTP test</strong> from <strong>Stree</strong>.</p>
    <p>If you see this in your inbox, order notification email delivery should work.</p>`,
});

console.log("Sent OK. messageId:", info.messageId);
