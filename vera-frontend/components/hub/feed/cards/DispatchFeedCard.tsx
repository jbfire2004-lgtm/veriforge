import type { FeedItemWithEngagement } from "@vera/api-contract";
import { FeedCardBase } from "./FeedCardBase";

export function DispatchFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-purple" badge="Union dispatch" />;
}

export function AnnouncementFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-navy" badge="Announcement" />;
}

export function AchievementFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-gold" badge="Achievement" />;
}

export function ExpertFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-indigo" badge="Expert answer" />;
}

export function ProjectFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-slate" badge="Project update" />;
}

export function DefaultFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} />;
}
