import Link from "next/link";
import { fetchExpertQuestions } from "@/lib/expert-qa/api";
import { QuestionCard } from "@/components/expert-qa/QuestionCard";
import { buttonStyles } from "@/components/ui";

type Props = { searchParams: Promise<{ tag?: string; trade?: string; q?: string }> };

export default async function ExpertsIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const list = await fetchExpertQuestions({
    pageSize: 20,
    tag: params.tag,
    trade: params.trade,
    q: params.q,
    sort: params.q ? undefined : "newest",
  }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20 }));

  return (
    <div className="space-y-vera-8">
      <header className="flex flex-col gap-vera-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-vera-deep">Expert Q&A</h1>
          <p className="mt-vera-2 text-vera-muted max-w-xl">
            Ask field safety questions and get answers from verified experts and experienced peers.
          </p>
        </div>
        <div className="flex flex-wrap gap-vera-2">
          <Link href="/experts/verify" className={buttonStyles({ variant: "outline", size: "md" })}>
            Become verified
          </Link>
          <Link href="/experts/ask" className={buttonStyles({ variant: "primary", size: "md" })}>
            Ask a question
          </Link>
        </div>
      </header>
      <div className="space-y-vera-4">
        {list.items.map((q) => (
          <QuestionCard key={q.id} q={q} />
        ))}
        {list.items.length === 0 ? (
          <p className="text-sm text-vera-muted">No questions yet. Be the first to ask.</p>
        ) : null}
      </div>
    </div>
  );
}
