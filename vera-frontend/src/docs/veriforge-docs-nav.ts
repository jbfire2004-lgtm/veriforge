/**
 * VeriForge industrial docs — navigation tree
 * Mirrors veriforge/docs/ structure
 */

export type VeriForgeDocNavItem = {
  id: string;
  label: string;
  /** Path under veriforge/docs (no leading slash), e.g. getting-started/README.md */
  file: string;
  /** URL slug under /veriforge/docs */
  slug: string;
};

export type VeriForgeDocNavSection = {
  id: string;
  label: string;
  items: VeriForgeDocNavItem[];
};

export const VERIFORGE_DOCS_NAV: VeriForgeDocNavSection[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    items: [
      {
        id: "gs-overview",
        label: "Overview",
        file: "getting-started/README.md",
        slug: "getting-started",
      },
    ],
  },
  {
    id: "design-system",
    label: "Design System",
    items: [
      {
        id: "ds-overview",
        label: "Tokens & Identity",
        file: "design-system/README.md",
        slug: "design-system",
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    items: [
      {
        id: "comp-overview",
        label: "VF Library",
        file: "components/README.md",
        slug: "components",
      },
    ],
  },
  {
    id: "motion",
    label: "Motion",
    items: [
      {
        id: "motion-overview",
        label: "Primitives",
        file: "motion/README.md",
        slug: "motion",
      },
    ],
  },
  {
    id: "icons",
    label: "Icons",
    items: [
      {
        id: "icons-overview",
        label: "Iconography",
        file: "icons/README.md",
        slug: "icons",
      },
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    items: [
      {
        id: "arch-overview",
        label: "Enterprise & Routing",
        file: "architecture/README.md",
        slug: "architecture",
      },
    ],
  },
  {
    id: "systems",
    label: "Systems",
    items: [
      {
        id: "sys-overview",
        label: "Engines",
        file: "systems/README.md",
        slug: "systems",
      },
    ],
  },
  {
    id: "api",
    label: "API",
    items: [
      {
        id: "api-overview",
        label: "REST & Meta",
        file: "api/README.md",
        slug: "api",
      },
    ],
  },
  {
    id: "deployment",
    label: "Deployment",
    items: [
      {
        id: "deploy-overview",
        label: "Build & Playbook",
        file: "deployment/README.md",
        slug: "deployment",
      },
    ],
  },
  {
    id: "glossary",
    label: "Glossary",
    items: [
      {
        id: "glossary-overview",
        label: "Terms",
        file: "glossary/README.md",
        slug: "glossary",
      },
    ],
  },
];

export const VERIFORGE_DOCS_HOME = {
  file: "README.md",
  slug: "",
  label: "Documentation Home",
} as const;

export function findDocBySlug(
  slug: string | undefined,
): { file: string; label: string; sectionId?: string } {
  if (!slug || slug === "index") {
    return { file: VERIFORGE_DOCS_HOME.file, label: VERIFORGE_DOCS_HOME.label };
  }
  for (const section of VERIFORGE_DOCS_NAV) {
    for (const item of section.items) {
      if (item.slug === slug) {
        return { file: item.file, label: item.label, sectionId: section.id };
      }
    }
  }
  return { file: VERIFORGE_DOCS_HOME.file, label: VERIFORGE_DOCS_HOME.label };
}

export function allDocSlugs(): string[] {
  return VERIFORGE_DOCS_NAV.flatMap((s) => s.items.map((i) => i.slug));
}
