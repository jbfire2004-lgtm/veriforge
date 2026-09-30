export type * from "./types";
export {
  ARCHIVE_KIND_LABELS,
  ARCHIVE_STATUS_OPTIONS,
  kindFromDocumentType,
  kindFromCorePurpose,
  formToArchiveItem,
  fileToArchiveItem,
  filterArchiveItems,
  sortArchiveByDateDesc,
  collectArchiveProjects,
  collectArchiveTypeKeys,
} from "./types";

import type { DocumentArchiveItem } from "./types";

export type DocumentArchiveResponse = {
  items: DocumentArchiveItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sources: { forms: number; files: number };
  projects: Array<{ id: string; label: string }>;
  typeKeys: Array<{ key: string; label: string }>;
  generatedAt: string;
};

// NOTE: The server-only loader `loadDocumentArchive` lives in `./server`.
// It is intentionally NOT re-exported here so this barrel stays client-safe —
// re-exporting it would pull `server-only` code (next/headers, auth) into
// client bundles and break the build. Import it from `@/lib/document-archive/server`.
