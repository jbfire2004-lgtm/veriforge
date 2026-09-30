import type { ExpertQaQuestionSummary } from "@vera/api-contract";
import Link from "next/link";

export function QuestionCard({ q }: { q: ExpertQaQuestionSummary }) {
  return (
    <article className="rounded-xl border border-vera-border bg-white p-vera-5 shadow-sm hover:border-vera-teal/40">
      <div className="mb-vera-2 flex flex-wrap gap-vera-2 text-xs text-vera-muted">
        {q.trade ? <span>{q.trade}</span> : null}
        <span>{q.answerCount} answers</span>
        <span>{q.voteScore} votes</span>
        {q.hasAcceptedAnswer ? (
          <span className="text-vera-teal">Accepted</span>
        ) : null}
      </div>
      <h2 className="text-lg font-semibold leading-snug">
        <Link
          href={`/experts/questions/${q.slug}`}
          className="text-vera-deep hover:text-vera-teal no-underline"
        >
          {q.title}
        </Link>
      </h2>
      <p className="mt-vera-2 line-clamp-2 text-sm text-vera-muted">{q.excerpt}</p>
      <div className="mt-vera-3 flex flex-wrap gap-vera-2">
        {q.tagSlugs.map((tag) => (
          <Link
            key={tag}
            href={`/experts?tag=${tag}`}
            className="rounded-full bg-vera-muted/10 px-2 py-0.5 text-xs text-vera-muted hover:text-vera-teal no-underline"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </article>
  );
}
