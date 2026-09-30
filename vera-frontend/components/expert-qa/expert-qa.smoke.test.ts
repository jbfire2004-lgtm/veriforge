import { describe, expect, it } from "vitest";
import { qaPageJsonLd, questionUrl } from "@/lib/expert-qa/seo";

describe("expert-qa seo", () => {
  it("builds QAPage JSON-LD", () => {
    const ld = qaPageJsonLd({
      id: "1",
      slug: "test-q",
      title: "Test?",
      excerpt: "excerpt",
      body: "body text",
      trade: null,
      anonymous: false,
      status: "OPEN",
      voteScore: 0,
      answerCount: 1,
      viewCount: 0,
      hasAcceptedAnswer: true,
      tagSlugs: [],
      createdAt: new Date().toISOString(),
      companyId: null,
      projectId: null,
      author: { userId: 1, displayName: "User" },
      attachments: [],
      acceptedAnswerId: "a1",
      answers: [
        {
          id: "a1",
          questionId: "1",
          body: "answer body",
          voteScore: 3,
          isExpertAnswer: true,
          isAccepted: true,
          author: { userId: 2, displayName: "Expert", badgeLevel: "GOLD", verified: true },
          createdAt: new Date().toISOString(),
        },
      ],
    });
    expect(ld["@type"]).toBe("QAPage");
    expect(ld.mainEntity["@type"]).toBe("Question");
  });

  it("questionUrl includes slug", () => {
    expect(questionUrl("my-question")).toContain("/experts/questions/my-question");
  });
});
