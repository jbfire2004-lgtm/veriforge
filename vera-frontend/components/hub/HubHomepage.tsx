"use client";

import type { HomepagePayload } from "@vera/api-contract";
import Link from "next/link";

import { hubRoleLabel, shouldShowSection } from "@/lib/hub/hub-roles";
import { buttonStyles } from "@/components/ui";
import { QuickActionsBar } from "./sections/QuickActionsBar";

import { PersonalizedFeedSection } from "./sections/PersonalizedFeedSection";
import { SuggestionRail } from "@/components/hub/social/SuggestionRail";

import { TrendingTopicsSection } from "./sections/TrendingTopicsSection";

import { HubToolkitSection } from "./HubToolkitSection";

import { WeatherAlertsSection } from "./sections/WeatherAlertsSection";

import { HubSection } from "./sections/HubSection";

import { JobPostCard } from "./cards/JobPostCard";

import { SafetyArticleCard } from "./cards/SafetyArticleCard";

import { ProjectUpdateCard } from "./cards/ProjectUpdateCard";

import { TrainingCompletionCard } from "./cards/TrainingCompletionCard";

import { HubSurfaceCard } from "./HubSurfaceCard";

import { HubWorkspaceShell } from "./workspace/HubWorkspaceShell";



type Props = {

  data: HomepagePayload;

  userName?: string | null;

  role?: string | null;

  apiOffline?: boolean;

};



export function HubHomepage({ data, userName, role, apiOffline }: Props) {

  const { sections } = data;

  const hasWeatherAlerts = (data.weather?.alerts?.length ?? 0) > 0;

  const hasJobs = data.jobPreview.length > 0;

  const hasSafetyBlog = data.safetyBlogPreview.length > 0;

  const hasTrending = data.trendingTopics.length > 0;

  const hasProjectUpdates = data.projectUpdates.length > 0;

  const hasAchievements = data.achievements.length > 0;

  const hasAnnouncements = data.announcements.length > 0;



  return (

    <div className="space-y-8 pb-16">

      <HubWorkspaceShell userName={userName} role={role} />



      <HubToolkitSection />



      {apiOffline ? (

        <div

          role="status"

          className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950"

        >

          The Vera API is not reachable (start the backend on port 3001). Feed and live

          data will appear once the API is running.

        </div>

      ) : null}



      {shouldShowSection(sections, "quickActions") && data.quickActions.length > 0 ? (

        <HubSection title="Quick actions" description={`Shortcuts for ${hubRoleLabel(data.hubRole).toLowerCase()}s`}>

          <QuickActionsBar actions={data.quickActions} />

        </HubSection>

      ) : null}



      {shouldShowSection(sections, "weather") && hasWeatherAlerts ? (

        <HubSection

          title="Weather alerts"

          description="Active watches and warnings for your work area"

        >

          <WeatherAlertsSection weather={data.weather!} />

        </HubSection>

      ) : null}



      {shouldShowSection(sections, "feed") ? (
        <PersonalizedFeedSection
          initialItems={data.feed.items}
          initialCursor={data.feed.nextCursor}
        />
      ) : null}

      {shouldShowSection(sections, "feed") ? <SuggestionRail /> : null}



      {shouldShowSection(sections, "trending") && hasTrending ? (

        <HubSection

          title="Industry intelligence"

          description="Trending safety topics and regulatory updates"

        >

          <TrendingTopicsSection topics={data.trendingTopics} />

        </HubSection>

      ) : null}



      {shouldShowSection(sections, "jobs") ? (
        <HubSection
          id="jobs"
          title="Job board"
          description="Open roles matched to your trade"
        >
          <div className="mb-4 flex justify-end">
            <Link
              href="/jobs"
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              View all jobs
            </Link>
          </div>
          {hasJobs ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.jobPreview.map((job) => (
                <JobPostCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#5a6b7c]">
              No featured roles right now.{" "}
              <Link href="/jobs" className="font-semibold text-[#2F8F8C] hover:underline">
                Browse the full job board
              </Link>
              .
            </p>
          )}
        </HubSection>
      ) : null}


      {shouldShowSection(sections, "safetyBlog") && hasSafetyBlog ? (

        <HubSection id="safety" title="Safety blog">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {data.safetyBlogPreview.map((article) => (

              <SafetyArticleCard key={article.id} article={article} />

            ))}

          </div>

        </HubSection>

      ) : null}



      {shouldShowSection(sections, "projectUpdates") && hasProjectUpdates ? (

        <HubSection title="Project updates">

          <div className="grid gap-4 md:grid-cols-2">

            {data.projectUpdates.map((u) => (

              <ProjectUpdateCard key={u.id} update={u} />

            ))}

          </div>

        </HubSection>

      ) : null}



      {shouldShowSection(sections, "achievements") && hasAchievements ? (

        <HubSection title="Worker achievements">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {data.achievements.map((a) => (

              <TrainingCompletionCard key={a.id} achievement={a} />

            ))}

          </div>

        </HubSection>

      ) : null}



      {shouldShowSection(sections, "announcements") && hasAnnouncements ? (

        <HubSection title="Company announcements">

          <div className="grid gap-4 md:grid-cols-2">

            {data.announcements.map((a) => (

              <HubSurfaceCard key={a.id} accentBar="from-[#1e4a7a] to-[#2F85CC]">

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">

                  {a.priority === "high" ? "High priority" : "Announcement"}

                </p>

                <p className="mt-1 text-base font-bold text-[#2A2E33]">{a.title}</p>

                <p className="mt-2 text-sm leading-relaxed text-[#5a6b7c]">{a.body}</p>

              </HubSurfaceCard>

            ))}

          </div>

        </HubSection>

      ) : null}

    </div>

  );

}

