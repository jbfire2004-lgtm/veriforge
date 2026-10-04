import { Injectable } from '@nestjs/common';
import type { SafetyBlogPostSummary } from '@vera/api-contract';

type IndexedPost = SafetyBlogPostSummary & { searchText: string };

@Injectable()
export class SafetyBlogSearchService {
  private index: IndexedPost[] = [];

  rebuild(posts: SafetyBlogPostSummary[]): void {
    this.index = posts.map((p) => ({
      ...p,
      searchText: [
        p.title,
        p.excerpt ?? '',
        p.authorName ?? '',
        p.category,
        ...(p.tagSlugs ?? []),
      ]
        .join(' ')
        .toLowerCase(),
    }));
  }

  search(query: string, limit = 20): SafetyBlogPostSummary[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    const scored = this.index
      .map((post) => {
        let score = 0;
        for (const term of terms) {
          if (post.title.toLowerCase().includes(term)) score += 4;
          if (post.searchText.includes(term)) score += 1;
        }
        return { post, score };
      })
      .filter((r) => r.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.post.publishedAt.localeCompare(a.post.publishedAt),
      );
    return scored.slice(0, limit).map((r) => {
      const { searchText: _s, ...rest } = r.post;
      return rest;
    });
  }
}
