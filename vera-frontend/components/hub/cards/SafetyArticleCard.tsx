import type { SafetyArticleDto } from "@vera/api-contract";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { HubSurfaceCard } from "../HubSurfaceCard";

type Props = { article: SafetyArticleDto };

export function SafetyArticleCard({ article }: Props) {
  return (
    <HubSurfaceCard
      accentBar="from-[#B33A3A] to-[#C45A5A]"
      surface="from-[#F5E4E4]/60 via-white to-white"
      ring="ring-[#B33A3A]/15"
    >
      <div className="flex flex-1 flex-col gap-3">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt=""
            className="-mx-1 -mt-1 h-28 w-[calc(100%+0.5rem)] rounded-lg object-cover"
          />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B33A3A] to-[#ea580c] text-white shadow-md">
            <Shield className="h-4 w-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
            {article.category}
          </p>
          <h3 className="mt-1 text-base font-bold text-[#2A2E33]">
            <Link href={`/safety/${article.slug}`} className="hover:text-[#2F8F8C]">
              {article.title}
            </Link>
          </h3>
          {article.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5a6b7c]">
              {article.excerpt}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-[#64748b]">
          <span>
            {article.readMinutes} min read
            {article.authorName ? ` · ${article.authorName}` : ""}
          </span>
          <Link
            href={`/safety/${article.slug}`}
            className="inline-flex items-center gap-1 font-bold uppercase tracking-[0.08em] text-[#2F8F8C] hover:underline"
          >
            Read
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </HubSurfaceCard>
  );
}
