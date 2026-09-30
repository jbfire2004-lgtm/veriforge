"use client";

import Link from "next/link";
import type {
  ProviderStorefrontPost,
  ProviderStorefrontProfile,
} from "@vera/api-contract";
import { FollowButton } from "./feed/FollowButton";
import { FeedPostCard } from "./feed/FeedPostCard";
import { Card, CardContent } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

type Props = {
  profile: ProviderStorefrontProfile;
  posts: ProviderStorefrontPost[];
};

export function ProviderStorefrontPage({ profile, posts }: Props) {
  const p = profile.provider;

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950">
      <div
        className="h-40 bg-gradient-to-r from-vera-teal/30 to-vera-deep/20"
        style={
          profile.bannerUrl
            ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover" }
            : undefined
        }
      />
      <div className="mx-auto max-w-3xl px-vera-4 pb-20">
        <div className="-mt-12 flex flex-col gap-vera-4 sm:flex-row sm:items-end">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-background bg-white shadow-lg dark:border-zinc-950">
            {profile.logoUrl || p.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logoUrl ?? p.logoUrl ?? ""}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-vera-teal">
                {profile.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-vera-2 pb-vera-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.postCount} posts · Training provider
            </p>
            <div className="flex flex-wrap gap-vera-2">
              <FollowButton
                targetType="PROVIDER"
                targetId={String(profile.trainingProviderId)}
              />
              {profile.websiteUrl ? (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Website
                </a>
              ) : null}
              <Link
                href="/home"
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Back to feed
              </Link>
            </div>
          </div>
        </div>

        {profile.bio ? (
          <Card className="mt-vera-6">
            <CardContent className="pt-vera-6 text-sm text-muted-foreground">
              {profile.bio}
            </CardContent>
          </Card>
        ) : null}

        <section className="mt-vera-8 space-y-vera-5">
          <h2 className="text-lg font-semibold">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={{
                  kind: "post",
                  id: post.id,
                  postType: post.postType,
                  title: post.title,
                  body: post.body,
                  publishedAt: post.publishedAt,
                  author: post.author,
                  media: [],
                  engagement: {
                    ...post.engagement,
                    likedByMe: false,
                    savedByMe: false,
                  },
                }}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
