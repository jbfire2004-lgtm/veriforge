import { getFieldDb } from "./db";
import type { FormDraftRecord, SafetyFormKind } from "./types";

export async function saveFormDraft(draft: FormDraftRecord): Promise<void> {
  const db = await getFieldDb();
  await db.put("form_drafts", draft, draft.id);
}

export async function getFormDraft(id: string): Promise<FormDraftRecord | undefined> {
  const db = await getFieldDb();
  return db.get("form_drafts", id);
}

export async function listFormDrafts(kind?: SafetyFormKind): Promise<FormDraftRecord[]> {
  const db = await getFieldDb();
  const all = await db.getAll("form_drafts");
  return kind ? all.filter((d) => d.kind === kind) : all;
}

export async function deleteFormDraft(id: string): Promise<void> {
  const db = await getFieldDb();
  await db.delete("form_drafts", id);
}
