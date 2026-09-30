import { describe, expect, it } from '@jest/globals';
import { inspectionFailedForAutoMeeting } from './pm-inspections.constants';

describe('inspection failure meeting eligibility', () => {
  it('treats passed=false as failure (below threshold or failed items)', () => {
    expect(inspectionFailedForAutoMeeting(false)).toBe(true);
  });

  it('does not create meetings for passing inspections', () => {
    expect(inspectionFailedForAutoMeeting(true)).toBe(false);
    expect(inspectionFailedForAutoMeeting(null)).toBe(false);
    expect(inspectionFailedForAutoMeeting(undefined)).toBe(false);
  });
});
