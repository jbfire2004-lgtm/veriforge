import type { LucideIcon } from "lucide-react";

export type VeraSize = "sm" | "md" | "lg";

export type VeraTone = "default" | "success" | "warning" | "danger" | "info";

export type VeraLoadingState = {
  loading?: boolean;
  disabled?: boolean;
};

export type VeraFieldProps = {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  id?: string;
};

export type VeraIconLabel = {
  icon?: LucideIcon;
  label: string;
};
