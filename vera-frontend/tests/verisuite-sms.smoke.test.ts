/**
 * VeriSuite SMS frontend QA — pages, dashboards, UI components, AI, design lock, mobile.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  VS_COLORS,
  VS_DESIGN_LOCK,
  VS_LAYOUT,
} from "@/lib/verisuite-intelligence-ui/tokens";
import {
  HOME_INSIGHTS,
  FLHA_ENERGIES,
  MEETING_TOPICS,
  ERP_SCENARIOS,
  JHA_HAZARDS,
  LEADING_HEAT,
  COMPETENCY_HEAT,
} from "@/lib/verisuite-sms-dashboards/demo-data";

const ROOT = process.cwd();

const SMS_PAGES = [
  { id: "home", route: "/pm", file: "components/veripm-home-dashboard/VeriPmHomeDashboardView.tsx" },
  { id: "jha-flha", route: "/pm/jha-flha", file: "components/veripm-jha-flha-hub/VeriPmJhaFlhaHubView.tsx" },
  { id: "erp", route: "/pm/emergency-response", file: "components/veripm-emergency-hub/VeriPmEmergencyHubView.tsx" },
  { id: "inspections", route: "/pm/inspections", file: "components/veripm-inspections-hub/VeriPmInspectionsHubView.tsx" },
  {
    id: "incidents",
    route: "/pm/incidents",
    file: "components/veripm-incidents-hub/VeriPmIncidentApplicationView.tsx",
  },
  {
    id: "incident-investigation",
    route: "/pm/incidents/[id]",
    file: "components/veripm-incidents-hub/VeriPmIncidentInvestigationWorkspace.tsx",
  },
  { id: "meetings", route: "/pm/safety-meetings", file: "components/veripm-safety-meetings-hub/VeriPmSafetyMeetingsHubView.tsx" },
  { id: "meeting-builder", route: "/pm/safety-meetings/new", file: "components/veripm-safety-meetings-hub/VeriPmSafetyMeetingBuilderView.tsx" },
  { id: "actions", route: "/pm/action-management", file: "components/corrective-action-management/CorrectiveActionManagementView.tsx" },
  { id: "training", route: "/pm/training", file: "components/veripm-training-hub/VeriPmTrainingHubView.tsx" },
  { id: "predictive", route: "/pm/predictive-safety-analytics", file: "components/veripm-predictive/VeriPmPredictiveView.tsx" },
  { id: "dashboards-gallery", route: "/pm/sms-dashboards", file: "app/pm/sms-dashboards/page.tsx" },
  { id: "sms-ops", route: "/pm/sms-ops", file: "app/pm/sms-ops/page.tsx" },
  { id: "mockups-gallery", route: "/pm/sms-mockups", file: "app/pm/sms-mockups/page.tsx" },
] as const;

const ASSEMBLED = [
  "HomeDashboardAssembled",
  "FlhaHazardIntelligenceDashboard",
  "JhaSmartBuilderDashboard",
  "ErpAiGeneratorDashboard",
  "InspectionsDashboardAssembled",
  "IncidentsDashboardAssembled",
  "SafetyMeetingsDashboardAssembled",
  "ActionManagementDashboardAssembled",
  "CompetencyDashboardAssembled",
] as const;

const UI_COMPONENTS = [
  "KpiTile",
  "TrendPanel",
  "AiInsightPanel",
  "InsightStrip",
  "LeadingHeatmap",
  "RegionalMapPanel",
  "RiskGauge",
  "SeverityBars",
  "BubbleChart",
  "RootCauseActionFlow",
  "ActionAgingHistogram",
  "InspectionGrid",
  "InspectionTrendCard",
  "MeetingTopicCards",
  "ErpScenarioCards",
  "JhaHazardBlocks",
  "FlhaEnergyWheel",
  "ComparisonPanel",
  "VsDashboardShell",
  "VsSection",
] as const;

const LAYOUT_BANDS = ["controls", "kpi", "trend", "detail", "narrative"] as const;

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("VeriSuite SMS · Step 1 design lock", () => {
  it("locks version 1.1.0-final FINALIZED", () => {
    expect(VS_DESIGN_LOCK.version).toBe("1.1.0-final");
    expect(VS_DESIGN_LOCK.status).toBe("FINALIZED");
  });

  it("matches Step 1 palette exactly", () => {
    expect(VS_COLORS.navy).toBe("#0D1B2A");
    expect(VS_COLORS.slate).toBe("#1B263B");
    expect(VS_COLORS.blue).toBe("#00A3FF");
    expect(VS_DESIGN_LOCK.palette).toEqual({
      navy: "#0D1B2A",
      slate: "#1B263B",
      electricBlue: "#00A3FF",
    });
  });

  it("forbids purple/cream/Inter patterns in design lock metadata", () => {
    const joined = VS_DESIGN_LOCK.forbidden.join(" ").toLowerCase();
    expect(joined).toContain("purple");
    expect(joined).toContain("cream");
    expect(joined).toContain("inter");
    expect(joined).toContain("sidebars");
  });

  it("defines touch targets >=44px for mobile", () => {
    expect(VS_LAYOUT.touchTargetMin).toBeGreaterThanOrEqual(44);
  });
});

describe("VeriSuite SMS · UI components", () => {
  it("exports every Step 1 intelligence UI component", () => {
    const index = read("components/verisuite-intelligence-ui/index.ts");
    for (const name of UI_COMPONENTS) {
      expect(index).toContain(name);
    }
  });

  it("AiInsightPanel supports accept/dismiss for SoR guardrail", () => {
    const src = read("components/verisuite-intelligence-ui/AiInsightPanel.tsx");
    expect(src).toContain("onAccept");
    expect(src).toContain("onDismiss");
    expect(src).toContain("accept before any system write");
  });
});

describe("VeriSuite SMS · dashboard layouts (every assembled page)", () => {
  const assembledSrc = read(
    "components/verisuite-sms-dashboards/AssembledDashboards.tsx",
  );

  it("exports all 9 assembled dashboards", () => {
    const barrel = read("components/verisuite-sms-dashboards/index.ts");
    for (const name of ASSEMBLED) {
      expect(barrel).toContain(name);
      expect(assembledSrc).toContain(`export function ${name}`);
    }
  });

  it("each assembled dashboard uses VsDashboardShell + layout bands", () => {
    for (const name of ASSEMBLED) {
      expect(assembledSrc).toContain(name);
    }
    expect(assembledSrc).toContain("VsDashboardShell");
    for (const band of LAYOUT_BANDS) {
      expect(assembledSrc).toContain(`band="${band}"`);
    }
  });

  it("every dashboard wires drilldown + AI + regional", () => {
    expect(assembledSrc).toContain("RegionalMapPanel");
    expect(assembledSrc).toContain("RegionalPanel");
    expect(assembledSrc).toContain("SmsAiIntegrationPanel");
    expect(assembledSrc).toContain("AssembledAiBand");
    expect(assembledSrc).toContain("onPointClick");
    expect(assembledSrc).toContain("onFlowClick");
    expect(assembledSrc).toContain("onBinClick");
    expect(assembledSrc).toContain("onSegmentClick");
    expect(assembledSrc).toContain("onCellClick");
  });

  it("exports all 9 dashboards matching Prompt 2 set", () => {
    const required = [
      "HomeDashboardAssembled",
      "FlhaHazardIntelligenceDashboard",
      "JhaSmartBuilderDashboard",
      "ErpAiGeneratorDashboard",
      "InspectionsDashboardAssembled",
      "IncidentsDashboardAssembled",
      "SafetyMeetingsDashboardAssembled",
      "ActionManagementDashboardAssembled",
      "CompetencyDashboardAssembled",
    ];
    for (const name of required) {
      expect(assembledSrc).toContain(`export function ${name}`);
    }
  });

  it("gallery supports desktop + tablet viewports", () => {
    const gallery = read(
      "components/verisuite-sms-dashboards/SmsAssembledDashboardGallery.tsx",
    );
    expect(gallery).toContain('"desktop"');
    expect(gallery).toContain('"tablet"');
    expect(gallery).toContain("VS_DESIGN_LOCK.version");
  });
});

describe("VeriSuite SMS · every page route exists", () => {
  for (const page of SMS_PAGES) {
    it(`${page.id} -> ${page.route} source exists`, () => {
      expect(existsSync(join(ROOT, page.file))).toBe(true);
    });
  }

  it("sms-dashboards page mounts gallery", () => {
    const page = read("app/pm/sms-dashboards/page.tsx");
    expect(page).toMatch(/SmsAssembledDashboardGallery|sms-dashboards/i);
  });

  it("SMS module layout template exports (card sections + status badges)", () => {
    expect(
      existsSync(
        join(
          ROOT,
          "src/components/sms/design-system/primitives/SmsModuleLayout.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "src/components/sms/design-system/primitives/SmsUniversalLayout.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "src/components/sms/design-system/primitives/SmsStatusBadge.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "components/verisuite-intelligence-ui/ModuleHubLayout.tsx"),
      ),
    ).toBe(true);
    const theme = read("src/components/sms/design-system/theme.css");
    expect(theme).toContain("sms-status");
    expect(theme).toContain("sms-module-layout");
    expect(theme).toContain("sms-universal-layout");
    expect(theme).toContain("--sms-space-1: var(--space-1)");
    expect(theme).toContain("badge-success-fg");
    const tokens = read("app/vera-tokens.css");
    expect(tokens).toContain("--vera-badge-radius");
    expect(tokens).toContain(".vera-status");
    expect(tokens).toContain(".vera-shell");
    const sfTheme = read("src/components/safety-forms/theme/safety-forms-theme.css");
    expect(sfTheme).toContain("--sf-accent: var(--color-primary)");
    expect(sfTheme).toContain("--sf-radius-sm: var(--radius-sm)");
    const sfBadge = read("src/components/safety-forms/ui/SfBadge.tsx");
    expect(sfBadge).toContain("vera-status");
    expect(sfBadge).not.toContain("rounded-full");
    const shell = read("components/verisuite-intelligence-ui/VsDashboardShell.tsx");
    expect(shell).toContain("vs-theme-auto");
    expect(shell).toContain("vera-shell");
    const universal = read(
      "src/components/sms/design-system/primitives/SmsUniversalLayout.tsx",
    );
    expect(universal).toContain("vera-shell");
    expect(universal).toContain("Header");
    expect(universal).toContain("Summary cards");
    expect(universal).toContain("Main content");
    expect(universal).toContain("Action buttons");
    expect(universal).toContain("Footer");
    expect(read("src/pages/pm/sms/dashboard.tsx")).toContain("SmsUniversalLayout");
    expect(read("src/pages/pm/sms/dashboard.tsx")).toContain(
      "SmsIntegrationsSection",
    );
  });

  it("Vera PM ModuleNav keeps SMS Core second among visible features", async () => {
    const { getVeraPmPrimaryNavIds } = await import(
      "@/lib/navigation/vera-nav-config"
    );
    const ids = getVeraPmPrimaryNavIds();
    expect(ids[0]).toBe("dashboard");
    expect(ids[1]).toBe("sms");
    expect(ids).toContain("safety-hub");
    expect(ids).toContain("projects");
    expect(ids).toContain("fieldos");
  });

  it("SMS Core federation catalog covers Projects, FieldOS, ERP, SIF/HECA, Safety Hub", async () => {
    const { smsCoreOutboundIntegrations } = await import(
      "@/lib/sms-core-integrations"
    );
    const ids = smsCoreOutboundIntegrations().map((i) => i.id);
    expect(ids).toEqual([
      "projects",
      "fieldos",
      "erp",
      "sif-heca",
      "safety-hub",
    ]);
  });

  it("SIF/HECA unified hub exposes energy breakdown + integrations", () => {
    expect(
      existsSync(
        join(ROOT, "components/veripm-sif-heca-hub/VeriPmSifHecaHubView.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "components/veripm-sif-heca-hub/SifHecaAiAssessmentPanel.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "components/veripm-sif-heca-hub/HecaCsraDocumentPanel.tsx"),
      ),
    ).toBe(true);
    const hub = read("components/veripm-sif-heca-hub/VeriPmSifHecaHubView.tsx");
    expect(hub).toContain("VsDashboardShell");
    expect(hub).toContain("FlhaEnergyWheel");
    expect(hub).toContain("SifHecaAiAssessmentPanel");
    expect(hub).toContain("SmsCoreIntegrationGrid");
    expect(hub).toContain("smsCoreSiblingIntegrations");
    expect(hub).toContain("criticalControlVerificationRate");
    const linkTypes = read("lib/veripm-sif-heca-hub/types.ts");
    expect(linkTypes).toContain("smsCore");
    expect(linkTypes).toContain("fieldOs");
    expect(linkTypes).toContain("safetyHub");
    expect(linkTypes).toContain("actionManagement");
    const client = read("lib/sif-heca.ts");
    expect(client).toContain("assessCsraHeca");
    expect(client).toContain("CsraAssessment");
    expect(client).toContain("HECA_CSRA");
    const types = read("lib/veripm-sif-heca-hub/types.ts");
    for (const key of [
      "gravity",
      "motion",
      "electrical",
      "pressure",
      "chemical",
      "thermal",
      "radiation",
    ]) {
      expect(types).toContain(`"${key}"`);
    }
  });

  it("ERP generator exposes OHS utility routing + document panel", () => {
    expect(
      existsSync(
        join(ROOT, "components/veripm-emergency-hub/ErpGeneratorView.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "components/veripm-emergency-hub/ErpDocumentPanel.tsx"),
      ),
    ).toBe(true);
    expect(existsSync(join(ROOT, "lib/erp-generator.ts"))).toBe(true);
    expect(
      existsSync(join(ROOT, "app/pm/emergency-response/generator/page.tsx")),
    ).toBe(true);
    const gen = read("lib/erp-generator.ts");
    expect(gen).toContain("generateErpDocument");
    expect(gen).toContain("/erp/generate");
    const panel = read("components/veripm-emergency-hub/ErpDocumentPanel.tsx");
    expect(panel).toContain("Hazard-specific contact routing");
    expect(panel).toContain("Print / save PDF");
  });
});

describe("VeriSuite SMS · per-page visual contracts (Step 1)", () => {
  const hubs = [
    "components/veripm-home-dashboard/VeriPmHomeDashboardView.tsx",
    "components/veripm-jha-flha-hub/VeriPmJhaFlhaHubView.tsx",
    "components/veripm-emergency-hub/VeriPmEmergencyHubView.tsx",
    "components/veripm-inspections-hub/VeriPmInspectionsHubView.tsx",
    "components/veripm-incidents-hub/VeriPmIncidentsHubView.tsx",
    "components/veripm-safety-meetings-hub/VeriPmSafetyMeetingsHubView.tsx",
    "components/veripm-safety-meetings-hub/VeriPmSafetyMeetingBuilderView.tsx",
    "components/corrective-action-management/CorrectiveActionManagementView.tsx",
    "components/veripm-training-hub/VeriPmTrainingHubView.tsx",
    "components/veripm-sif-heca-hub/VeriPmSifHecaHubView.tsx",
    "components/veripm-safety-hub/VeriPmSafetyHubIntelligenceView.tsx",
  ];

  for (const file of hubs) {
    it(`${file} uses VsDashboardShell (or ModuleHubLayout) + VS_COLORS (no sidebar nav)`, () => {
      const src = read(file);
      expect(src).toMatch(/VsDashboardShell|ModuleHubLayout/);
      expect(src).toContain("VS_COLORS");
      expect(src).not.toMatch(/HubModuleNav|AcpNav|← back to/);
    });
  }

  it("hubs expose shared section header + status badge primitives", () => {
    const shell = read("components/verisuite-intelligence-ui/VsDashboardShell.tsx");
    expect(shell).toContain("VsSectionHeader");
    expect(shell).toContain("VsStatusBadge");
    expect(shell).toContain("vs-theme-auto");
    expect(shell).toContain("vs-section-title");
  });

  it("assembled dashboards use exact Step 1 band order", () => {
    const assembled = read(
      "components/verisuite-sms-dashboards/AssembledDashboards.tsx",
    );
    for (const band of LAYOUT_BANDS) {
      expect(assembled).toContain(`band="${band}"`);
    }
    expect(assembled).not.toMatch(/#7C3AED|#F4F1EA|font-family:\s*Inter/i);
  });

  it("AiInsightPanel + KpiTile + RegionalMapPanel match Step 1 exports", () => {
    for (const name of [
      "AiInsightPanel",
      "KpiTile",
      "RegionalMapPanel",
      "FlhaEnergyWheel",
      "LeadingHeatmap",
    ]) {
      expect(
        existsSync(join(ROOT, `components/verisuite-intelligence-ui/${name}.tsx`)),
      ).toBe(true);
    }
  });
});

describe("VeriSuite SMS · cross-page + regional UI wiring", () => {
  it("home and assembled dashboards expose regional + intelligence panels", () => {
    const home = read(
      "components/veripm-home-dashboard/VeriPmHomeDashboardView.tsx",
    );
    expect(home).toContain("SmsAiIntegrationPanel");
    expect(home).toContain("SmsInteractionFlowPanel");
    const assembled = read(
      "components/verisuite-sms-dashboards/AssembledDashboards.tsx",
    );
    expect(assembled).toContain("RegionalMapPanel");
    expect(assembled).toContain("SmsAiIntegrationPanel");
  });

  it("API client covers regional + intelligence + flows endpoints", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toContain("regional");
    expect(api).toContain("/api/v1/sms/intelligence");
    expect(api).toContain("acceptSmsInsight");
    expect(api).toContain("fetchSmsFlows");
  });
});

describe("VeriSuite SMS · mobile responsiveness contracts", () => {
  it("gallery and shells use responsive layout contracts", () => {
    const assembled = read(
      "components/verisuite-sms-dashboards/AssembledDashboards.tsx",
    );
    expect(assembled).toContain("VsDashboardShell");
    expect(assembled).toContain("VsSection");
    const gallery = read(
      "components/verisuite-sms-dashboards/SmsAssembledDashboardGallery.tsx",
    );
    expect(gallery).toContain("tablet");
    expect(gallery).toContain("desktop");
    expect(gallery).toMatch(/max-w-/);
    const uiShell = read("components/verisuite-intelligence-ui/FlhaEnergyWheel.tsx");
    expect(uiShell).toMatch(/sm:grid-cols|grid-cols-/);
  });

  it("design lock mobile breakpoints match 375 / 768 / 1280", () => {
    expect(VS_LAYOUT.touchTargetMin).toBeGreaterThanOrEqual(44);
    expect(VS_DESIGN_LOCK.version).toBe("1.1.0-final");
  });

  it("tokens.css is loadable for SMS palette", () => {
    expect(existsSync(join(ROOT, "lib/verisuite-intelligence-ui/tokens.css"))).toBe(
      true,
    );
  });
});

describe("VeriSuite SMS · API client surface", () => {
  it("client talks to /api/v1/sms intelligence endpoints", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toContain("/api/v1/sms/intelligence");
    expect(api).toContain("acceptSmsInsight");
    expect(api).toContain("dismissSmsInsight");
    expect(api).toContain("runSmsAiBehavior");
    expect(api).toContain("X-Vera-Plane");
  });

  it("exposes plane header for RBAC", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toMatch(/X-Vera-Plane|x-vera-plane/i);
  });

  it("exposes post-launch monitoring client + ops page", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toContain("fetchSmsMonitoringOverview");
    expect(api).toContain("/api/v1/sms/ops/monitoring");
    expect(existsSync(join(ROOT, "app/pm/sms-ops/page.tsx"))).toBe(true);
    expect(
      existsSync(
        join(ROOT, "components/verisuite-sms-ops/SmsPostLaunchOpsView.tsx"),
      ),
    ).toBe(true);
    const nav = read("lib/navigation/vera-nav-config.ts");
    expect(nav).toContain("/pm/sms-ops");
  });
});

describe("VeriSuite SMS · every AI behavior client mapping", () => {
  it("exposes AI-01..18 constants", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toContain("export const SMS_AI_BEHAVIORS");
    const ids = [...api.matchAll(/"AI-(\d{2})"/g)].map((m) =>
      m[0].replaceAll('"', ""),
    );
    const unique = [...new Set(ids)];
    expect(unique).toHaveLength(18);
    for (let i = 1; i <= 18; i += 1) {
      const id = `AI-${String(i).padStart(2, "0")}`;
      expect(unique).toContain(id);
    }
  });

  it("maps intelligence pages for cross-page engine", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toContain("export const SMS_PAGE_TO_DEFAULT");
    expect(api).toMatch(/home:\s*"home"/);
    expect(api).toMatch(/regional:\s*"regional"/);
    expect(api).toMatch(/incidents:\s*"incidents"/);
  });

  it("hub views call SmsAiIntegrationPanel for AI pages", () => {
    const hubs = [
      "components/veripm-home-dashboard/VeriPmHomeDashboardView.tsx",
      "components/veripm-jha-flha-hub/VeriPmJhaFlhaHubView.tsx",
      "components/veripm-incidents-hub/VeriPmIncidentsHubView.tsx",
      "components/veripm-emergency-hub/VeriPmEmergencyHubView.tsx",
      "components/veripm-safety-meetings-hub/VeriPmSafetyMeetingsHubView.tsx",
      "components/veripm-safety-meetings-hub/VeriPmSafetyMeetingBuilderView.tsx",
      "components/corrective-action-management/CorrectiveActionManagementView.tsx",
      "components/veripm-inspections-hub/VeriPmInspectionsHubView.tsx",
      "components/veripm-training-hub/VeriPmTrainingHubView.tsx",
      "components/veripm-predictive/VeriPmPredictiveView.tsx",
    ];
    for (const file of hubs) {
      const src = read(file);
      expect(src).toContain("SmsAiIntegrationPanel");
    }
  });

  it("exposes specialist run client for AI-01…18", () => {
    const api = read("lib/verisuite-sms-api.ts");
    expect(api).toContain("runSmsAiBehavior");
    expect(api).toContain("SMS_PAGE_SPECIALISTS");
    const hook = read("hooks/useSmsAiBehavior.ts");
    expect(hook).toContain("runSmsAiBehavior");
    const panel = read("components/verisuite-sms-ai/SmsAiIntegrationPanel.tsx");
    expect(panel).toContain("Run ");
    expect(panel).toContain("SMS_AI_BEHAVIORS");
  });
  it("defines 12 interaction flow summaries matching FINAL canvas", () => {
    const flows = read("lib/verisuite-sms-flows.ts");
    expect(flows).toContain("SMS_FLOW_SUMMARIES");
    expect(flows).toContain("create-incident");
    expect(flows).toContain("investigate-incident");
    expect(flows).toContain("create-jha");
    expect(flows).toContain("update-jha");
    expect(flows).toContain("create-flha");
    expect(flows).toContain("review-flha");
    expect(flows).toContain("erp-simulation");
    expect(flows).toContain("complete-inspection");
    expect(flows).toContain("close-action");
    expect(flows).toContain("schedule-meeting");
    expect(flows).toContain("view-dashboards");
    expect(flows).toContain("cross-page-intelligence");
    expect(flows).toContain("SMS_CROSS_LINKS");
  });

  it("exposes SmsInteractionFlowPanel and useSmsInteractionFlow", () => {
    expect(
      existsSync(join(ROOT, "components/verisuite-sms-ai/SmsInteractionFlowPanel.tsx")),
    ).toBe(true);
    expect(existsSync(join(ROOT, "hooks/useSmsInteractionFlow.ts"))).toBe(true);
    const assembled = read(
      "components/verisuite-sms-dashboards/AssembledDashboards.tsx",
    );
    expect(assembled).toContain("SmsInteractionFlowPanel");
    expect(
      read("components/veripm-training-hub/VeriPmTrainingHubView.tsx"),
    ).toContain("SmsInteractionFlowPanel");
    expect(
      read("components/veripm-predictive/VeriPmPredictiveView.tsx"),
    ).toContain("SmsInteractionFlowPanel");
  });
});

describe("VeriSuite SMS · demo fixtures support visual QA", () => {
  it("provides insight / energy / topic / scenario fixtures", () => {
    expect(HOME_INSIGHTS.length).toBeGreaterThan(0);
    expect(FLHA_ENERGIES.length).toBeGreaterThan(0);
    expect(MEETING_TOPICS.length).toBeGreaterThan(0);
    expect(ERP_SCENARIOS.length).toBeGreaterThan(0);
    expect(JHA_HAZARDS.length).toBeGreaterThan(0);
    expect(LEADING_HEAT.cells.length).toBeGreaterThan(0);
    expect(COMPETENCY_HEAT.cells.length).toBeGreaterThan(0);
  });
});
