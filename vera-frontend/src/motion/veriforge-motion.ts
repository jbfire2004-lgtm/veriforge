/**
 * VeriForge forged-metal motion system
 * Timing + primitives for industrial UI motion.
 */

import type { CSSProperties } from "react";

export const VERIFORGE_MOTION_TIMING = {
  fast: 120,
  medium: 240,
  heavy: 400,
} as const;

export type VeriForgeMotionWeight = keyof typeof VERIFORGE_MOTION_TIMING;

export const VERIFORGE_MOTION_EASING = {
  angular: "cubic-bezier(0.2, 0.0, 0.0, 1)",
  industrial: "cubic-bezier(0.33, 0.0, 0.2, 1)",
  rebound: "cubic-bezier(0.34, 1.2, 0.64, 1)",
} as const;

export type VeriForgeMotionPrimitive =
  | "angularSlide"
  | "metallicFade"
  | "redGlowPulse"
  | "bevelShift"
  | "industrialDrop";

export type VeriForgeMotionPrimitiveSpec = {
  id: VeriForgeMotionPrimitive;
  name: string;
  description: string;
  weight: VeriForgeMotionWeight;
  durationMs: number;
  easing: string;
  /** CSS utility class applied by the motion stylesheet */
  cssClass: string;
};

/** Core forged-metal motion primitives */
export const VERIFORGE_MOTION_PRIMITIVES: Record<
  VeriForgeMotionPrimitive,
  VeriForgeMotionPrimitiveSpec
> = {
  angularSlide: {
    id: "angularSlide",
    name: "Angular Slide",
    description: "Skewed horizontal forge slide with hard settle",
    weight: "medium",
    durationMs: VERIFORGE_MOTION_TIMING.medium,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-angular-slide",
  },
  metallicFade: {
    id: "metallicFade",
    name: "Metallic Fade",
    description: "Steel brightness fade into iron-black surface",
    weight: "medium",
    durationMs: VERIFORGE_MOTION_TIMING.medium,
    easing: VERIFORGE_MOTION_EASING.industrial,
    cssClass: "vf-m-metallic-fade",
  },
  redGlowPulse: {
    id: "redGlowPulse",
    name: "Red Glow Pulse",
    description: "Forge-red metallic glow pulse for active/critical states",
    weight: "fast",
    durationMs: VERIFORGE_MOTION_TIMING.fast,
    easing: VERIFORGE_MOTION_EASING.industrial,
    cssClass: "vf-m-red-glow-pulse",
  },
  bevelShift: {
    id: "bevelShift",
    name: "Bevel Shift",
    description: "Metallic bevel highlight sweeps across angular edges",
    weight: "heavy",
    durationMs: VERIFORGE_MOTION_TIMING.heavy,
    easing: VERIFORGE_MOTION_EASING.industrial,
    cssClass: "vf-m-bevel-shift",
  },
  industrialDrop: {
    id: "industrialDrop",
    name: "Industrial Drop",
    description: "Heavy angular drop-in with forge settle",
    weight: "heavy",
    durationMs: VERIFORGE_MOTION_TIMING.heavy,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-industrial-drop",
  },
} as const;

export type VeriForgeMotionTarget =
  | "buttons"
  | "cards"
  | "panels"
  | "modals"
  | "workflow"
  | "charts";

export type VeriForgeMotionInteraction = {
  target: VeriForgeMotionTarget;
  state: string;
  primitive: VeriForgeMotionPrimitive;
  weight: VeriForgeMotionWeight;
  durationMs: number;
  easing: string;
  cssClass: string;
  description: string;
};

/** Motion applied to forged-metal components */
export const VERIFORGE_MOTION_APPLICATIONS: VeriForgeMotionInteraction[] = [
  // Buttons
  {
    target: "buttons",
    state: "hover",
    primitive: "redGlowPulse",
    weight: "fast",
    durationMs: VERIFORGE_MOTION_TIMING.fast,
    easing: VERIFORGE_MOTION_EASING.industrial,
    cssClass: "vf-m-btn-hover",
    description: "Red metallic glow on button hover",
  },
  {
    target: "buttons",
    state: "press",
    primitive: "angularSlide",
    weight: "fast",
    durationMs: VERIFORGE_MOTION_TIMING.fast,
    easing: VERIFORGE_MOTION_EASING.rebound,
    cssClass: "vf-m-btn-press",
    description: "Angular compression on button press",
  },
  // Cards
  {
    target: "cards",
    state: "hover",
    primitive: "bevelShift",
    weight: "medium",
    durationMs: VERIFORGE_MOTION_TIMING.medium,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-card-hover",
    description: "Steel-grey lift + bevel shift on card hover",
  },
  {
    target: "cards",
    state: "active",
    primitive: "redGlowPulse",
    weight: "fast",
    durationMs: VERIFORGE_MOTION_TIMING.fast,
    easing: VERIFORGE_MOTION_EASING.industrial,
    cssClass: "vf-m-card-active",
    description: "Red glow pulse on active card",
  },
  // Panels
  {
    target: "panels",
    state: "open",
    primitive: "angularSlide",
    weight: "medium",
    durationMs: VERIFORGE_MOTION_TIMING.medium,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-panel-open",
    description: "Angular slide + metallic fade on panel open",
  },
  {
    target: "panels",
    state: "close",
    primitive: "metallicFade",
    weight: "medium",
    durationMs: VERIFORGE_MOTION_TIMING.medium,
    easing: VERIFORGE_MOTION_EASING.industrial,
    cssClass: "vf-m-panel-close",
    description: "Metallic fade collapse on panel close",
  },
  // Modals
  {
    target: "modals",
    state: "drop-in",
    primitive: "industrialDrop",
    weight: "heavy",
    durationMs: VERIFORGE_MOTION_TIMING.heavy,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-modal-drop-in",
    description: "Industrial drop-in modal entrance",
  },
  {
    target: "modals",
    state: "collapse",
    primitive: "angularSlide",
    weight: "heavy",
    durationMs: VERIFORGE_MOTION_TIMING.heavy,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-modal-collapse",
    description: "Angular collapse modal exit",
  },
  // Workflow nodes
  {
    target: "workflow",
    state: "activation",
    primitive: "redGlowPulse",
    weight: "fast",
    durationMs: VERIFORGE_MOTION_TIMING.fast,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-node-activate",
    description: "Node activation with red metallic glow",
  },
  {
    target: "workflow",
    state: "error",
    primitive: "redGlowPulse",
    weight: "fast",
    durationMs: VERIFORGE_MOTION_TIMING.fast,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-node-error",
    description: "Angular shake + red flash on workflow error",
  },
  // Charts
  {
    target: "charts",
    state: "line draw",
    primitive: "angularSlide",
    weight: "heavy",
    durationMs: VERIFORGE_MOTION_TIMING.heavy,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-chart-line",
    description: "Angular line draw across chart path",
  },
  {
    target: "charts",
    state: "bar rise",
    primitive: "industrialDrop",
    weight: "heavy",
    durationMs: VERIFORGE_MOTION_TIMING.heavy,
    easing: VERIFORGE_MOTION_EASING.angular,
    cssClass: "vf-m-chart-bar",
    description: "Industrial bar rise from baseline",
  },
];

/** CSS custom properties for motion timing / easing */
export const veriforgeMotionCssVars = {
  "--vf-motion-fast": `${VERIFORGE_MOTION_TIMING.fast}ms`,
  "--vf-motion-medium": `${VERIFORGE_MOTION_TIMING.medium}ms`,
  "--vf-motion-heavy": `${VERIFORGE_MOTION_TIMING.heavy}ms`,
  "--vf-ease-angular": VERIFORGE_MOTION_EASING.angular,
  "--vf-ease-industrial": VERIFORGE_MOTION_EASING.industrial,
  "--vf-ease-rebound": VERIFORGE_MOTION_EASING.rebound,
} as const;

/** Convenience class map for component integration */
export const veriforgeMotionClasses = {
  primitives: {
    angularSlide: VERIFORGE_MOTION_PRIMITIVES.angularSlide.cssClass,
    metallicFade: VERIFORGE_MOTION_PRIMITIVES.metallicFade.cssClass,
    redGlowPulse: VERIFORGE_MOTION_PRIMITIVES.redGlowPulse.cssClass,
    bevelShift: VERIFORGE_MOTION_PRIMITIVES.bevelShift.cssClass,
    industrialDrop: VERIFORGE_MOTION_PRIMITIVES.industrialDrop.cssClass,
  },
  buttons: {
    hover: "vf-m-btn-hover",
    press: "vf-m-btn-press",
    base: "vf-m-btn",
  },
  cards: {
    hover: "vf-m-card-hover",
    active: "vf-m-card-active",
    base: "vf-m-card",
  },
  panels: {
    open: "vf-m-panel-open",
    close: "vf-m-panel-close",
    base: "vf-m-panel",
  },
  modals: {
    dropIn: "vf-m-modal-drop-in",
    collapse: "vf-m-modal-collapse",
    base: "vf-m-modal",
  },
  workflow: {
    activation: "vf-m-node-activate",
    error: "vf-m-node-error",
    connector: "vf-m-connector-draw",
  },
  charts: {
    lineDraw: "vf-m-chart-line",
    barRise: "vf-m-chart-bar",
  },
} as const;

export function getMotionPrimitive(
  id: VeriForgeMotionPrimitive,
): VeriForgeMotionPrimitiveSpec {
  return VERIFORGE_MOTION_PRIMITIVES[id];
}

export function getMotionForTarget(
  target: VeriForgeMotionTarget,
): VeriForgeMotionInteraction[] {
  return VERIFORGE_MOTION_APPLICATIONS.filter((m) => m.target === target);
}

export function motionDuration(weight: VeriForgeMotionWeight): string {
  return `${VERIFORGE_MOTION_TIMING[weight]}ms`;
}

export function motionStyle(
  weight: VeriForgeMotionWeight = "medium",
  easing: keyof typeof VERIFORGE_MOTION_EASING = "angular",
): CSSProperties {
  return {
    ["--vf-motion-duration" as string]: motionDuration(weight),
    ["--vf-motion-easing" as string]: VERIFORGE_MOTION_EASING[easing],
    transitionDuration: motionDuration(weight),
    transitionTimingFunction: VERIFORGE_MOTION_EASING[easing],
  };
}

/** Join motion utility classes safely */
export function cnMotion(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const veriforgeMotion = {
  timing: VERIFORGE_MOTION_TIMING,
  easing: VERIFORGE_MOTION_EASING,
  primitives: VERIFORGE_MOTION_PRIMITIVES,
  applications: VERIFORGE_MOTION_APPLICATIONS,
  cssVars: veriforgeMotionCssVars,
  classes: veriforgeMotionClasses,
  getPrimitive: getMotionPrimitive,
  getForTarget: getMotionForTarget,
  duration: motionDuration,
  style: motionStyle,
  cn: cnMotion,
} as const;

export default veriforgeMotion;
