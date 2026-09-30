import type { FeedItemWithEngagement } from "@vera/api-contract";
import { FeedCardBase } from "./FeedCardBase";

export function SafetyBlogFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-safety" badge="Safety blog" />;
}

export function EquipmentFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return <FeedCardBase {...props} accent="text-vera-danger" badge="Equipment alert" />;
}
