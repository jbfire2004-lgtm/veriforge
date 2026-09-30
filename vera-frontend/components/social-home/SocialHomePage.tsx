"use client";

import type { SocialFeedPage } from "@vera/api-contract";
import { SocialHomeLayout } from "./layout/SocialHomeLayout";
import { LeftNav } from "./layout/LeftNav";
import { FeedContainer } from "./feed/FeedContainer";
import { SuggestedProvidersWidget } from "./sidebar/SuggestedProvidersWidget";
import { SponsoredAdsWidget } from "./sidebar/SponsoredAdsWidget";
import { SystemAnnouncementsWidget } from "./sidebar/SystemAnnouncementsWidget";
import { UpcomingEventsWidget } from "./sidebar/UpcomingEventsWidget";

type Props = {
  initialFeed: SocialFeedPage;
};

export function SocialHomePage({ initialFeed }: Props) {
  return (
    <SocialHomeLayout
      leftNav={<LeftNav />}
      sidebar={
        <>
          <SuggestedProvidersWidget />
          <SponsoredAdsWidget />
          <SystemAnnouncementsWidget />
          <UpcomingEventsWidget />
        </>
      }
    >
      <FeedContainer initial={initialFeed} />
    </SocialHomeLayout>
  );
}
