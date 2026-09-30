import type { Page, Route } from "@playwright/test";

const API_GLOB = "**/api/v1/**";
const WORKERS_GLOB = "**/workers/**";

export const MOCK_WORKER_ID = 12;
export const MOCK_EQUIPMENT_ID = 1;
export const MOCK_PROJECT_ID = 1;
export const MOCK_INSPECTION_ID = "insp-e2e-001";
export const MOCK_COMPANY_ID = 1;

let inspectionLifecycle: "in_progress" | "submitted" = "in_progress";

export function resetInspectionMockState() {
  inspectionLifecycle = "in_progress";
}

export function setInspectionMockStatus(status: "in_progress" | "submitted") {
  inspectionLifecycle = status;
}

function currentInspectionMock() {
  return inspectionLifecycle === "submitted"
    ? mockInspectionSubmitted()
    : mockInspectionDraft();
}

export type MockProfile = "assessment" | "ske" | "inspection" | "full" | "deep-crawl";

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export function mockTrainingAssessmentLatest() {
  return {
    runId: "run-tae-e2e",
    evaluatedAt: new Date().toISOString(),
    overallScore: 88,
    overallStatus: "PASS",
    result: { bands: ["compliant"], gaps: [] },
  };
}

export function mockSafetyKnowledgeResult() {
  return {
    workerId: String(MOCK_WORKER_ID),
    overallScore: 82,
    overallStatus: "Proficient",
    domains: [
      {
        domain: "CompanyTraining",
        score: 85,
        status: "Proficient",
        gaps: [],
      },
      {
        domain: "FieldSafetyPractice",
        score: 78,
        status: "Developing",
        gaps: ["Increase FLHA participation"],
      },
    ],
    recommendations: ["Refresh fall protection module"],
  };
}

export type MockInspection = ReturnType<typeof buildInspectionDraft>;

function buildInspectionDraft() {
  return {
    id: MOCK_INSPECTION_ID,
    companyId: MOCK_COMPANY_ID,
    projectId: 1,
    title: "E2E Walk-around",
    status: "in_progress",
    passed: null,
    scorePercent: null,
    riskScore: null,
    requiresSupervisorReview: false,
    answers: { item1: true },
    template: {
      id: "tpl-e2e",
      name: "Site walk",
      category: "general",
      status: "published",
      scoringMode: "weighted",
      requiredSignatures: [{ role: "supervisor", label: "Supervisor" }],
      items: [
        {
          id: "item1",
          label: "Housekeeping acceptable",
          type: "pass_fail",
          required: true,
          weight: 1,
        },
        {
          id: "item2",
          label: "Pass follow-up",
          type: "text",
          required: false,
          showIf: { itemId: "item1", equals: true },
        },
        {
          id: "item3",
          label: "Fail corrective note",
          type: "text",
          required: false,
          showIf: { itemId: "item1", equals: false },
        },
        {
          id: "item4",
          label: "Nested detail",
          type: "text",
          required: false,
          showIf: { itemId: "item2", equals: "needs review" },
        },
      ],
    },
    deficiencies: [],
    signatures: [
      {
        id: "sig-1",
        role: "supervisor",
        signerName: "E2E Supervisor",
        signedAt: new Date().toISOString(),
      },
    ],
  };
}

export function mockInspectionDraft(
  overrides?: Partial<MockInspection>,
): MockInspection {
  return { ...buildInspectionDraft(), ...overrides };
}

export function mockInspectionSubmitted() {
  return mockInspectionDraft({
    status: "submitted",
    passed: true,
    scorePercent: 100,
  });
}

export function mockHubWidgetsSummary() {
  return {
    generatedAt: new Date().toISOString(),
    visibility: {
      workerReadiness: true,
      equipmentReadiness: true,
      trainingExpiring: true,
      safetyAlerts: true,
      projectActivity: true,
    },
    workerReadiness: {
      totalWorkers: 10,
      compliant: 8,
      nonCompliant: 2,
      expiringSoon: 1,
      complianceRate: 80,
      topIssues: [{ label: "Missing training", count: 2 }],
      href: "/admin/workers",
    },
    equipmentReadiness: {
      total: 5,
      compliant: 4,
      nonCompliant: 1,
      overdueInspection: 0,
      complianceRate: 80,
      href: "/admin/equipment",
    },
    trainingExpiring: {
      expired: 1,
      expiring30: 2,
      expiring60: 0,
      expiring90: 0,
      highRisk: 0,
      gaps: 1,
      href: "/admin/training",
    },
    safetyAlerts: {
      openCount: 0,
      highSeverityCount: 0,
      items: [],
      href: "/pm/incidents",
    },
    projectActivity: {
      items: [],
      href: "/pm",
    },
  };
}

export function mockPhotoCaptureResult() {
  return {
    attachment: { id: "att-e2e", analysisStatus: "completed" },
    findings: [
      {
        id: "find-e2e",
        category: "housekeeping",
        title: "Debris in walkway",
        severity: "medium",
        responsibleParty: "subcontractor",
      },
    ],
    correctiveActions: [
      {
        id: "capa-e2e",
        title: "Clear walkway",
        status: "open",
        dueAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ],
    dispatches: [{ dispatch: { id: "disp-e2e", status: "pending" } }],
    visionSummary: { bullets: ["Walkway obstruction detected"] },
    llmSummary: "OCR/vision stub: debris noted near gate.",
    analysisEngine: "e2e-stub",
  };
}

function mockSafetyMeeting() {
  return {
    id: "meet-e2e-1",
    title: "Toolbox — findings",
    meetingType: "toolbox",
    status: "draft",
    requiresSupervisorReview: false,
    reviewStatus: "none",
    topics: [],
  };
}

async function handleRoute(route: Route, profile: MockProfile) {
  const url = route.request().url();
  const method = route.request().method();

  if (url.includes("/access/check") && method === "POST") {
    return json(route, { allowed: true });
  }

  if (url.includes("/worker-wallet/download") && method === "GET") {
    return json(route, {
      title: "Worker wallet",
      description: "E2E stub",
      webWalletUrl: `/verify/${MOCK_WORKER_ID}`,
      pwaUrl: "/hub",
      iosUrl: null,
      androidUrl: null,
      qrFormat: "url",
    });
  }
  if (url.includes("/worker-wallet/me") && method === "GET") {
    return json(route, {
      workerId: MOCK_WORKER_ID,
      download: {
        title: "Worker wallet",
        description: "E2E stub",
        webWalletUrl: `/verify/${MOCK_WORKER_ID}`,
        pwaUrl: "/hub",
        iosUrl: null,
        androidUrl: null,
        qrFormat: "url",
      },
      qr: {
        content: `https://vera.test/verify/${MOCK_WORKER_ID}`,
        walletUrl: `/verify/${MOCK_WORKER_ID}`,
      },
    });
  }

  if (url.includes("/api/auth/session")) {
    return json(route, {
      user: { name: "E2E User", email: "e2e@vera.test", role: "ADMIN" },
      accessToken: "e2e-mock-token",
      expires: "2099-01-01T00:00:00.000Z",
    });
  }

  if (profile === "assessment" || profile === "full" || profile === "ske") {
    if (
      url.includes(`/assessment-engines/training/worker/${MOCK_WORKER_ID}`) &&
      method === "GET"
    ) {
      return json(route, mockTrainingAssessmentLatest());
    }
    if (
      url.includes(`/assessment-engines/training/worker/${MOCK_WORKER_ID}`) &&
      method === "POST"
    ) {
      return json(route, {
        runId: "run-tae-new",
        result: mockTrainingAssessmentLatest().result,
      });
    }
    if (url.includes("/assessment-engines/training/worker/") && url.endsWith("/export.pdf")) {
      return route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4 e2e stub"),
      });
    }
  }

  if (profile === "ske" || profile === "full") {
    if (url.includes(`/safety-knowledge/worker/${MOCK_WORKER_ID}/latest`)) {
      const result = mockSafetyKnowledgeResult();
      return json(route, {
        id: "ske-run-1",
        overallScore: result.overallScore,
        overallStatus: result.overallStatus,
        resultJson: result,
        evaluatedAt: new Date().toISOString(),
      });
    }
    if (url.includes(`/safety-knowledge/worker/${MOCK_WORKER_ID}/evaluate`)) {
      return json(route, {
        runId: "ske-run-new",
        result: mockSafetyKnowledgeResult(),
      });
    }
    if (url.includes("/safety-knowledge/worker/") && url.endsWith("/export.pdf")) {
      return route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4 ske e2e"),
      });
    }
    if (url.includes("/core/workers/search")) {
      return json(route, [
        {
          id: MOCK_WORKER_ID,
          firstName: "E2E",
          lastName: "Worker",
          company: { name: "E2E Construction" },
        },
      ]);
    }
  }

  if (profile === "inspection" || profile === "full") {
    if (
      method === "GET" &&
      url.includes(`/pm/inspections/${MOCK_INSPECTION_ID}`) &&
      !url.includes("/photo") &&
      !url.includes("/subcontractors") &&
      !url.includes("/templates")
    ) {
      return json(route, currentInspectionMock());
    }
    if (url.includes("/pm/inspections/") && url.endsWith("/answers") && method === "PUT") {
      const body = route.request().postDataJSON() as { answers?: Record<string, unknown> };
      const base = mockInspectionDraft();
      return json(route, { ...base, answers: body.answers ?? base.answers });
    }
    if (url.includes("/pm/inspections/") && url.endsWith("/submit") && method === "POST") {
      inspectionLifecycle = "submitted";
      return json(route, currentInspectionMock());
    }
    if (url.includes("/photo-findings") && method === "GET") {
      return json(route, [
        {
          id: "find-e2e",
          title: "Debris in walkway",
          description: "Housekeeping issue near scaffold",
          severity: "medium",
          category: "housekeeping",
          createdAt: new Date().toISOString(),
          checklistItemId: "item2",
          hecaInvolved: false,
          highEnergyFlag: false,
          energyTypes: [],
          attachment: {
            id: "att-e2e",
            fileName: "walkway.jpg",
            dataUrl:
              "data:image/svg+xml," +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect fill="#94a3b8" width="100%" height="100%"/></svg>',
              ),
            analysisJson: {
              vision: { ocr: { fullText: "CAUTION TRIP HAZARD" } },
            },
          },
          correctiveAction: {
            id: "capa-e2e",
            title: "Clear walkway",
            status: "open",
          },
        },
      ]);
    }
    if (url.includes("/photos/capture") && method === "POST") {
      return json(route, mockPhotoCaptureResult());
    }
    if (url.includes("/escalate-to-incident") && method === "POST") {
      return json(route, {
        inspectionId: MOCK_INSPECTION_ID,
        eventId: "inc-e2e-1",
        existing: false,
        event: { id: "inc-e2e-1" },
      });
    }
    if (url.includes("/draft-safety-meeting") && method === "POST") {
      return json(route, mockSafetyMeeting());
    }
    if (url.includes("/pm/safety-meetings/meet-e2e-1") && method === "GET") {
      return json(route, mockSafetyMeeting());
    }
    if (url.includes("/pm/inspections/subcontractors")) {
      return json(route, [{ id: 1, name: "Prime Co" }]);
    }
  }

  if (
    (url.includes(`/workers/${MOCK_WORKER_ID}`) ||
      url.match(new RegExp(`/workers/${MOCK_WORKER_ID}($|\\?)`))) &&
    method === "GET"
  ) {
    return json(route, {
      id: MOCK_WORKER_ID,
      firstName: "E2E",
      lastName: "Worker",
      status: "ACTIVE",
      company: { id: MOCK_COMPANY_ID, name: "E2E Company" },
      training: [],
      equipment: [],
    });
  }

  if (url.includes("/hub/widgets/summary") && method === "GET") {
    return json(route, mockHubWidgetsSummary());
  }

  if (profile === "deep-crawl" || profile === "full") {
    if (url.includes("/pm/sms/meta") && method === "GET") {
      return json(route, {
        pillars: ["SCL", "HECA", "Energy"],
        sclStates: ["safe", "conditional", "loss"],
        energyCatalog: [],
      });
    }
    if (url.includes("/pm/sms/analytics/leading-indicators") && method === "GET") {
      return json(route, {
        sclDistribution: { safe: 4, conditional: 1, loss: 0 },
        hecaHighEnergyConditionalLoss: 0,
        energyControlGaps: {},
        weeklyForecasts: [],
      });
    }
    if (url.includes("/pm/sms/risk-context") && method === "GET") {
      return json(route, []);
    }
    if (url.includes("/pm/sms/heca-library") && method === "GET") {
      return json(route, [
        {
          id: "heca-1",
          code: "HECA_CRANE_LIFT",
          title: "Critical crane lift",
          hecaType: "critical_task",
          energyTypesJson: ["gravity", "mechanical"],
        },
      ]);
    }
    if (url.includes("/pm/sms/heca-library/seed") && method === "POST") {
      return json(route, [
        {
          id: "heca-1",
          code: "HECA_CRANE_LIFT",
          title: "Critical crane lift",
          hecaType: "critical_task",
        },
      ]);
    }
    if (url.includes("/pm/sms/notifications/routes") && method === "GET") {
      return json(route, [
        {
          id: "route-1",
          eventKey: "capa.overdue",
          templateKey: "sms_capa_overdue",
          channelsJson: ["in_app", "email"],
          rolesJson: ["SUPERVISOR"],
        },
      ]);
    }
    if (url.includes("/pm/sms/notifications/routes/seed") && method === "POST") {
      return json(route, [
        {
          id: "route-1",
          eventKey: "capa.overdue",
          templateKey: "sms_capa_overdue",
          channelsJson: ["in_app", "email"],
          rolesJson: ["SUPERVISOR"],
        },
      ]);
    }
    if (url.includes("/pm/contractor-portal/dashboard") && method === "GET") {
      return json(route, {
        inbox: { total: 0, overdue: 0, pendingAck: 0 },
        findings: { total: 0, unacknowledged: 0, critical: 0 },
        compliance: {
          workersTotal: 0,
          trainingExpired: 0,
          trainingExpiringSoon: 0,
          credentialsExpired: 0,
          credentialsExpiringSoon: 0,
          equipmentNonCompliant: 0,
          equipmentTotal: 0,
        },
      });
    }
    if (url.includes("/pm/contractor-portal/memberships") && method === "GET") {
      return json(route, []);
    }
    if (url.includes("/pm/contractor-portal/inbox") && method === "GET") {
      return json(route, {
        summary: { total: 0, overdue: 0, pendingAck: 0 },
        items: [],
      });
    }
    if (url.includes("/pm/contractor-portal/findings") && method === "GET") {
      return json(route, {
        summary: { total: 0, unacknowledged: 0, critical: 0 },
        items: [],
      });
    }
    if (url.includes("/pm/contractor-portal/compliance") && method === "GET") {
      return json(route, {
        summary: {
          workersTotal: 0,
          trainingExpired: 0,
          trainingExpiringSoon: 0,
          credentialsExpired: 0,
          credentialsExpiringSoon: 0,
          equipmentNonCompliant: 0,
          equipmentTotal: 0,
        },
        workers: [],
        training: { expired: [], expiringSoon: [], current: [] },
        certifications: { expired: [], expiringSoon: [] },
        equipment: { nonCompliant: [], compliant: [] },
      });
    }
    if (url.includes("/pm/contractor-portal/messages") && method === "GET") {
      return json(route, { messages: [] });
    }
    if (url.includes("/pm/contractor-portal/notifications") && method === "GET") {
      return json(route, []);
    }
    if (
      method === "GET" &&
      /\/pm\/inspections(\?|$)/.test(url) &&
      !url.includes("/pm/inspections/")
    ) {
      return json(route, []);
    }
    if (url.includes("/pm/inspections/templates") && method === "GET") {
      return json(route, []);
    }
    if (
      method === "GET" &&
      url.includes("/pm/inspections/") &&
      !url.includes("/templates") &&
      !url.includes("/photo") &&
      !url.includes("/subcontractors")
    ) {
      const idMatch = url.match(/\/pm\/inspections\/([^/?]+)/);
      const id = idMatch?.[1] ?? MOCK_INSPECTION_ID;
      return json(route, { ...mockInspectionDraft(), id });
    }
    if (url.includes("/core/readiness") && method === "GET") {
      return json(route, {
        generatedAt: new Date().toISOString(),
        companyId: MOCK_COMPANY_ID,
        workers: {
          totalWorkers: 1,
          compliant: 1,
          nonCompliant: 0,
          expiringSoon: 0,
          complianceRate: 100,
          topIssues: [],
          score: 100,
        },
        equipment: {
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          overdueInspection: 0,
          complianceRate: 100,
          score: 100,
        },
        training: null,
        projects: null,
      });
    }
  }

  return route.continue();
}

/** Lightweight API stubs for authenticated deep-route crawls in CI. */
export async function installDeepCrawlMocks(page: Page) {
  await installApiMocks(page, "deep-crawl");
}

/** Intercept browser API calls so UI workflows run without a live backend. */
export async function installApiMocks(page: Page, profile: MockProfile = "full") {
  if (profile === "inspection" || profile === "full") {
    resetInspectionMockState();
  }
  await page.route(API_GLOB, (route) => handleRoute(route, profile));
  await page.route(WORKERS_GLOB, (route) => handleRoute(route, profile));
  await page.route("**/api/auth/**", (route) => handleRoute(route, profile));
  // Registered last so Playwright matches it first — avoids hung requests to a slow API.
  await page.route("**/api/v1/access/check", async (route) => {
    if (route.request().method() === "POST") {
      return json(route, { allowed: true });
    }
    return route.continue();
  });
}
