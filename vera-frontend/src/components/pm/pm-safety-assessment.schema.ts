import { z } from "zod";
import {
  PM_CONTROL_OPTIONS,
  PM_ENERGY_WHEEL_CATEGORIES,
  PM_HAZARD_OPTIONS,
  PM_HECA_EXPOSURE_ROUTES,
  type PmAssessmentFormKind,
} from "./pm-safety-assessment.constants";

const hazardIdSet = new Set(PM_HAZARD_OPTIONS.map((h) => h.id));
const controlIdSet = new Set(PM_CONTROL_OPTIONS.map((c) => c.id));
const energyIdSet = new Set(PM_ENERGY_WHEEL_CATEGORIES.map((e) => e.id));
const hecaRouteSet = new Set(PM_HECA_EXPOSURE_ROUTES.map((r) => r.id));

function idsOnly(allowed: Set<string>, vals: string[]): boolean {
  return vals.every((v) => allowed.has(v));
}

const stepRowSchema = z.object({
  task: z.string().min(1, "Task step is required"),
  hazard: z.string().min(1, "Hazard is required"),
  control: z.string().min(1, "Control is required"),
});

const inspectionRowSchema = z.object({
  item: z.string().min(1, "Item is required"),
  status: z.enum(["PASS", "FAIL", "NA"]),
  notes: z.string().max(2000).optional(),
});

function optionalPositiveIntFromString(val: string): number | undefined {
  const t = val.trim();
  if (t === "") return undefined;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return n;
}

const formKindSchema = z.enum([
  "JHA",
  "FLHA",
  "SIF",
  "HECA",
  "ENERGY_WHEEL",
  "INSPECTION",
]);

export const pmSafetyAssessmentSchema = z
  .object({
    kind: formKindSchema,
    title: z.string().min(1, "Title is required").max(300),
    jobLocation: z.string().max(500).optional(),
    companyId: z.string().transform((s) => optionalPositiveIntFromString(s)),
    siteId: z.string().transform((s) => optionalPositiveIntFromString(s)),

    selectedHazards: z
      .array(z.string())
      .min(1, "Select at least one hazard")
      .refine((a) => idsOnly(hazardIdSet, a), "Invalid hazard selection"),
    selectedControls: z
      .array(z.string())
      .min(1, "Select at least one control")
      .refine((a) => idsOnly(controlIdSet, a), "Invalid control selection"),

    workNarrative: z.string().max(20000).optional(),

    // FLHA — field context (optional extra vs JHA)
    fieldContext: z.string().max(10000).optional(),

    // SIF
    scenarioSummary: z.string().max(20000).optional(),
    severityRationale: z.string().max(20000).optional(),

    // HECA
    hecaExposureRoutes: z
      .array(z.string())
      .optional()
      .refine(
        (a) => !a?.length || idsOnly(hecaRouteSet, a),
        "Invalid exposure route"
      ),
    hecaExposureNotes: z.string().max(20000).optional(),

    // Energy Wheel
    energyCategories: z
      .array(z.string())
      .optional()
      .refine(
        (a) => !a?.length || idsOnly(energyIdSet, a),
        "Invalid energy category"
      ),
    energyIsolationPlan: z.string().max(20000).optional(),

    // JHA / FLHA — dynamic rows
    steps: z.array(stepRowSchema).optional(),

    // Inspection checklist
    inspectionItems: z.array(inspectionRowSchema).optional(),

    // Signature
    signerPrintedName: z.string().min(2, "Printed name is required").max(200),
    signerAcknowledgement: z.boolean().refine((v) => v === true, {
      message: "You must acknowledge the assessment",
    }),
    /** Optional ink signature; stored in payload (data URL can be large). */
    signatureDrawingDataUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const k = data.kind as PmAssessmentFormKind;

    if (k === "JHA" || k === "FLHA") {
      const steps = data.steps ?? [];
      if (steps.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least one task / hazard / control row",
          path: ["steps"],
        });
      }
    }

    if (k === "SIF") {
      if (!data.scenarioSummary?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Describe the significant incident / risk scenario",
          path: ["scenarioSummary"],
        });
      }
      if (!data.severityRationale?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Explain severity / SIF potential",
          path: ["severityRationale"],
        });
      }
    }

    if (k === "HECA") {
      const routes = data.hecaExposureRoutes ?? [];
      if (routes.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one exposure route",
          path: ["hecaExposureRoutes"],
        });
      }
    }

    if (k === "ENERGY_WHEEL") {
      const cats = data.energyCategories ?? [];
      if (cats.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one energy category",
          path: ["energyCategories"],
        });
      }
      if (!data.energyIsolationPlan?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Describe verification / isolation plan",
          path: ["energyIsolationPlan"],
        });
      }
    }

    if (k === "INSPECTION") {
      const items = data.inspectionItems ?? [];
      if (items.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least one inspection line",
          path: ["inspectionItems"],
        });
      }
    }
  });

export type PmSafetyAssessmentInput = z.input<typeof pmSafetyAssessmentSchema>;
export type PmSafetyAssessmentValues = z.output<typeof pmSafetyAssessmentSchema>;

export function defaultAssessmentSteps(
  kind: PmAssessmentFormKind
): Array<{ task: string; hazard: string; control: string }> {
  if (kind === "JHA" || kind === "FLHA") {
    return [
      { task: "", hazard: "", control: "" },
      { task: "", hazard: "", control: "" },
    ];
  }
  return [];
}

export function defaultInspectionItems(): Array<{
  item: string;
  status: "PASS" | "FAIL" | "NA";
  notes?: string;
}> {
  return [
    { item: "Guarding / machine isolation", status: "PASS", notes: "" },
    { item: "Housekeeping / walkways", status: "PASS", notes: "" },
  ];
}
