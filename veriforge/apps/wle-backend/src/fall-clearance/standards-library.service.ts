import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';

export type StandardBasisRef = {
  ref: string;
  description: string;
};

export type CsaZ25916Clause = {
  ref: string;
  title: string;
  description: string;
};

export type CsaZ25916Document = {
  id: string;
  body: string;
  code: string;
  title: string;
  edition?: string;
  region: string;
  summary: string;
  disclaimer: string;
  clauses: CsaZ25916Clause[];
  clearanceFactors: {
    name: string;
    description: string;
    typicalNote: string;
  }[];
  veraMapping: string;
};

const FALLBACK_DOC: CsaZ25916Document = {
  id: 'csa-z259-16',
  body: 'CSA',
  code: 'Z259.16-15',
  title: 'Design of active fall-protection systems',
  edition: '2015',
  region: 'CA',
  summary:
    'Design guidance for active fall-protection systems. Non-authoritative teaching summary.',
  disclaimer:
    'Not legal advice. Confirm against the current CSA Z259.16 standard and site procedures.',
  clauses: [
    {
      ref: 'CSA Z259.16-15, Clause 6.3',
      title: 'Free-fall distance',
      description: 'Free-fall distance limits for active systems.',
    },
  ],
  clearanceFactors: [],
  veraMapping:
    'requiredClearanceM = freeFallM + decelerationM + harnessStretchM + lifelinePayoutM + anchorDeflectionM + safetyMarginM',
};

function loadCsaZ25916(): CsaZ25916Document {
  try {
    const path = join(__dirname, 'data', 'csa-z259-16.json');
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw) as CsaZ25916Document;
  } catch {
    // Nest dist layout or missing file — use embedded fallback
    try {
      const path = join(process.cwd(), 'src', 'fall-clearance', 'data', 'csa-z259-16.json');
      const raw = readFileSync(path, 'utf8');
      return JSON.parse(raw) as CsaZ25916Document;
    } catch {
      return FALLBACK_DOC;
    }
  }
}

@Injectable()
export class StandardsLibraryService {
  private readonly csaDoc: CsaZ25916Document = loadCsaZ25916();

  /** Structured CSA Z259.16 data from static library file (DB-ready later). */
  async getCSA_Z259_16(): Promise<CsaZ25916Document> {
    if (!this.csaDoc?.id) {
      throw new NotFoundException('CSA Z259.16 library entry not found');
    }
    return { ...this.csaDoc, clauses: [...this.csaDoc.clauses] };
  }

  /**
   * Standard / manufacturer references attached to each calculation result.
   */
  getBasisForCalculation(): StandardBasisRef[] {
    return [
      {
        ref: 'CSA Z259.16-15, Clause 6.3',
        description: 'Free-fall distance limits',
      },
      {
        ref: 'Manufacturer Manual, Section 4.2',
        description: 'Deceleration device performance',
      },
      {
        ref: 'CSA Z259.16-15 (clearance design)',
        description:
          'Clearance shall include freefall, deceleration, harness stretch, lifeline payout, anchor deflection, and safety margin',
      },
    ];
  }
}
