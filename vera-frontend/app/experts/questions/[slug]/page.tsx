import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchExpertQuestion } from "@/lib/expert-qa/api";
import { qaPageJsonLd, questionMetadata } from "@/lib/expert-qa/seo";
import { loadPageSeo, jsonLdScriptTag } from "@/lib/seo/page-seo";
import { AnswerList } from "@/components/expert-qa/AnswerList";
import { AnswerEditor } from "@/components/expert-qa/AnswerEditor";
import { QuestionReportActions } from "@/components/moderation/QuestionReportActions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { metadata } = await loadPageSeo({ type: "QA_QUESTION", slug });
    return metadata;
  } catch {
    try {
      const q = await fetchExpertQuestion(slug);
      return questionMetadata(q);
    } catch {
      return { title: "Question not found" };
    }
  }
}

export default async function ExpertQuestionPage({ params }: Props) {
  const { slug } = await params;
  let question;
  try {
    question = await fetchExpertQuestion(slug);
  } catch {
    notFound();
  }

  let jsonLd: Record<string, unknown>;
  try {
    const seo = await loadPageSeo({ type: "QA_QUESTION", slug });
    jsonLd = seo.jsonLd as Record<string, unknown>;
  } catch {
    jsonLd = qaPageJsonLd(question) as Record<string, unknown>;
  }

  return (
    <article className="space-y-vera-8">
      {jsonLdScriptTag(jsonLd)}
      <header className="space-y-vera-3">
        <h1 className="text-2xl font-semibold leading-tight text-vera-deep">{question.title}</h1>
        <p className="text-sm text-vera-muted">
          {question.answerCount} answers · {question.viewCount} views
          {question.trade ? ` · ${question.trade}` : ""}
        </p>
        <QuestionReportActions
          questionId={question.id}
          title={question.title}
          authorUserId={question.author?.userId}
          anonymous={question.anonymous}
        />
        <div className="prose max-w-none text-sm whitespace-pre-wrap">{question.body}</div>
        {question.attachments.length > 0 ? (
          <ul className="text-sm space-y-vera-2">
            {question.attachments.map((a) => (
              <li key={a.id}>
                <a href={a.fileUrl} className="text-vera-teal hover:underline" target="_blank" rel="noopener noreferrer">
                  {a.fileName}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <section className="space-y-vera-4">
        <h2 className="text-lg font-semibold">
          {question.answerCount} {question.answerCount === 1 ? "Answer" : "Answers"}
        </h2>
        <AnswerList question={question} />
      </section>

      <AnswerEditor questionId={question.id} />
    </article>
  );
}
