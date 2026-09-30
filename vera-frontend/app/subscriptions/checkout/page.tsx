import { Suspense } from "react";
import SubscriptionsCheckoutPage from "@/src/pages/subscriptions/checkout";

export const metadata = {
  title: "Checkout — VERA Subscriptions",
  description: "Confirm your Vera subscription plan and add-ons.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-[#5a6b7c]">
          Loading checkout…
        </div>
      }
    >
      <SubscriptionsCheckoutPage />
    </Suspense>
  );
}
