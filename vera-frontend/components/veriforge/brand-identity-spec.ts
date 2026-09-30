/**
 * VeriForge brand identity — professional safety compliance platform.
 * Visual language inspired by inspection tags, safety signage, and ISO iconography.
 */

export const VERIFORGE_VISUAL_LANGUAGE = {
  tone: "Industrial, structured, modern — calm authority over spectacle.",
  inspiration: [
    "Physical inspection tags and equipment certification plates",
    "ISO / ANSI line signage and compliance diagrams",
    "Survey registration marks and verification seals",
    "Enterprise audit dashboards — not consumer product UI",
  ],
  palette: {
    foundation: "Slate #2A2E33 · Graphite #3B3F45 · Iron #1C1F24 (structure only)",
    accents: "Safety blue #1E6FB8 · Inspection teal #2F8F8C",
    status: "Muted amber #C89F3D · Soft green #4FAF6F",
    critical: "Controlled red #B33A3A — alerts only, never brand fills or CTAs",
  },
  avoid: [
    "Aggressive reds or black-heavy danger motifs",
    "Gloss, neon, purple gradients, or consumer illustration styles",
    "Playful mascots, emoji, or rounded-pill marketing chrome",
    "Rotating, stretching, or recoloring the brand mark arbitrarily",
  ],
} as const;

export const VERIFORGE_LOGO_DIRECTION = {
  concept:
    "Geometric verification motif — an inspection tag plate containing a compliance frame and verified check.",
  meaning: [
    "Verification — the check confirms evidence, not assumption",
    "Inspection — the tag plate and registration hole echo field certification",
    "Compliance — the framed seal signals structured, auditable control",
    "Trust — slate/graphite + blue/teal communicate calm industrial authority",
  ],
  construction: {
    plate: "Slate → graphite matte fill with clipped inspection-tag corner",
    frame: "Safety-blue geometric verification rectangle",
    check: "Inspection-teal compliance stroke",
    registration: "Structural tag hole — functional motif, not decoration",
  },
  clearSpace: "Minimum clear space equals the mark height on all sides.",
  variants: ["default (dark surfaces)", "outline (diagrams)", "mono (single-tone print)"],
} as const;

export const VERIFORGE_IMAGERY_RULES = {
  prefer: [
    "Clean ISO-style line icons on muted plates",
    "Minimalist process / compliance diagrams",
    "Structured grids, meters, and audit tables",
    "Photographic field context only when documentary and restrained",
  ],
  forbid: [
    "Playful or consumer-style illustrations",
    "3D glossy renders, neon glows, or sticker aesthetics",
    "Cartoon characters, mascots, or emoji as brand imagery",
    "Heavy black/red hazard posters as default brand art",
  ],
} as const;

export const VERIFORGE_BRAND_POSITIONING = {
  category: "Professional safety compliance platform",
  promise: "Safety should be verified, not assumed.",
  audience: "Enterprise operations, EHS, contractors, and field supervisors",
  differentiator:
    "One industrial system for training, verification, inspection, and incident control — built for auditability and trust.",
} as const;
