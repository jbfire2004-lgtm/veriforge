import type { FeedItemWithEngagement } from "@vera/api-contract";
import { FeedCardBase } from "./FeedCardBase";

type Props = {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
};

export function TrainingFeedCard(props: Props) {
  return <FeedCardBase {...props} accent="text-vera-teal" />;
}

export function TrainingExpiryFeedCard(props: Props) {
  return <FeedCardBase {...props} accent="text-vera-warning" badge="Expiring soon" />;
}
