import type { ProductModuleCode } from "../../types/modules";

export interface ModuleCatalogEntry {
  code: ProductModuleCode;
  name: string;
  required: boolean;
  monthlyCents: number;
}

export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  { code: "core", name: "Core", required: true, monthlyCents: 0 },
  { code: "pm", name: "Project Management", required: false, monthlyCents: 39900 },
  { code: "safety", name: "Safety", required: false, monthlyCents: 24900 },
  { code: "compliance", name: "Compliance", required: false, monthlyCents: 19900 },
  { code: "wallet", name: "Wallet", required: false, monthlyCents: 9900 },
  { code: "training", name: "Training", required: false, monthlyCents: 14900 },
  { code: "audits", name: "Audits", required: false, monthlyCents: 17900 },
  { code: "investigations", name: "Investigations", required: false, monthlyCents: 17900 },
  { code: "scorecards", name: "Scorecards", required: false, monthlyCents: 12900 },
  {
    code: "hiring_client_tools",
    name: "Hiring Client Tools",
    required: false,
    monthlyCents: 9900,
  },
];

export const DEFAULT_ENABLED_MODULES: ProductModuleCode[] = ["core"];
