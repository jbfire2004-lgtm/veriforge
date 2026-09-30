/** WHMIS-style storage class incompatibility matrix (simplified production rules). */
const INCOMPATIBLE: Record<string, string[]> = {
  oxidizer: ['flammable', 'combustible', 'organic'],
  flammable: ['oxidizer', 'corrosive_acid', 'corrosive_base'],
  corrosive_acid: ['corrosive_base', 'flammable', 'cyanide'],
  corrosive_base: ['corrosive_acid', 'flammable'],
  organic: ['oxidizer'],
  cyanide: ['corrosive_acid', 'oxidizer'],
};

export type ChemicalStorageIssue = {
  itemId: string;
  otherItemId: string;
  reason: string;
  severity: 'high' | 'medium';
};

export class ChemicalCompatibilityEngine {
  evaluateSiteInventory(
    items: Array<{
      id: string;
      storageClass?: string | null;
      incompatibleWith?: unknown;
      locationNote?: string | null;
    }>,
  ): ChemicalStorageIssue[] {
    const issues: ChemicalStorageIssue[] = [];
    const byLocation = new Map<string, typeof items>();

    for (const item of items) {
      const loc = (item.locationNote ?? 'default').toLowerCase().trim();
      const bucket = byLocation.get(loc) ?? [];
      bucket.push(item);
      byLocation.set(loc, bucket);
    }

    for (const [, group] of byLocation) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i];
          const b = group[j];
          const conflict = this.pairConflict(a, b);
          if (conflict) {
            issues.push({
              itemId: a.id,
              otherItemId: b.id,
              reason: conflict,
              severity: 'high',
            });
          }
        }
      }
    }
    return issues;
  }

  private pairConflict(
    a: { id: string; storageClass?: string | null; incompatibleWith?: unknown },
    b: { id: string; storageClass?: string | null; incompatibleWith?: unknown },
  ): string | null {
    const aClass = (a.storageClass ?? '').toLowerCase();
    const bClass = (b.storageClass ?? '').toLowerCase();
    if (!aClass || !bClass) return null;

    const aExtra = Array.isArray(a.incompatibleWith)
      ? (a.incompatibleWith as string[]).map((x) => x.toLowerCase())
      : [];
    const bExtra = Array.isArray(b.incompatibleWith)
      ? (b.incompatibleWith as string[]).map((x) => x.toLowerCase())
      : [];

    if (aExtra.includes(bClass) || bExtra.includes(aClass)) {
      return `Declared incompatible storage: ${aClass} with ${bClass}`;
    }

    const aBad = INCOMPATIBLE[aClass] ?? [];
    if (aBad.includes(bClass)) {
      return `Incompatible storage classes ${aClass} and ${bClass} in same location`;
    }
    const bBad = INCOMPATIBLE[bClass] ?? [];
    if (bBad.includes(aClass)) {
      return `Incompatible storage classes ${bClass} and ${aClass} in same location`;
    }
    return null;
  }
}
