import {
  articleJsonLd,
  jobPostingJsonLd,
  profileJsonLd,
} from './seo-schema.generator';

describe('seo-schema.generator', () => {
  const base = 'https://vera.example';

  it('articleJsonLd', () => {
    const ld = articleJsonLd(
      {
        slug: 'test',
        title: 'Test',
        publishedAt: '2026-01-01T00:00:00Z',
        readMinutes: 5,
      },
      base,
    );
    expect(ld['@type']).toBe('Article');
    expect(ld.url).toContain('/safety/test');
  });

  it('jobPostingJsonLd', () => {
    const ld = jobPostingJsonLd(
      {
        slug: 'electrician',
        title: 'Electrician',
        companyName: 'Co',
        publishedAt: '2026-01-01T00:00:00Z',
        payMin: 40,
      },
      base,
    );
    expect(ld['@type']).toBe('JobPosting');
  });

  it('profileJsonLd', () => {
    const ld = profileJsonLd(
      {
        path: '/experts/profile/1',
        displayName: 'Jane',
        profileType: 'expert',
      },
      base,
    );
    expect(ld['@type']).toBe('ProfilePage');
  });
});
