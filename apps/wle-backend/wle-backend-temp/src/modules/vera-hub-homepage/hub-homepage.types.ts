import type {
  CompanyAnnouncementDto,
  FeedItemDto,
  HomepagePayload,
  HubHomepageRole,
  HubSection,
  JobPostDto,
  ProjectUpdateDto,
  QuickActionDto,
  SafetyArticleDto,
  TrendingTopicDto,
  WeatherSnapshotDto,
  WorkerAchievementDto,
} from '@vera/api-contract';

export type {
  CompanyAnnouncementDto,
  FeedItemDto,
  HomepagePayload,
  HubHomepageRole,
  HubSection,
  JobPostDto,
  ProjectUpdateDto,
  QuickActionDto,
  SafetyArticleDto,
  TrendingTopicDto,
  WeatherSnapshotDto,
  WorkerAchievementDto,
};

export type HubUserContext = {
  userId: number;
  role: string;
  hubRole: HubHomepageRole;
  companyId?: number;
  unionHallId?: number;
  workerId?: number;
};

export type FeedPageResult = {
  items: FeedItemDto[];
  nextCursor: string | null;
};

export type HomepageQuery = {
  cursor?: string;
  limit?: number;
  region?: string;
  refresh?: boolean;
};
