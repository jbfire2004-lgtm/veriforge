/**
 * Interaction design rules (§4) — shared behavior contracts for VERA Core UI.
 */

export const interactionRules = {
  click: {
    primaryActionPosition: "top-right",
    secondaryInOverflow: true,
    rowOpensDetail: true,
  },
  hover: {
    highlightRows: true,
    showQuickActions: true,
  },
  modal: {
    escapeCloses: true,
    backdropCloses: true,
    backdropClosesDestructive: false,
  },
  form: {
    autoSaveDrafts: true,
    validateOnBlur: true,
    multiStepForComplex: true,
  },
  mobile: {
    sidebarCollapses: true,
    tablesAsCards: true,
    quickActionsFab: true,
  },
} as const;
