import type { SubscriptionDisplayTier } from "@/lib/admin-subscriptions-api";

export const TIER_PIN_COLORS: Record<SubscriptionDisplayTier, string> = {
  Free: "#94a3b8",
  Core: "#2F8F8C",
  PM: "#1E6FB8",
  "Full Suite": "#7c3aed",
  Custom: "#C89F3D",
};

export const TIER_OPTIONS = [
  { key: "free", label: "Free" },
  { key: "basic", label: "Free" },
  { key: "pro", label: "Core" },
  { key: "pm", label: "PM" },
  { key: "professional", label: "PM" },
  { key: "enterprise", label: "Full Suite" },
  { key: "predictive", label: "Full Suite" },
] as const;

export const MODULE_OPTIONS = [
  { id: "core", label: "Core" },
  { id: "pm", label: "PM" },
  { id: "training", label: "Training" },
  { id: "equipment", label: "Equipment" },
  { id: "compliance", label: "Compliance" },
  { id: "union_halls", label: "Union Halls" },
  { id: "providers", label: "Providers" },
] as const;
