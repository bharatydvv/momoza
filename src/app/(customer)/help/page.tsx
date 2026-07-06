"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse momos, add your favourites to the cart, and tap Checkout. You'll need to sign in before placing your first order.",
  },
  {
    q: "How does coin cashback work?",
    a: "You earn coins on every delivered order and can redeem them for a discount on your next order from the Checkout page.",
  },
  {
    q: "How do I refer a friend?",
    a: "Share your referral code from the Referral & Points page. Both of you get bonus coins once they sign up with it.",
  },
  {
    q: "How do I request a refund?",
    a: "Go to Your Orders, find the delivered order, tap Request Refund, and describe the issue. Our team will review it shortly.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is being prepared, a live tracking bar appears at the bottom of the app showing Cooking → Packing → Out for Delivery → Arrived.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Help &amp; Support</h1>
      <p className="text-muted text-sm mb-5">
        Answers to common questions. Still stuck? Reach out to us anytime.
      </p>

      <div className="card divide-y divide-line mb-5">
        {FAQS.map((f, i) => (
          <div key={f.q}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left p-4 flex items-center justify-between gap-3"
            >
              <span className="font-medium text-sm">{f.q}</span>
              <span
                className={cx(
                  "text-muted transition-transform",
                  openIndex === i && "rotate-180"
                )}
              >
                ▾
              </span>
            </button>
            {openIndex === i && (
              <p className="px-4 pb-4 text-sm text-muted leading-relaxed">{f.a}</p>
            )}
          </div>
        ))}
      </div>

      <div className="card p-4">
        <p className="font-semibold text-sm mb-2">Contact Us</p>
        <p className="text-sm text-muted">📞 +91 90000 00000</p>
        <p className="text-sm text-muted">✉️ support@momoza.app</p>
        <p className="text-sm text-muted">🕒 Everyday, 11 AM – 11 PM</p>
      </div>
    </div>
  );
}
