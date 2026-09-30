export const VERIFORGE_MOBILE_BASE = "/veriforge/mobile";

export type MobileNavTab = {
  id: string;
  label: string;
  href: string;
  icon:
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
  match?: (pathname: string) => boolean;
};

export const MOBILE_BOTTOM_TABS: MobileNavTab[] = [
  {
    id: "dashboard",
    label: "Home",
    href: `${VERIFORGE_MOBILE_BASE}/dashboard`,
    icon: "verification",
    match: (p) =>
      p === `${VERIFORGE_MOBILE_BASE}/dashboard` || p === VERIFORGE_MOBILE_BASE,
  },
  {
    id: "training",
    label: "Train",
    href: `${VERIFORGE_MOBILE_BASE}/training`,
    icon: "training",
    match: (p) => p.startsWith(`${VERIFORGE_MOBILE_BASE}/training`),
  },
  {
    id: "verification",
    label: "Verify",
    href: `${VERIFORGE_MOBILE_BASE}/verification`,
    icon: "verification",
    match: (p) => p.startsWith(`${VERIFORGE_MOBILE_BASE}/verification`),
  },
  {
    id: "incidents",
    label: "Incidents",
    href: `${VERIFORGE_MOBILE_BASE}/incidents`,
    icon: "incidents",
    match: (p) => p.startsWith(`${VERIFORGE_MOBILE_BASE}/incidents`),
  },
  {
    id: "profile",
    label: "Profile",
    href: `${VERIFORGE_MOBILE_BASE}/profile`,
    icon: "contractor",
    match: (p) =>
      p.startsWith(`${VERIFORGE_MOBILE_BASE}/profile`) ||
      p.startsWith(`${VERIFORGE_MOBILE_BASE}/notifications`) ||
      p.startsWith(`${VERIFORGE_MOBILE_BASE}/compliance`),
  },
];

export const SHELL_HIDDEN_PREFIXES = [
  `${VERIFORGE_MOBILE_BASE}/splash`,
  `${VERIFORGE_MOBILE_BASE}/auth`,
];
