export type VFNavItem = {
  label: string;
  href: string;
  active?: boolean;
  permission?: string;
  /** From veriforge-icons category */
  icon?:
    | "training"
    | "verification"
    | "compliance"
    | "incidents"
    | "equipment"
    | "fieldOps"
    | "risk"
    | "audit"
    | "culture"
    | "emergency"
    | "contractor";
  /** Critical system alerts only — controlled red, never routine nav */
  critical?: boolean;
  section?: string;
};
