import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | स्त्री (Stree)",
  description:
    "How Stree Sarees collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information we collect",
    body: [
      "Account details such as name, email address, and phone number when you register or place an order.",
      "Delivery address and order details needed to fulfil Cash on Delivery purchases.",
      "Basic device and usage information when you use our website or mobile app (for example, pages viewed and cart activity stored on your device).",
    ],
  },
  {
    title: "How we use your information",
    body: [
      "To process orders, arrange delivery, and send order confirmation or tracking emails.",
      "To manage your account, wishlist, and customer support requests.",
      "To improve our shop experience and keep the service secure.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "We do not sell your personal information.",
      "We may share order and address details with delivery partners solely to complete your shipment.",
      "We use trusted service providers (for example hosting, authentication, and email delivery) who process data only to run Stree services.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Orders are Cash on Delivery. We do not collect or store card or UPI credentials on this site.",
    ],
  },
  {
    title: "Data retention",
    body: [
      "We keep order and account records for as long as needed to fulfil orders, provide support, and meet legal or accounting requirements.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can request access, correction, or deletion of your account data by emailing us.",
      "You can stop marketing emails using the unsubscribe option in those messages, where applicable.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions, contact info@streesarees.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted mb-8">
        Last updated: 10 October 2026. This policy applies to{" "}
        <Link href="/home" className="text-brand hover:underline">
          stree-sarees-com.vercel.app
        </Link>{" "}
        and the Stree Sarees mobile app.
      </p>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              {section.title}
            </h2>
            <ul className="space-y-2 text-sm text-muted leading-relaxed list-disc pl-5">
              {section.body.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        See also our{" "}
        <Link href="/terms" className="text-brand hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
