import { z } from "zod";
export declare const ExpertBadgeLevelSchema: z.ZodEnum<["CONTRIBUTOR", "BRONZE", "SILVER", "GOLD", "PLATINUM"]>;
export declare const ExpertQaQuestionStatusSchema: z.ZodEnum<["OPEN", "CLOSED", "ARCHIVED", "HIDDEN"]>;
export declare const ExpertQaModerationStatusSchema: z.ZodEnum<["VISIBLE", "PENDING", "HIDDEN"]>;
export declare const ExpertQaAttachmentTypeSchema: z.ZodEnum<["IMAGE", "PDF", "OTHER"]>;
export declare const ExpertProfileSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodNumber;
    displayName: z.ZodString;
    headline: z.ZodNullable<z.ZodString>;
    bio: z.ZodNullable<z.ZodString>;
    trade: z.ZodNullable<z.ZodString>;
    verified: z.ZodBoolean;
    reputationScore: z.ZodNumber;
    badgeLevel: z.ZodEnum<["CONTRIBUTOR", "BRONZE", "SILVER", "GOLD", "PLATINUM"]>;
    answerCount: z.ZodNumber;
    acceptedCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    trade: string | null;
    userId: number;
    verified: boolean;
    displayName: string;
    bio: string | null;
    headline: string | null;
    reputationScore: number;
    badgeLevel: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    answerCount: number;
    acceptedCount: number;
}, {
    id: string;
    trade: string | null;
    userId: number;
    verified: boolean;
    displayName: string;
    bio: string | null;
    headline: string | null;
    reputationScore: number;
    badgeLevel: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    answerCount: number;
    acceptedCount: number;
}>;
export declare const ExpertQaAttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    fileName: z.ZodString;
    fileUrl: z.ZodString;
    mimeType: z.ZodString;
    type: z.ZodEnum<["IMAGE", "PDF", "OTHER"]>;
}, "strip", z.ZodTypeAny, {
    type: "OTHER" | "IMAGE" | "PDF";
    id: string;
    mimeType: string;
    fileName: string;
    fileUrl: string;
}, {
    type: "OTHER" | "IMAGE" | "PDF";
    id: string;
    mimeType: string;
    fileName: string;
    fileUrl: string;
}>;
export declare const ExpertQaAnswerSchema: z.ZodObject<{
    id: z.ZodString;
    questionId: z.ZodString;
    body: z.ZodString;
    voteScore: z.ZodNumber;
    isExpertAnswer: z.ZodBoolean;
    isAccepted: z.ZodBoolean;
    author: z.ZodObject<{
        userId: z.ZodNumber;
        displayName: z.ZodString;
        badgeLevel: z.ZodOptional<z.ZodEnum<["CONTRIBUTOR", "BRONZE", "SILVER", "GOLD", "PLATINUM"]>>;
        verified: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        userId: number;
        displayName: string;
        verified?: boolean | undefined;
        badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
    }, {
        userId: number;
        displayName: string;
        verified?: boolean | undefined;
        badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
    }>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    createdAt: string;
    author: {
        userId: number;
        displayName: string;
        verified?: boolean | undefined;
        badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
    };
    questionId: string;
    voteScore: number;
    isExpertAnswer: boolean;
    isAccepted: boolean;
}, {
    id: string;
    body: string;
    createdAt: string;
    author: {
        userId: number;
        displayName: string;
        verified?: boolean | undefined;
        badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
    };
    questionId: string;
    voteScore: number;
    isExpertAnswer: boolean;
    isAccepted: boolean;
}>;
export declare const ExpertQaQuestionSummarySchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodString;
    trade: z.ZodNullable<z.ZodString>;
    anonymous: z.ZodBoolean;
    status: z.ZodEnum<["OPEN", "CLOSED", "ARCHIVED", "HIDDEN"]>;
    voteScore: z.ZodNumber;
    answerCount: z.ZodNumber;
    viewCount: z.ZodNumber;
    hasAcceptedAnswer: z.ZodBoolean;
    tagSlugs: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
    id: string;
    trade: string | null;
    createdAt: string;
    title: string;
    slug: string;
    viewCount: number;
    excerpt: string;
    tagSlugs: string[];
    answerCount: number;
    voteScore: number;
    anonymous: boolean;
    hasAcceptedAnswer: boolean;
}, {
    status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
    id: string;
    trade: string | null;
    createdAt: string;
    title: string;
    slug: string;
    viewCount: number;
    excerpt: string;
    tagSlugs: string[];
    answerCount: number;
    voteScore: number;
    anonymous: boolean;
    hasAcceptedAnswer: boolean;
}>;
export declare const ExpertQaQuestionDetailSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodString;
    trade: z.ZodNullable<z.ZodString>;
    anonymous: z.ZodBoolean;
    status: z.ZodEnum<["OPEN", "CLOSED", "ARCHIVED", "HIDDEN"]>;
    voteScore: z.ZodNumber;
    answerCount: z.ZodNumber;
    viewCount: z.ZodNumber;
    hasAcceptedAnswer: z.ZodBoolean;
    tagSlugs: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
} & {
    body: z.ZodString;
    companyId: z.ZodNullable<z.ZodNumber>;
    projectId: z.ZodNullable<z.ZodNumber>;
    author: z.ZodNullable<z.ZodObject<{
        userId: z.ZodNumber;
        displayName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        userId: number;
        displayName: string;
    }, {
        userId: number;
        displayName: string;
    }>>;
    attachments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        fileName: z.ZodString;
        fileUrl: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodEnum<["IMAGE", "PDF", "OTHER"]>;
    }, "strip", z.ZodTypeAny, {
        type: "OTHER" | "IMAGE" | "PDF";
        id: string;
        mimeType: string;
        fileName: string;
        fileUrl: string;
    }, {
        type: "OTHER" | "IMAGE" | "PDF";
        id: string;
        mimeType: string;
        fileName: string;
        fileUrl: string;
    }>, "many">;
    answers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        questionId: z.ZodString;
        body: z.ZodString;
        voteScore: z.ZodNumber;
        isExpertAnswer: z.ZodBoolean;
        isAccepted: z.ZodBoolean;
        author: z.ZodObject<{
            userId: z.ZodNumber;
            displayName: z.ZodString;
            badgeLevel: z.ZodOptional<z.ZodEnum<["CONTRIBUTOR", "BRONZE", "SILVER", "GOLD", "PLATINUM"]>>;
            verified: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            userId: number;
            displayName: string;
            verified?: boolean | undefined;
            badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
        }, {
            userId: number;
            displayName: string;
            verified?: boolean | undefined;
            badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
        }>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        createdAt: string;
        author: {
            userId: number;
            displayName: string;
            verified?: boolean | undefined;
            badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
        };
        questionId: string;
        voteScore: number;
        isExpertAnswer: boolean;
        isAccepted: boolean;
    }, {
        id: string;
        body: string;
        createdAt: string;
        author: {
            userId: number;
            displayName: string;
            verified?: boolean | undefined;
            badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
        };
        questionId: string;
        voteScore: number;
        isExpertAnswer: boolean;
        isAccepted: boolean;
    }>, "many">;
    acceptedAnswerId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
    companyId: number | null;
    id: string;
    trade: string | null;
    projectId: number | null;
    body: string;
    createdAt: string;
    title: string;
    attachments: {
        type: "OTHER" | "IMAGE" | "PDF";
        id: string;
        mimeType: string;
        fileName: string;
        fileUrl: string;
    }[];
    answers: {
        id: string;
        body: string;
        createdAt: string;
        author: {
            userId: number;
            displayName: string;
            verified?: boolean | undefined;
            badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
        };
        questionId: string;
        voteScore: number;
        isExpertAnswer: boolean;
        isAccepted: boolean;
    }[];
    slug: string;
    viewCount: number;
    excerpt: string;
    author: {
        userId: number;
        displayName: string;
    } | null;
    tagSlugs: string[];
    answerCount: number;
    voteScore: number;
    anonymous: boolean;
    hasAcceptedAnswer: boolean;
    acceptedAnswerId: string | null;
}, {
    status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
    companyId: number | null;
    id: string;
    trade: string | null;
    projectId: number | null;
    body: string;
    createdAt: string;
    title: string;
    attachments: {
        type: "OTHER" | "IMAGE" | "PDF";
        id: string;
        mimeType: string;
        fileName: string;
        fileUrl: string;
    }[];
    answers: {
        id: string;
        body: string;
        createdAt: string;
        author: {
            userId: number;
            displayName: string;
            verified?: boolean | undefined;
            badgeLevel?: "CONTRIBUTOR" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined;
        };
        questionId: string;
        voteScore: number;
        isExpertAnswer: boolean;
        isAccepted: boolean;
    }[];
    slug: string;
    viewCount: number;
    excerpt: string;
    author: {
        userId: number;
        displayName: string;
    } | null;
    tagSlugs: string[];
    answerCount: number;
    voteScore: number;
    anonymous: boolean;
    hasAcceptedAnswer: boolean;
    acceptedAnswerId: string | null;
}>;
export declare const ExpertQaQuestionListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        title: z.ZodString;
        excerpt: z.ZodString;
        trade: z.ZodNullable<z.ZodString>;
        anonymous: z.ZodBoolean;
        status: z.ZodEnum<["OPEN", "CLOSED", "ARCHIVED", "HIDDEN"]>;
        voteScore: z.ZodNumber;
        answerCount: z.ZodNumber;
        viewCount: z.ZodNumber;
        hasAcceptedAnswer: z.ZodBoolean;
        tagSlugs: z.ZodArray<z.ZodString, "many">;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
        id: string;
        trade: string | null;
        createdAt: string;
        title: string;
        slug: string;
        viewCount: number;
        excerpt: string;
        tagSlugs: string[];
        answerCount: number;
        voteScore: number;
        anonymous: boolean;
        hasAcceptedAnswer: boolean;
    }, {
        status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
        id: string;
        trade: string | null;
        createdAt: string;
        title: string;
        slug: string;
        viewCount: number;
        excerpt: string;
        tagSlugs: string[];
        answerCount: number;
        voteScore: number;
        anonymous: boolean;
        hasAcceptedAnswer: boolean;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    items: {
        status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
        id: string;
        trade: string | null;
        createdAt: string;
        title: string;
        slug: string;
        viewCount: number;
        excerpt: string;
        tagSlugs: string[];
        answerCount: number;
        voteScore: number;
        anonymous: boolean;
        hasAcceptedAnswer: boolean;
    }[];
    total: number;
    page: number;
    pageSize: number;
}, {
    items: {
        status: "CLOSED" | "ARCHIVED" | "HIDDEN" | "OPEN";
        id: string;
        trade: string | null;
        createdAt: string;
        title: string;
        slug: string;
        viewCount: number;
        excerpt: string;
        tagSlugs: string[];
        answerCount: number;
        voteScore: number;
        anonymous: boolean;
        hasAcceptedAnswer: boolean;
    }[];
    total: number;
    page: number;
    pageSize: number;
}>;
export declare const createExpertQaQuestionSchema: z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    trade: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodOptional<z.ZodNumber>;
    anonymous: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fileName: z.ZodString;
        fileUrl: z.ZodString;
        mimeType: z.ZodString;
        type: z.ZodOptional<z.ZodEnum<["IMAGE", "PDF", "OTHER"]>>;
        sizeBytes: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        mimeType: string;
        fileName: string;
        fileUrl: string;
        type?: "OTHER" | "IMAGE" | "PDF" | undefined;
        sizeBytes?: number | undefined;
    }, {
        mimeType: string;
        fileName: string;
        fileUrl: string;
        type?: "OTHER" | "IMAGE" | "PDF" | undefined;
        sizeBytes?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    body: string;
    title: string;
    companyId?: number | undefined;
    trade?: string | undefined;
    projectId?: number | undefined;
    attachments?: {
        mimeType: string;
        fileName: string;
        fileUrl: string;
        type?: "OTHER" | "IMAGE" | "PDF" | undefined;
        sizeBytes?: number | undefined;
    }[] | undefined;
    tags?: string[] | undefined;
    anonymous?: boolean | undefined;
}, {
    body: string;
    title: string;
    companyId?: number | undefined;
    trade?: string | undefined;
    projectId?: number | undefined;
    attachments?: {
        mimeType: string;
        fileName: string;
        fileUrl: string;
        type?: "OTHER" | "IMAGE" | "PDF" | undefined;
        sizeBytes?: number | undefined;
    }[] | undefined;
    tags?: string[] | undefined;
    anonymous?: boolean | undefined;
}>;
export declare const createExpertQaAnswerSchema: z.ZodObject<{
    questionId: z.ZodString;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    body: string;
    questionId: string;
}, {
    body: string;
    questionId: string;
}>;
export declare const voteExpertQaAnswerSchema: z.ZodObject<{
    answerId: z.ZodString;
    value: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<-1>]>;
    voterKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: 1 | -1;
    answerId: string;
    voterKey?: string | undefined;
}, {
    value: 1 | -1;
    answerId: string;
    voterKey?: string | undefined;
}>;
export declare const acceptExpertQaAnswerSchema: z.ZodObject<{
    questionId: z.ZodString;
    answerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    questionId: string;
    answerId: string;
}, {
    questionId: string;
    answerId: string;
}>;
export declare const expertQaListQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
    trade: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<["newest", "votes", "unanswered"]>>;
}, "strip", z.ZodTypeAny, {
    sort?: "newest" | "votes" | "unanswered" | undefined;
    q?: string | undefined;
    trade?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    tag?: string | undefined;
}, {
    sort?: "newest" | "votes" | "unanswered" | undefined;
    q?: string | undefined;
    trade?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    tag?: string | undefined;
}>;
export declare const endorseExpertSchema: z.ZodObject<{
    expertProfileId: z.ZodString;
    skill: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    expertProfileId: string;
    skill: string;
    message?: string | undefined;
}, {
    expertProfileId: string;
    skill: string;
    message?: string | undefined;
}>;
export declare const moderateExpertQaSchema: z.ZodObject<{
    id: z.ZodString;
    moderationStatus: z.ZodEnum<["VISIBLE", "PENDING", "HIDDEN"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    moderationStatus: "PENDING" | "VISIBLE" | "HIDDEN";
}, {
    id: string;
    moderationStatus: "PENDING" | "VISIBLE" | "HIDDEN";
}>;
export type ExpertProfile = z.infer<typeof ExpertProfileSchema>;
export type ExpertQaQuestionSummary = z.infer<typeof ExpertQaQuestionSummarySchema>;
export type ExpertQaQuestionDetail = z.infer<typeof ExpertQaQuestionDetailSchema>;
export type ExpertQaAnswer = z.infer<typeof ExpertQaAnswerSchema>;
export type ExpertQaQuestionList = z.infer<typeof ExpertQaQuestionListSchema>;
