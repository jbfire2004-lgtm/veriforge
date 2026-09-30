import "server-only";



import type { Session } from "next-auth";

import { apiFetchJson } from "@/lib/api-client";

import { apiLoadErrorMessage } from "@/lib/network-error-message";

import {

  fetchInspectionTemplates,

  type InspectionTemplateCatalog,

} from "@/lib/inspections-catalog";

import {

  getPmTemplateKind,

  type PmInspectionTemplate,

} from "@/lib/pm-inspections";



const REQUIRED_TEMPLATE_KINDS = ["smart_site", "focus_audit", "checklist"] as const;



/** Seed when empty OR when any default kind (focus audit / checklist / smart site) is absent. */

function isMissingTemplateKinds(rows: PmInspectionTemplate[]): boolean {

  if (rows.length === 0) return true;

  const present = new Set(rows.map((t) => getPmTemplateKind(t)));

  return REQUIRED_TEMPLATE_KINDS.some((kind) => !present.has(kind));

}



export type PmInspectionLibraryLoadResult = {

  templates: PmInspectionTemplate[];

  counts?: InspectionTemplateCatalog["counts"];

  error?: string;

};



/** List templates on the server via Vera Core catalog; auto-seeds when kinds are missing. */

export async function loadPmInspectionLibraryServer(

  session: Session | null,

  companyId: number,

  projectId: number,

): Promise<PmInspectionLibraryLoadResult> {

  // No sticky error — client catalog hooks load once VeraAuth has a bearer token.
  // Returning an error here left Smart Site stuck on “Sign in…” even for signed-in users
  // whose JWT briefly lacked accessToken (e.g. after API downtime / refresh failure).
  if (!session?.accessToken) {
    return { templates: [] };
  }



  try {

    let catalog = await fetchInspectionTemplates(companyId, projectId, { session });



    if (isMissingTemplateKinds(catalog.templates)) {

      catalog = await fetchInspectionTemplates(companyId, projectId, { session });

    }



    return {

      templates: catalog.templates,

      counts: catalog.counts,

    };

  } catch (e) {

    return {

      templates: [],

      error: apiLoadErrorMessage(e, "Could not load templates"),

    };

  }

}


