"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";
import {
  VERIFORGE_ICONS,
  type VeriForgeIconCategory,
  type VeriForgeIconTone,
} from "@/src/icons/veriforge-icons";
import { COLORS, SHADOWS } from "@/src/theme/veriforge-tokens";
import { vfTokenVars } from "./utils";
import styles from "./VFIcon.module.css";

export type VFIconTone = VeriForgeIconTone;
export type VFIconCategory = VeriForgeIconCategory;

export interface VFIconProps {
  /** Category key (training, verification, …) or legacy catalog id */
  id?: string;
  category?: VeriForgeIconCategory;
  tone?: VFIconTone;
  size?: number;
  tile?: boolean;
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const toneClass: Record<VFIconTone, string> = {
  neutral: styles.neutral,
  active: styles.active,
  critical: styles.critical,
  contrast: styles.contrast,
};

const LEGACY_ID_TO_CATEGORY: Record<string, VeriForgeIconCategory> = {
  "ico-train-module": "training",
  "ico-train-progress": "training",
  "ico-train-cert": "training",
  training: "training",
  "ico-ver-check": "verification",
  "ico-ver-status": "verification",
  "ico-ver-flow": "verification",
  verification: "verification",
  "ico-comp-doc": "compliance",
  "ico-comp-expiry": "compliance",
  "ico-comp-req": "compliance",
  compliance: "compliance",
  "ico-inc-sev": "incidents",
  "ico-inc-inv": "incidents",
  "ico-inc-ca": "incidents",
  incidents: "incidents",
  "ico-eq-insp": "equipment",
  "ico-eq-def": "equipment",
  "ico-eq-cert": "equipment",
  equipment: "equipment",
  "ico-field-task": "fieldOps",
  "ico-field-haz": "fieldOps",
  "ico-field-gps": "fieldOps",
  "ico-field-checkin": "fieldOps",
  fieldOps: "fieldOps",
  "ico-risk-haz": "risk",
  "ico-risk-ctrl": "risk",
  "ico-risk-score": "risk",
  risk: "risk",
  "ico-audit-log": "audit",
  "ico-audit-ev": "audit",
  "ico-audit-score": "audit",
  audit: "audit",
  "ico-cult-beh": "culture",
  "ico-cult-eng": "culture",
  "ico-cult-camp": "culture",
  culture: "culture",
  "ico-em-alert": "emergency",
  "ico-em-evac": "emergency",
  "ico-em-muster": "emergency",
  emergency: "emergency",
  "ico-ctr-badge": "contractor",
  "ico-ctr-onboard": "contractor",
  "ico-ctr-access": "contractor",
  contractor: "contractor",
};

function resolveCategory(
  category?: VeriForgeIconCategory,
  id?: string,
): VeriForgeIconCategory {
  if (category && category in VERIFORGE_ICONS) return category;
  if (id && LEGACY_ID_TO_CATEGORY[id]) return LEGACY_ID_TO_CATEGORY[id];
  if (id && id in VERIFORGE_ICONS) return id as VeriForgeIconCategory;
  return "verification";
}

export function VFIcon({
  id,
  category,
  tone = "neutral",
  size = 24,
  tile = false,
  active = false,
  className,
  style,
}: VFIconProps) {
  const resolvedTone: VFIconTone =
    active && tone === "neutral" ? "active" : tone;
  const resolved = resolveCategory(category, id);
  const Comp = VERIFORGE_ICONS[resolved];

  return (
    <span
      className={cn(
        styles.icon,
        toneClass[resolvedTone],
        tile && styles.tile,
        (active || resolvedTone === "critical" || resolvedTone === "active") &&
          tile &&
          styles.tileActive,
        className,
      )}
      style={vfTokenVars({
        ["--vf-forge-red" as string]: COLORS.forgeRed,
        ["--vf-glow" as string]: SHADOWS.metallicShadow,
        ...style,
      })}
    >
      <Comp tone={resolvedTone} size={size} />
    </span>
  );
}

export default VFIcon;
