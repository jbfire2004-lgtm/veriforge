/**
 * Field-level merge for structured offline forms (Phase 1.75 §3).
 */
export type MergeConflict = {
  field: string;
  clientValue: unknown;
  serverValue: unknown;
};

export function mergeFormFields(
  client: Record<string, unknown>,
  server: Record<string, unknown>,
  serverUpdatedAt?: string,
  clientTimestamp?: string,
): { merged: Record<string, unknown>; conflicts: MergeConflict[] } {
  const merged: Record<string, unknown> = { ...server };
  const conflicts: MergeConflict[] = [];
  const serverWins =
    serverUpdatedAt &&
    clientTimestamp &&
    new Date(serverUpdatedAt).getTime() > new Date(clientTimestamp).getTime();

  for (const [key, clientVal] of Object.entries(client)) {
    if (key.startsWith("_")) continue;
    const serverVal = server[key];
    if (serverVal === undefined) {
      merged[key] = clientVal;
      continue;
    }
    if (JSON.stringify(serverVal) === JSON.stringify(clientVal)) continue;

    if (serverWins) {
      conflicts.push({ field: key, clientValue: clientVal, serverValue: serverVal });
    } else {
      merged[key] = clientVal;
    }
  }

  return { merged, conflicts };
}
