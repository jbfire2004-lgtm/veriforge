/** Starter cross-jurisdiction equivalencies (extend via admin/seed later). */
export const REGULATORY_EQUIVALENCY_SEED: Array<{
  fromJurisdiction: string;
  toJurisdiction: string;
  standardCode: string;
  notes?: string;
}> = [
  {
    fromJurisdiction: 'AB',
    toJurisdiction: 'SK',
    standardCode: 'CSA-Z1001',
    notes: 'WHMIS-aligned programs often accepted with employer review',
  },
  {
    fromJurisdiction: 'AB',
    toJurisdiction: 'BC',
    standardCode: 'CSA-Z1001',
  },
  {
    fromJurisdiction: 'ON',
    toJurisdiction: 'QC',
    standardCode: 'CSA-Z1001',
  },
  {
    fromJurisdiction: 'CA-FED',
    toJurisdiction: 'AB',
    standardCode: 'OHS-FED-GEN',
  },
  {
    fromJurisdiction: 'CA-FED',
    toJurisdiction: 'ON',
    standardCode: 'OHS-FED-GEN',
  },
];
