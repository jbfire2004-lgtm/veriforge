import type { FeedItemWithEngagement } from "@vera/api-contract";
import { FeedCardBase } from "./FeedCardBase";

export function JobFeedCard(props: {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
}) {
  return (
    <FeedCardBase
      {...props}
      accent="text-vera-blue"
      badge={props.item.trade ? `Job · ${props.item.trade}` : "Job posting"}
    />
  );
}
