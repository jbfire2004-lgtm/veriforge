"use client";

import type { FeedItemWithEngagement } from "@vera/api-contract";
import {
  AchievementFeedCard,
  AnnouncementFeedCard,
  DefaultFeedCard,
  DispatchFeedCard,
  ExpertFeedCard,
  ProjectFeedCard,
} from "./cards/DispatchFeedCard";
import { JobFeedCard } from "./cards/JobFeedCard";
import { EquipmentFeedCard, SafetyBlogFeedCard } from "./cards/SafetyFeedCard";
import { TrainingExpiryFeedCard, TrainingFeedCard } from "./cards/TrainingFeedCard";

type Props = {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
};

export function FeedCard({ item, onComment, onShare }: Props) {
  const handlers = { item, onComment, onShare };
  switch (item.source) {
    case "VERA_CORE_TRAINING":
      return <TrainingFeedCard {...handlers} />;
    case "TRAINING_EXPIRY":
      return <TrainingExpiryFeedCard {...handlers} />;
    case "VERA_CORE_EQUIPMENT":
      return <EquipmentFeedCard {...handlers} />;
    case "SAFETY_BLOG":
      return <SafetyBlogFeedCard {...handlers} />;
    case "JOB_BOARD":
      return <JobFeedCard {...handlers} />;
    case "UNION_DISPATCH":
      return <DispatchFeedCard {...handlers} />;
    case "COMPANY_ANNOUNCEMENT":
      return <AnnouncementFeedCard {...handlers} />;
    case "WORKER_ACHIEVEMENT":
      return <AchievementFeedCard {...handlers} />;
    case "WORKER_VERIFICATION":
      return <TrainingFeedCard {...handlers} />;
    case "EXPERT_ANSWER":
      return <ExpertFeedCard {...handlers} />;
    case "VERA_CORE_PROJECT":
      return <ProjectFeedCard {...handlers} />;
    default:
      return <DefaultFeedCard {...handlers} />;
  }
}
