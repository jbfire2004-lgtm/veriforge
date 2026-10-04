import { SafetyBlogSearchService } from './safety-blog-search.service';

describe('SafetyBlogSearchService', () => {
  const search = new SafetyBlogSearchService();

  beforeEach(() => {
    search.rebuild([
      {
        id: '1',
        slug: 'fall-protection',
        title: 'Fall protection anchors',
        excerpt: 'CSA anchor requirements',
        authorName: 'Expert',
        authorType: 'EXPERT',
        imageUrl: null,
        category: 'Fall protection',
        safetyLevel: 'HIGH',
        readMinutes: 5,
        featured: false,
        publishedAt: new Date().toISOString(),
        tagSlugs: ['anchors'],
      },
      {
        id: '2',
        slug: 'heat-stress',
        title: 'Heat stress guide',
        excerpt: 'Hydration on site',
        authorName: null,
        authorType: 'COMPANY',
        imageUrl: null,
        category: 'Environmental',
        safetyLevel: 'MEDIUM',
        readMinutes: 3,
        featured: false,
        publishedAt: new Date().toISOString(),
      },
    ]);
  });

  it('returns matches for query terms', () => {
    const results = search.search('fall anchor');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe('fall-protection');
  });

  it('returns empty for no match', () => {
    expect(search.search('xyznone')).toEqual([]);
  });
});
