import type { TrendingTopicDto } from "@vera/api-contract";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HubSurfaceCard } from "../HubSurfaceCard";

type Props = { topics: TrendingTopicDto[] };

const CATEGORY_ACCENTS: Record<string, string> = {
  regulation: "from-[#1e4a7a] to-[#2F85CC]",
  equipment: "from-[#64748b] to-[#94a3b8]",
  training: "from-[#7c3aed] to-[#a78bfa]",
  incident: "from-[#B33A3A] to-[#f97316]",
};

export function TrendingTopicsSection({ topics }: Props) {
  if (!topics.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => {
        const accent = CATEGORY_ACCENTS[topic.category.toLowerCase()] ?? "from-[#2F8F8C] to-[#3AA39F]";
        return (
          <HubSurfaceCard key={topic.id} accentBar={accent}>
            <div className="flex flex-1 flex-col gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F8F8C] to-[#3AA39F] text-white shadow-md">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2F8F8C]">
                  {topic.category}
                </p>
                <h3 className="mt-1 text-base font-bold text-[#2A2E33]">
                  <Link href={`/safety/category/${topic.slug}`} className="hover:text-[#2F8F8C]">
                    {topic.title}
                  </Link>
                </h3>
                {topic.description ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5a6b7c]">
                    {topic.description}
                  </p>
                ) : null}
              </div>
              <Link
                href={`/safety/category/${topic.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#2F8F8C] hover:underline"
              >
                Explore
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </HubSurfaceCard>
        );
      })}
    </div>
  );
}
