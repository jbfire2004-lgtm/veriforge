import { detectDangerousOccurrences, utilityContactsFor } from './erp-ohs-utility.catalog';

describe('ERP OHS / utility catalog', () => {
  it('routes SaskEnergy for Saskatchewan gas line strikes', () => {
    const codes = detectDangerousOccurrences(
      'Excavator hit gas line — SaskEnergy odor reported',
    );
    expect(codes).toContain('gas_line_strike');
    const contacts = utilityContactsFor('CA-SK', codes);
    expect(contacts.some((c) => c.id === 'util-sk-saskenergy')).toBe(true);
    expect(contacts.find((c) => c.id === 'util-sk-saskenergy')?.phone).toBe(
      '1-888-700-0421',
    );
  });

  it('returns ATCO Gas for Alberta gas strikes', () => {
    const codes = detectDangerousOccurrences('natural gas line strike on site');
    const contacts = utilityContactsFor('CA-AB', codes);
    expect(contacts.some((c) => c.id === 'util-ab-atco-gas')).toBe(true);
  });

  it('suppresses fire extinguisher false positive', () => {
    const codes = detectDangerousOccurrences(
      'Check fire extinguisher and complete fire drill attendance',
    );
    expect(codes).toEqual(['none']);
  });
});
