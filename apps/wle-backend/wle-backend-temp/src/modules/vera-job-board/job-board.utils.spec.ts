import { formatPayRange, slugifyJob } from './job-board.utils';

describe('job-board.utils', () => {
  it('slugifyJob produces url-safe slug', () => {
    const slug = slugifyJob('Journeyman Electrician');
    expect(slug).toMatch(/^journeyman-electrician-/);
  });

  it('formatPayRange builds hourly range', () => {
    expect(formatPayRange(42, 48, 'hourly', null)).toBe('$42–$48/hr');
    expect(formatPayRange(null, null, null, '$50/hr')).toBe('$50/hr');
  });
});
