export type HubCompanyPageDto = {
  id: string;
  companyId: number;
  companyName: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  about?: string | null;
  industry?: string | null;
  specialties: string[];
  websiteUrl?: string | null;
  isProviderChannel: boolean;
  followerCount: number;
  published: boolean;
  location?: { city?: string | null; region?: string | null };
  following: boolean;
  canManage: boolean;
  memberCount: number;
  openJobCount: number;
};

export type UpdateHubCompanyPageDto = {
  bannerUrl?: string;
  logoUrl?: string;
  tagline?: string;
  about?: string;
  industry?: string;
  specialties?: string[];
  websiteUrl?: string;
  published?: boolean;
};

export type HubCompanyMemberDto = {
  userId: number;
  displayName: string;
  title?: string | null;
  role: string;
  photoUrl?: string | null;
  primaryTrade?: string | null;
};

export type HubCompanyPostDto = {
  id: string;
  title?: string | null;
  body: string;
  publishedAt: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
};

export type HubProviderChannelDto = {
  providerId: number;
  displayName: string;
  bio?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  websiteUrl?: string | null;
  followerCount: number;
  following: boolean;
  courseCount: number;
  canManage: boolean;
};

export type HubProviderCourseDto = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  durationHours?: number | null;
};

export type HubFollowTargetType = 'COMPANY' | 'PROVIDER';

export type HubSuggestionsDto = {
  people: Array<{
    userId: number;
    displayName: string;
    headline?: string | null;
    reason: string;
  }>;
  companies: Array<{
    companyId: number;
    name: string;
    tagline?: string | null;
    logoUrl?: string | null;
    industry?: string | null;
  }>;
  providers: Array<{
    providerId: number;
    name: string;
    bio?: string | null;
    logoUrl?: string | null;
  }>;
};
