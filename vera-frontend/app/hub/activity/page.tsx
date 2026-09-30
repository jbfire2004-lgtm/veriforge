import Link from "next/link";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { HubPageHeader } from "@/components/hub/HubPageHeader";
import { buttonStyles } from "@/components/ui";

export default function HubActivityPage() {
  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <HubPageHeader
        title="Activity"
        description="Likes, comments, shares, and follows from you and people you follow."
        badge="Social feed"
      />
      <div className="flex justify-end">
        <Link href="/hub/network" className={buttonStyles({ variant: "outline", size: "sm" })}>
          Your network
        </Link>
      </div>
      <ActivityFeed scope="following" />
    </div>
  );
}
