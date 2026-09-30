import { z } from "zod";
export declare const SocialPostEngagementSchema: z.ZodObject<{
    likeCount: z.ZodNumber;
    commentCount: z.ZodNumber;
    shareCount: z.ZodNumber;
    likedByMe: z.ZodOptional<z.ZodBoolean>;
    savedByMe: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    likedByMe?: boolean | undefined;
    savedByMe?: boolean | undefined;
}, {
    likeCount: number;
    commentCount: number;
    shareCount: number;
    likedByMe?: boolean | undefined;
    savedByMe?: boolean | undefined;
}>;
export declare const SocialMediaAttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    fileType: z.ZodString;
    url: z.ZodString;
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string;
    fileType: string;
    mimeType?: string | null | undefined;
}, {
    id: string;
    url: string;
    fileType: string;
    mimeType?: string | null | undefined;
}>;
export declare const SocialPostCardSchema: z.ZodObject<{
    kind: z.ZodLiteral<"post">;
    id: z.ZodString;
    postType: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    body: z.ZodString;
    publishedAt: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        username: string;
    }, {
        id: number;
        username: string;
    }>;
    media: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        fileType: z.ZodString;
        url: z.ZodString;
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }, {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }>, "many">;
    pinned: z.ZodOptional<z.ZodBoolean>;
    engagement: z.ZodObject<{
        likeCount: z.ZodNumber;
        commentCount: z.ZodNumber;
        shareCount: z.ZodNumber;
        likedByMe: z.ZodOptional<z.ZodBoolean>;
        savedByMe: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    }, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    kind: "post";
    title: string | null;
    publishedAt: string;
    postType: string;
    author: {
        id: number;
        username: string;
    };
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    };
    media: {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }[];
    pinned?: boolean | undefined;
}, {
    id: string;
    body: string;
    kind: "post";
    title: string | null;
    publishedAt: string;
    postType: string;
    author: {
        id: number;
        username: string;
    };
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    };
    media: {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }[];
    pinned?: boolean | undefined;
}>;
export declare const LegacyFeedCardSchema: z.ZodObject<{
    kind: z.ZodLiteral<"legacy">;
    id: z.ZodString;
    source: z.ZodString;
    title: z.ZodString;
    summary: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    kind: "legacy";
    source: string;
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
}, {
    id: string;
    kind: "legacy";
    source: string;
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
}>;
export declare const SponsoredAdCardSchema: z.ZodObject<{
    kind: z.ZodLiteral<"ad">;
    id: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    imageUrl: z.ZodNullable<z.ZodString>;
    ctaUrl: z.ZodNullable<z.ZodString>;
    ctaLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    kind: "ad";
    title: string;
    imageUrl: string | null;
    ctaUrl: string | null;
    ctaLabel?: string | null | undefined;
}, {
    id: string;
    body: string;
    kind: "ad";
    title: string;
    imageUrl: string | null;
    ctaUrl: string | null;
    ctaLabel?: string | null | undefined;
}>;
export declare const PinnedPostCardSchema: z.ZodObject<{
    kind: z.ZodLiteral<"pinned">;
    post: z.ZodObject<{
        kind: z.ZodLiteral<"post">;
        id: z.ZodString;
        postType: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        body: z.ZodString;
        publishedAt: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodNumber;
            username: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            username: string;
        }, {
            id: number;
            username: string;
        }>;
        media: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            fileType: z.ZodString;
            url: z.ZodString;
            mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }, {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }>, "many">;
        pinned: z.ZodOptional<z.ZodBoolean>;
        engagement: z.ZodObject<{
            likeCount: z.ZodNumber;
            commentCount: z.ZodNumber;
            shareCount: z.ZodNumber;
            likedByMe: z.ZodOptional<z.ZodBoolean>;
            savedByMe: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        }, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    }, {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "pinned";
    post: {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    };
}, {
    kind: "pinned";
    post: {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    };
}>;
export declare const SocialFeedEntrySchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    kind: z.ZodLiteral<"post">;
    id: z.ZodString;
    postType: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    body: z.ZodString;
    publishedAt: z.ZodString;
    author: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        username: string;
    }, {
        id: number;
        username: string;
    }>;
    media: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        fileType: z.ZodString;
        url: z.ZodString;
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }, {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }>, "many">;
    pinned: z.ZodOptional<z.ZodBoolean>;
    engagement: z.ZodObject<{
        likeCount: z.ZodNumber;
        commentCount: z.ZodNumber;
        shareCount: z.ZodNumber;
        likedByMe: z.ZodOptional<z.ZodBoolean>;
        savedByMe: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    }, {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    kind: "post";
    title: string | null;
    publishedAt: string;
    postType: string;
    author: {
        id: number;
        username: string;
    };
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    };
    media: {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }[];
    pinned?: boolean | undefined;
}, {
    id: string;
    body: string;
    kind: "post";
    title: string | null;
    publishedAt: string;
    postType: string;
    author: {
        id: number;
        username: string;
    };
    engagement: {
        likeCount: number;
        commentCount: number;
        shareCount: number;
        likedByMe?: boolean | undefined;
        savedByMe?: boolean | undefined;
    };
    media: {
        id: string;
        url: string;
        fileType: string;
        mimeType?: string | null | undefined;
    }[];
    pinned?: boolean | undefined;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"legacy">;
    id: z.ZodString;
    source: z.ZodString;
    title: z.ZodString;
    summary: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    kind: "legacy";
    source: string;
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
}, {
    id: string;
    kind: "legacy";
    source: string;
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"ad">;
    id: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    imageUrl: z.ZodNullable<z.ZodString>;
    ctaUrl: z.ZodNullable<z.ZodString>;
    ctaLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    kind: "ad";
    title: string;
    imageUrl: string | null;
    ctaUrl: string | null;
    ctaLabel?: string | null | undefined;
}, {
    id: string;
    body: string;
    kind: "ad";
    title: string;
    imageUrl: string | null;
    ctaUrl: string | null;
    ctaLabel?: string | null | undefined;
}>, z.ZodObject<{
    kind: z.ZodLiteral<"pinned">;
    post: z.ZodObject<{
        kind: z.ZodLiteral<"post">;
        id: z.ZodString;
        postType: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        body: z.ZodString;
        publishedAt: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodNumber;
            username: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            username: string;
        }, {
            id: number;
            username: string;
        }>;
        media: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            fileType: z.ZodString;
            url: z.ZodString;
            mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }, {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }>, "many">;
        pinned: z.ZodOptional<z.ZodBoolean>;
        engagement: z.ZodObject<{
            likeCount: z.ZodNumber;
            commentCount: z.ZodNumber;
            shareCount: z.ZodNumber;
            likedByMe: z.ZodOptional<z.ZodBoolean>;
            savedByMe: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        }, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    }, {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    kind: "pinned";
    post: {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    };
}, {
    kind: "pinned";
    post: {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    };
}>]>;
export declare const SocialFeedPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"post">;
        id: z.ZodString;
        postType: z.ZodString;
        title: z.ZodNullable<z.ZodString>;
        body: z.ZodString;
        publishedAt: z.ZodString;
        author: z.ZodObject<{
            id: z.ZodNumber;
            username: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            username: string;
        }, {
            id: number;
            username: string;
        }>;
        media: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            fileType: z.ZodString;
            url: z.ZodString;
            mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }, {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }>, "many">;
        pinned: z.ZodOptional<z.ZodBoolean>;
        engagement: z.ZodObject<{
            likeCount: z.ZodNumber;
            commentCount: z.ZodNumber;
            shareCount: z.ZodNumber;
            likedByMe: z.ZodOptional<z.ZodBoolean>;
            savedByMe: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        }, {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    }, {
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"legacy">;
        id: z.ZodString;
        source: z.ZodString;
        title: z.ZodString;
        summary: z.ZodNullable<z.ZodString>;
        imageUrl: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
        publishedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        kind: "legacy";
        source: string;
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
    }, {
        id: string;
        kind: "legacy";
        source: string;
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"ad">;
        id: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        imageUrl: z.ZodNullable<z.ZodString>;
        ctaUrl: z.ZodNullable<z.ZodString>;
        ctaLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        kind: "ad";
        title: string;
        imageUrl: string | null;
        ctaUrl: string | null;
        ctaLabel?: string | null | undefined;
    }, {
        id: string;
        body: string;
        kind: "ad";
        title: string;
        imageUrl: string | null;
        ctaUrl: string | null;
        ctaLabel?: string | null | undefined;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"pinned">;
        post: z.ZodObject<{
            kind: z.ZodLiteral<"post">;
            id: z.ZodString;
            postType: z.ZodString;
            title: z.ZodNullable<z.ZodString>;
            body: z.ZodString;
            publishedAt: z.ZodString;
            author: z.ZodObject<{
                id: z.ZodNumber;
                username: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: number;
                username: string;
            }, {
                id: number;
                username: string;
            }>;
            media: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                fileType: z.ZodString;
                url: z.ZodString;
                mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }, {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }>, "many">;
            pinned: z.ZodOptional<z.ZodBoolean>;
            engagement: z.ZodObject<{
                likeCount: z.ZodNumber;
                commentCount: z.ZodNumber;
                shareCount: z.ZodNumber;
                likedByMe: z.ZodOptional<z.ZodBoolean>;
                savedByMe: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            }, {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            body: string;
            kind: "post";
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            engagement: {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            };
            media: {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }[];
            pinned?: boolean | undefined;
        }, {
            id: string;
            body: string;
            kind: "post";
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            engagement: {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            };
            media: {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }[];
            pinned?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        kind: "pinned";
        post: {
            id: string;
            body: string;
            kind: "post";
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            engagement: {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            };
            media: {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }[];
            pinned?: boolean | undefined;
        };
    }, {
        kind: "pinned";
        post: {
            id: string;
            body: string;
            kind: "post";
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            engagement: {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            };
            media: {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }[];
            pinned?: boolean | undefined;
        };
    }>]>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: ({
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    } | {
        id: string;
        kind: "legacy";
        source: string;
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
    } | {
        id: string;
        body: string;
        kind: "ad";
        title: string;
        imageUrl: string | null;
        ctaUrl: string | null;
        ctaLabel?: string | null | undefined;
    } | {
        kind: "pinned";
        post: {
            id: string;
            body: string;
            kind: "post";
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            engagement: {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            };
            media: {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }[];
            pinned?: boolean | undefined;
        };
    })[];
    nextCursor: string | null;
}, {
    items: ({
        id: string;
        body: string;
        kind: "post";
        title: string | null;
        publishedAt: string;
        postType: string;
        author: {
            id: number;
            username: string;
        };
        engagement: {
            likeCount: number;
            commentCount: number;
            shareCount: number;
            likedByMe?: boolean | undefined;
            savedByMe?: boolean | undefined;
        };
        media: {
            id: string;
            url: string;
            fileType: string;
            mimeType?: string | null | undefined;
        }[];
        pinned?: boolean | undefined;
    } | {
        id: string;
        kind: "legacy";
        source: string;
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
    } | {
        id: string;
        body: string;
        kind: "ad";
        title: string;
        imageUrl: string | null;
        ctaUrl: string | null;
        ctaLabel?: string | null | undefined;
    } | {
        kind: "pinned";
        post: {
            id: string;
            body: string;
            kind: "post";
            title: string | null;
            publishedAt: string;
            postType: string;
            author: {
                id: number;
                username: string;
            };
            engagement: {
                likeCount: number;
                commentCount: number;
                shareCount: number;
                likedByMe?: boolean | undefined;
                savedByMe?: boolean | undefined;
            };
            media: {
                id: string;
                url: string;
                fileType: string;
                mimeType?: string | null | undefined;
            }[];
            pinned?: boolean | undefined;
        };
    })[];
    nextCursor: string | null;
}>;
export type SocialFeedPage = z.infer<typeof SocialFeedPageSchema>;
export type SocialPostCard = z.infer<typeof SocialPostCardSchema>;
