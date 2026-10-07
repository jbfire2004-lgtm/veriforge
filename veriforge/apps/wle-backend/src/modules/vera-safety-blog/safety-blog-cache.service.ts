import { Injectable } from '@nestjs/common';
import type {
  SafetyBlogPostDetail,
  SafetyBlogPostList,
  SafetyBlogPostSummary,
} from '@vera/api-contract';

type Entry<T> = { value: T; expiresAt: number };

const TTL_MS = 120_000;

@Injectable()
export class SafetyBlogCacheService {
  private readonly posts = new Map<string, Entry<SafetyBlogPostDetail>>();
  private readonly lists = new Map<string, Entry<SafetyBlogPostList>>();
  private readonly trending = new Map<string, Entry<SafetyBlogPostSummary[]>>();

  getPost(slug: string): SafetyBlogPostDetail | null {
    return this.get(this.posts, slug);
  }

  setPost(slug: string, value: SafetyBlogPostDetail): void {
    this.set(this.posts, slug, value);
  }

  getList(key: string): SafetyBlogPostList | null {
    return this.get(this.lists, key);
  }

  setList(key: string, value: SafetyBlogPostList): void {
    this.set(this.lists, key, value);
  }

  getTrending(key: string): SafetyBlogPostSummary[] | null {
    return this.get(this.trending, key);
  }

  setTrending(key: string, value: SafetyBlogPostSummary[]): void {
    this.set(this.trending, key, value);
  }

  invalidateAll(): void {
    this.posts.clear();
    this.lists.clear();
    this.trending.clear();
  }

  private get<T>(map: Map<string, Entry<T>>, key: string): T | null {
    const entry = map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      map.delete(key);
      return null;
    }
    return entry.value;
  }

  private set<T>(map: Map<string, Entry<T>>, key: string, value: T): void {
    map.set(key, { value, expiresAt: Date.now() + TTL_MS });
  }
}
