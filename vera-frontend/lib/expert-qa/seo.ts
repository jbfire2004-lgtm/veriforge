import type { Metadata } from "next";
import type { ExpertQaQuestionDetail } from "@vera/api-contract";
import { publicSiteUrl } from "@/lib/dev-ports";

export function siteUrl(): string {
  return publicSiteUrl();
}

export function questionUrl(slug: string): string {
  return `${siteUrl()}/experts/questions/${slug}`;
}

export function questionMetadata(q: ExpertQaQuestionDetail): Metadata {
  const url = questionUrl(q.slug);
  const description = q.excerpt;
  return {
    title: `${q.title} | Vera Experts`,
    description,
    alternates: { canonical: url },
    openGraph: { title: q.title, description, url, type: "article" },
  };
}

export function qaPageJsonLd(q: ExpertQaQuestionDetail) {
  const accepted = q.answers.find((a) => a.isAccepted);
  const topAnswers = q.answers.slice(0, 3);

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: q.title,
      text: q.body,
      answerCount: q.answerCount,
      dateCreated: q.createdAt,
      author: q.anonymous
        ? { "@type": "Person", name: "Anonymous" }
        : q.author
          ? { "@type": "Person", name: q.author.displayName }
          : undefined,
      acceptedAnswer: accepted
        ? {
            "@type": "Answer",
            text: accepted.body,
            upvoteCount: accepted.voteScore,
            dateCreated: accepted.createdAt,
            author: {
              "@type": "Person",
              name: accepted.author.displayName,
            },
          }
        : undefined,
      suggestedAnswer: topAnswers.map((a) => ({
        "@type": "Answer",
        text: a.body,
        upvoteCount: a.voteScore,
        dateCreated: a.createdAt,
        author: { "@type": "Person", name: a.author.displayName },
      })),
    },
  };
}
