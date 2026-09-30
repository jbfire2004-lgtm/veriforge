/**
 * In-memory Document Service store for local/preview demos.
 * Replace with Postgres-backed service using docs/sql/001_document_service.sql.
 */

import {
  DOCUMENT_TYPE_DOMAIN,
  HUB_DOCUMENT_STATUSES,
  type DocumentDomain,
  type DocumentStatus,
  type DocumentSummary,
  type DocumentType,
} from "./constants";
import type { CompletedDocumentsQuery } from "./api";

export type StoredDocument = DocumentSummary & {
  created_by?: string;
  crew_ids: string[];
  signer_user_ids?: string[];
};

const g = globalThis as unknown as {
  __veriforgeDocStore?: StoredDocument[];
};

function uid(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

function seed(): StoredDocument[] {
  const now = Date.now();
  const days = (d: number) => new Date(now - d * 86400000).toISOString();

  const rows: Array<Omit<StoredDocument, "domain" | "template_id" | "template_version" | "version" | "created_at" | "updated_at" | "crew_ids"> & Partial<StoredDocument>> = [
    {
      document_id: uid("doc", 1),
      document_type: "FLHA",
      status: "Completed",
      title: "FLHA — Line 4 Morning",
      worker_id: "42",
      worker_name: "A. Nguyen",
      crew_ids: ["crew-b"],
      crew_summary: "Crew B · 4 workers",
      job_id: "job-104",
      job_name: "Turnaround Unit 2",
      project_id: "1",
      project_name: "Q3 Turnaround",
      location_id: "loc-north",
      location_label: "North Yard · Bay 3",
      completed_at: days(1),
      created_by: "user-42",
      signer_user_ids: ["user-42", "user-sup"],
    },
    {
      document_id: uid("doc", 2),
      document_type: "JHA",
      status: "Completed",
      title: "JHA — Hot work bay 3",
      worker_id: "42",
      worker_name: "A. Nguyen",
      crew_ids: ["crew-b"],
      job_id: "job-104",
      job_name: "Turnaround Unit 2",
      project_id: "1",
      location_label: "North Yard · Bay 3",
      completed_at: days(3),
      created_by: "user-sup",
      signer_user_ids: ["user-42"],
    },
    {
      document_id: uid("doc", 3),
      document_type: "Incident",
      status: "RequiresReview",
      title: "Near miss — scaffold plank",
      worker_id: "42",
      worker_name: "A. Nguyen",
      job_id: "job-104",
      project_id: "1",
      location_label: "North Yard",
      completed_at: days(5),
      created_by: "user-42",
    },
    {
      document_id: uid("doc", 4),
      document_type: "TrainingRecord",
      status: "Completed",
      title: "Confined space refresher",
      worker_id: "42",
      worker_name: "A. Nguyen",
      completed_at: days(12),
      created_by: "user-hr",
      signer_user_ids: ["user-42"],
    },
    {
      document_id: uid("doc", 5),
      document_type: "WorkOrder",
      status: "Completed",
      title: "WO — Seal replacement",
      worker_id: "42",
      worker_name: "A. Nguyen",
      asset_id: "1",
      asset_tag: "PUMP-104",
      asset_name: "Centrifugal Pump",
      job_id: "job-104",
      project_id: "1",
      location_label: "Central Plant",
      completed_at: days(2),
      created_by: "user-42",
    },
    {
      document_id: uid("doc", 6),
      document_type: "AssetInspection",
      status: "Completed",
      title: "Quarterly inspection",
      worker_id: "7",
      worker_name: "M. Cole",
      asset_id: "1",
      asset_tag: "PUMP-104",
      asset_name: "Centrifugal Pump",
      project_id: "1",
      location_label: "Central Plant",
      completed_at: days(2),
      created_by: "user-7",
    },
    {
      document_id: uid("doc", 7),
      document_type: "FailureReport",
      status: "Completed",
      title: "Failure — Seal leak",
      worker_id: "7",
      worker_name: "M. Cole",
      asset_id: "1",
      asset_tag: "PUMP-104",
      asset_name: "Centrifugal Pump",
      completed_at: days(10),
      created_by: "user-7",
    },
    {
      document_id: uid("doc", 8),
      document_type: "PMTask",
      status: "Completed",
      title: "PM — Lubrication",
      worker_id: "7",
      worker_name: "M. Cole",
      asset_id: "1",
      asset_tag: "PUMP-104",
      completed_at: days(20),
      created_by: "user-7",
    },
    {
      document_id: uid("doc", 9),
      document_type: "VendorServiceReport",
      status: "Archived",
      title: "OEM service visit",
      asset_id: "1",
      asset_tag: "PUMP-104",
      completed_at: days(45),
      created_by: "user-vendor",
    },
    {
      document_id: uid("doc", 10),
      document_type: "FLHA",
      status: "Completed",
      title: "FLHA — Night shift east",
      worker_id: "7",
      worker_name: "M. Cole",
      job_id: "job-220",
      job_name: "East Line Outage",
      project_id: "2",
      project_name: "East Line",
      location_label: "East Gate",
      completed_at: days(4),
      created_by: "user-7",
    },
    {
      document_id: uid("doc", 11),
      document_type: "AssetInspection",
      status: "InProgress",
      title: "Monthly checks (draft path)",
      worker_id: "42",
      asset_id: "1",
      asset_tag: "PUMP-104",
      completed_at: null,
      created_by: "user-42",
    },
    {
      document_id: uid("doc", 12),
      document_type: "CorrectiveAction",
      status: "Completed",
      title: "CAPA — Guard rail gap",
      worker_id: "42",
      worker_name: "A. Nguyen",
      job_id: "job-104",
      project_id: "1",
      completed_at: days(8),
      created_by: "user-sup",
    },
  ];

  return rows.map((r) => {
    const document_type = r.document_type as DocumentType;
    const created = r.completed_at ?? days(30);
    return {
      ...r,
      document_id: r.document_id!,
      document_type,
      domain: DOCUMENT_TYPE_DOMAIN[document_type],
      status: r.status as DocumentStatus,
      title: r.title ?? null,
      version: 1,
      template_id: `tmpl-${document_type.toLowerCase()}`,
      template_version: 1,
      crew_ids: r.crew_ids ?? [],
      created_at: created,
      updated_at: r.completed_at ?? created,
    } satisfies StoredDocument;
  });
}

function getStore(): StoredDocument[] {
  if (!g.__veriforgeDocStore) {
    g.__veriforgeDocStore = seed();
  }
  return g.__veriforgeDocStore;
}

function asList(value: string | string[] | undefined): string[] | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value : value.split(",").map((s) => s.trim()).filter(Boolean);
}

export function queryCompletedDocuments(
  query: CompletedDocumentsQuery = {},
): {
  items: DocumentSummary[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  applied_scope: "admin";
} {
  const statuses =
    asList(query.status as string | string[] | undefined) ??
    [...HUB_DOCUMENT_STATUSES];
  const types = asList(query.document_type as string | string[] | undefined);

  let rows = getStore().filter((d) => {
    if (!statuses.includes(d.status)) return false;
    if (!d.completed_at && HUB_DOCUMENT_STATUSES.includes(d.status as (typeof HUB_DOCUMENT_STATUSES)[number])) {
      // hub statuses normally have completed_at; allow RequiresReview without strict check
    }
    if (query.domain && d.domain !== query.domain) return false;
    if (types && types.length && !types.includes(d.document_type)) return false;
    if (query.worker_id) {
      const wid = query.worker_id;
      const involved =
        d.worker_id === wid ||
        d.created_by === `user-${wid}` ||
        (d.crew_ids ?? []).includes(wid) ||
        (d.signer_user_ids ?? []).includes(`user-${wid}`);
      if (!involved) return false;
    }
    if (query.crew_id && !(d.crew_ids ?? []).includes(query.crew_id)) return false;
    if (query.job_id && d.job_id !== query.job_id) return false;
    if (query.project_id && d.project_id !== query.project_id) return false;
    if (query.asset_id && d.asset_id !== query.asset_id) return false;
    if (query.location_id && d.location_id !== query.location_id) return false;
    if (query.completed_from && (d.completed_at ?? "") < query.completed_from) return false;
    if (query.completed_to) {
      const end = query.completed_to.length <= 10
        ? `${query.completed_to}T23:59:59.999Z`
        : query.completed_to;
      if ((d.completed_at ?? "") > end) return false;
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      const hay = `${d.title ?? ""} ${d.external_reference ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    // Default hub: only completed-ish with completed_at when status is hub set
    if (
      statuses.every((s) =>
        (HUB_DOCUMENT_STATUSES as readonly string[]).includes(s),
      ) &&
      !d.completed_at
    ) {
      return false;
    }
    return true;
  });

  const sort = query.sort ?? "completed_at_desc";
  rows = [...rows].sort((a, b) => {
    switch (sort) {
      case "completed_at_asc":
        return (a.completed_at ?? "").localeCompare(b.completed_at ?? "");
      case "updated_at_desc":
        return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
      case "document_type_asc":
        return a.document_type.localeCompare(b.document_type);
      case "status_asc":
        return a.status.localeCompare(b.status);
      case "completed_at_desc":
      default:
        return (b.completed_at ?? "").localeCompare(a.completed_at ?? "");
    }
  });

  const page = Math.max(1, query.page ?? 1);
  const page_size = Math.min(100, Math.max(1, query.page_size ?? 25));
  const total = rows.length;
  const total_pages = Math.max(1, Math.ceil(total / page_size));
  const start = (page - 1) * page_size;
  const items = rows.slice(start, start + page_size).map(toSummary);

  return { items, page, page_size, total, total_pages, applied_scope: "admin" };
}

function toSummary(d: StoredDocument): DocumentSummary {
  const {
    signer_user_ids: _s,
    created_by: _c,
    ...rest
  } = d;
  return rest;
}

export function queryWorkerDocuments(workerId: string) {
  const all = getStore().filter((d) => {
    return (
      d.worker_id === workerId ||
      d.created_by === `user-${workerId}` ||
      (d.crew_ids ?? []).includes(workerId) ||
      (d.signer_user_ids ?? []).includes(`user-${workerId}`)
    );
  });

  const byType = new Map<DocumentType, StoredDocument[]>();
  for (const d of all) {
    const list = byType.get(d.document_type) ?? [];
    list.push(d);
    byType.set(d.document_type, list);
  }

  const preferred: DocumentType[] = [
    "FLHA",
    "JHA",
    "Incident",
    "TrainingRecord",
    "WorkOrder",
  ];
  const order = [
    ...preferred.filter((t) => byType.has(t)),
    ...[...byType.keys()].filter((t) => !preferred.includes(t)).sort(),
  ];

  return {
    worker_id: workerId,
    total: all.length,
    groups: order.map((document_type) => {
      const items = (byType.get(document_type) ?? [])
        .slice()
        .sort((a, b) =>
          (b.completed_at ?? b.updated_at).localeCompare(
            a.completed_at ?? a.updated_at,
          ),
        )
        .map(toSummary);
      return {
        document_type,
        domain: DOCUMENT_TYPE_DOMAIN[document_type],
        label: document_type,
        count: items.length,
        items,
      };
    }),
  };
}

export function queryJobOrProjectDocuments(opts: {
  job_id?: string;
  project_id?: string;
}) {
  const rows = getStore().filter((d) => {
    if (opts.job_id && d.job_id === opts.job_id) return true;
    if (opts.project_id && d.project_id === opts.project_id) return true;
    return false;
  });

  const section = (domain: DocumentDomain) => {
    const items = rows
      .filter((d) => d.domain === domain)
      .sort((a, b) =>
        (b.completed_at ?? b.updated_at).localeCompare(
          a.completed_at ?? a.updated_at,
        ),
      )
      .map(toSummary);
    return {
      id: domain === "VERICORE" ? "safety" : "maintenance",
      domain,
      label: domain === "VERICORE" ? "Safety" : "Maintenance",
      count: items.length,
      items,
    };
  };

  return {
    context: opts.job_id
      ? { type: "job" as const, job_id: opts.job_id }
      : { type: "project" as const, project_id: opts.project_id! },
    total: rows.length,
    sections: [section("VERICORE"), section("VERIPM")],
  };
}

export function queryAssetTimeline(assetId: string) {
  const rows = getStore()
    .filter((d) => d.asset_id === assetId)
    .sort((a, b) =>
      (b.completed_at ?? b.created_at).localeCompare(
        a.completed_at ?? a.created_at,
      ),
    );

  return {
    asset_id: assetId,
    asset_tag: rows[0]?.asset_tag ?? null,
    total: rows.length,
    timeline: rows.map((d) => ({
      event_at: d.completed_at ?? d.created_at,
      document_id: d.document_id,
      document_type: d.document_type,
      domain: d.domain,
      status: d.status,
      title: d.title,
      headline: `${d.document_type}${d.title ? ` · ${d.title}` : ""}`,
      worker_name: d.worker_name ?? null,
    })),
  };
}
