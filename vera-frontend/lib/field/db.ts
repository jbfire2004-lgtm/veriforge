import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { FIELD_DB_NAME, FIELD_DB_VERSION } from "./types";

export type FieldDb = IDBPDatabase<FieldCacheSchema>;

export interface FieldCacheSchema extends DBSchema {
  meta: {
    key: string;
    value: string;
  };
  cache: {
    key: string;
    value: {
      type: string;
      version: number;
      updatedAt: string;
      expiresAt?: string;
      payload: string;
    };
  };
  blobs: {
    key: string;
    value: {
      mime: string;
      updatedAt: string;
      payload: ArrayBuffer;
    };
  };
  sync_queue: {
    key: string;
    value: import("./types").SyncQueueItem;
  };
  conflicts: {
    key: string;
    value: import("./types").ConflictRecord;
  };
  qr_registry: {
    key: string;
    value: import("./types").QrRegistryEntry;
  };
  form_drafts: {
    key: string;
    value: import("./types").FormDraftRecord;
  };
}

let dbPromise: Promise<FieldDb> | null = null;

export function getFieldDb(): Promise<FieldDb> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in the browser"));
  }
  if (!dbPromise) {
    dbPromise = openDB<FieldCacheSchema>(FIELD_DB_NAME, FIELD_DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("meta");
          db.createObjectStore("cache");
          db.createObjectStore("blobs");
          db.createObjectStore("sync_queue");
          db.createObjectStore("conflicts");
          db.createObjectStore("qr_registry");
        }
        if (oldVersion < 2) {
          // v2: conflicts store
        }
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains("form_drafts")) {
            db.createObjectStore("form_drafts");
          }
        }
        if (oldVersion < 4) {
          // v4: extended delta entity types (tasks, work packages, form definitions)
        }
      },
    });
  }
  return dbPromise;
}

export async function clearFieldDb(): Promise<void> {
  const db = await getFieldDb();
  const names = [
    "meta",
    "cache",
    "blobs",
    "sync_queue",
    "conflicts",
    "qr_registry",
    "form_drafts",
  ] as const;
  const tx = db.transaction(names, "readwrite");
  await Promise.all(names.map((n) => tx.objectStore(n).clear()));
  await tx.done;
}
