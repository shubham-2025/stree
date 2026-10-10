import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | स्त्री (Stree)",
  description: "Terms that apply when you shop with Stree Sarees.",
};

const sections = [
  {
    title: "Orders and pricing",
    body: [
      "Product availability, prices, and descriptions may change without notice until an order is confirmed.",
      "A flat delivery fee of ₹29 is added to every paid order unless we state otherwise at checkout.",
      "We may cancel or refuse an order if stock is unavailable, details look incomplete, or we suspect misuse.",
    ],
  },
  {
    title: "Payment and delivery",
    body: [
      "Payment is Cash on Delivery unless another method is clearly offered at checkout.",
      "Delivery timelines are estimates and can vary by location and courier conditions.",
      "Please keep your phone available so the delivery partner can reach you.",
    ],
  },
  {
    title: "Returns and quality",
    body: [
      "If an item arrives damaged or incorrect, contact us promptly with your order ID and photos so we can help.",
      "Return or exchange eligibility depends on product condition and the issue reported; unused items with tags are easier to review.",
    ],
  },
  {
    title: "Accounts and acceptable use",
    body: [
      "Keep your login details secure and provide accurate contact and delivery information.",
      "Do not misuse the website or app, attempt unauthorized access, or place fraudulent orders.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these terms: info@streesarees.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <p className="text-xs uppercase tracking-wider text-muted mb-2">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Terms of Service
      </h1>
      <p className="text-sm text-muted mb-8">
        Last updated: 10 October 2026. By placing an order with Stree, you agree
        to these terms.
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
        Read our{" "}
        <Link href="/privacy-policy" className="text-brand hover:underline">
          Privacy Policy
        </Link>{" "}
        to learn how we handle personal data.
      </p>
    </div>
  );
}
