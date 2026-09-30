import { z } from "zod";
export declare const FeedSourceSchema: z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>;
export declare const HubHomepageRoleSchema: z.ZodEnum<["WORKER", "SUPERVISOR", "COMPANY_ADMIN", "UNION_HALL"]>;
export declare const HubSectionSchema: z.ZodEnum<["feed", "quickActions", "trending", "weather", "jobs", "safetyBlog", "projectUpdates", "achievements", "announcements"]>;
export declare const FeedItemDtoSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>;
    title: z.ZodString;
    summary: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
    rankScore: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
    rankScore: number;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    id: string;
    source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
    title: string;
    summary: string | null;
    publishedAt: string;
    imageUrl: string | null;
    url: string | null;
    rankScore: number;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const TrendingTopicDtoSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    viewCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: string;
    description: string | null;
    title: string;
    slug: string;
    viewCount: number;
}, {
    id: string;
    category: string;
    description: string | null;
    title: string;
    slug: string;
    viewCount: number;
}>;
export declare const WeatherAlertDtoSchema: z.ZodObject<{
    id: z.ZodString;
    region: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    severity: z.ZodEnum<["INFO", "WATCH", "WARNING", "EMERGENCY"]>;
    hazardType: z.ZodNullable<z.ZodString>;
    startsAt: z.ZodString;
    endsAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    title: string;
    severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
    region: string;
    hazardType: string | null;
    startsAt: string;
    endsAt: string | null;
}, {
    id: string;
    description: string;
    title: string;
    severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
    region: string;
    hazardType: string | null;
    startsAt: string;
    endsAt: string | null;
}>;
export declare const WeatherSnapshotDtoSchema: z.ZodObject<{
    region: z.ZodString;
    summary: z.ZodString;
    temperatureC: z.ZodNullable<z.ZodNumber>;
    conditions: z.ZodString;
    alerts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        region: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        severity: z.ZodEnum<["INFO", "WATCH", "WARNING", "EMERGENCY"]>;
        hazardType: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodString;
        endsAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        title: string;
        severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
        region: string;
        hazardType: string | null;
        startsAt: string;
        endsAt: string | null;
    }, {
        id: string;
        description: string;
        title: string;
        severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
        region: string;
        hazardType: string | null;
        startsAt: string;
        endsAt: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    summary: string;
    region: string;
    temperatureC: number | null;
    conditions: string;
    alerts: {
        id: string;
        description: string;
        title: string;
        severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
        region: string;
        hazardType: string | null;
        startsAt: string;
        endsAt: string | null;
    }[];
}, {
    summary: string;
    region: string;
    temperatureC: number | null;
    conditions: string;
    alerts: {
        id: string;
        description: string;
        title: string;
        severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
        region: string;
        hazardType: string | null;
        startsAt: string;
        endsAt: string | null;
    }[];
}>;
export declare const JobPostDtoSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    companyName: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    trade: z.ZodNullable<z.ZodString>;
    payRange: z.ZodNullable<z.ZodString>;
    summary: z.ZodNullable<z.ZodString>;
    url: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    trade: string | null;
    title: string;
    summary: string | null;
    companyName: string;
    location: string | null;
    publishedAt: string;
    url: string | null;
    payRange: string | null;
}, {
    id: string;
    trade: string | null;
    title: string;
    summary: string | null;
    companyName: string;
    location: string | null;
    publishedAt: string;
    url: string | null;
    payRange: string | null;
}>;
export declare const SafetyArticleDtoSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    excerpt: z.ZodNullable<z.ZodString>;
    authorName: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    category: z.ZodString;
    readMinutes: z.ZodNumber;
    publishedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: string;
    title: string;
    publishedAt: string;
    imageUrl: string | null;
    slug: string;
    excerpt: string | null;
    authorName: string | null;
    readMinutes: number;
}, {
    id: string;
    category: string;
    title: string;
    publishedAt: string;
    imageUrl: string | null;
    slug: string;
    excerpt: string | null;
    authorName: string | null;
    readMinutes: number;
}>;
export declare const ProjectUpdateDtoSchema: z.ZodObject<{
    id: z.ZodString;
    projectName: z.ZodString;
    title: z.ZodString;
    summary: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
    url: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    summary: string | null;
    projectName: string;
    publishedAt: string;
    url: string | null;
}, {
    id: string;
    title: string;
    summary: string | null;
    projectName: string;
    publishedAt: string;
    url: string | null;
}>;
export declare const WorkerAchievementDtoSchema: z.ZodObject<{
    id: z.ZodString;
    workerName: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    completedAt: string;
    description: string | null;
    title: string;
    workerName: string;
}, {
    id: string;
    completedAt: string;
    description: string | null;
    title: string;
    workerName: string;
}>;
export declare const CompanyAnnouncementDtoSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
    publishedAt: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["normal", "high"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    body: string;
    title: string;
    publishedAt: string;
    priority: "high" | "normal";
}, {
    id: string;
    body: string;
    title: string;
    publishedAt: string;
    priority?: "high" | "normal" | undefined;
}>;
export declare const QuickActionDtoSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    href: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    href: string;
    icon?: string | undefined;
}, {
    id: string;
    label: string;
    href: string;
    icon?: string | undefined;
}>;
export declare const HomepageFeedPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>;
        title: z.ZodString;
        summary: z.ZodNullable<z.ZodString>;
        imageUrl: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
        publishedAt: z.ZodString;
        rankScore: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        metadata?: Record<string, unknown> | null | undefined;
    }, {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        metadata?: Record<string, unknown> | null | undefined;
    }>, "many">;
    nextCursor: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        metadata?: Record<string, unknown> | null | undefined;
    }[];
    nextCursor: string | null;
}, {
    items: {
        id: string;
        source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
        title: string;
        summary: string | null;
        publishedAt: string;
        imageUrl: string | null;
        url: string | null;
        rankScore: number;
        metadata?: Record<string, unknown> | null | undefined;
    }[];
    nextCursor: string | null;
}>;
export declare const HomepagePayloadSchema: z.ZodObject<{
    hubRole: z.ZodEnum<["WORKER", "SUPERVISOR", "COMPANY_ADMIN", "UNION_HALL"]>;
    sections: z.ZodArray<z.ZodEnum<["feed", "quickActions", "trending", "weather", "jobs", "safetyBlog", "projectUpdates", "achievements", "announcements"]>, "many">;
    feed: z.ZodObject<{
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodEnum<["VERA_CORE_TRAINING", "TRAINING_EXPIRY", "VERA_CORE_PROJECT", "VERA_CORE_EQUIPMENT", "JOB_BOARD", "SAFETY_BLOG", "COMPANY_ANNOUNCEMENT", "WORKER_ACHIEVEMENT", "WORKER_VERIFICATION", "EXPERT_ANSWER", "UNION_DISPATCH", "SYSTEM"]>;
            title: z.ZodString;
            summary: z.ZodNullable<z.ZodString>;
            imageUrl: z.ZodNullable<z.ZodString>;
            url: z.ZodNullable<z.ZodString>;
            publishedAt: z.ZodString;
            rankScore: z.ZodNumber;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
            title: string;
            summary: string | null;
            publishedAt: string;
            imageUrl: string | null;
            url: string | null;
            rankScore: number;
            metadata?: Record<string, unknown> | null | undefined;
        }, {
            id: string;
            source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
            title: string;
            summary: string | null;
            publishedAt: string;
            imageUrl: string | null;
            url: string | null;
            rankScore: number;
            metadata?: Record<string, unknown> | null | undefined;
        }>, "many">;
        nextCursor: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        items: {
            id: string;
            source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
            title: string;
            summary: string | null;
            publishedAt: string;
            imageUrl: string | null;
            url: string | null;
            rankScore: number;
            metadata?: Record<string, unknown> | null | undefined;
        }[];
        nextCursor: string | null;
    }, {
        items: {
            id: string;
            source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
            title: string;
            summary: string | null;
            publishedAt: string;
            imageUrl: string | null;
            url: string | null;
            rankScore: number;
            metadata?: Record<string, unknown> | null | undefined;
        }[];
        nextCursor: string | null;
    }>;
    quickActions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        href: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        href: string;
        icon?: string | undefined;
    }, {
        id: string;
        label: string;
        href: string;
        icon?: string | undefined;
    }>, "many">;
    trendingTopics: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        category: z.ZodString;
        viewCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        category: string;
        description: string | null;
        title: string;
        slug: string;
        viewCount: number;
    }, {
        id: string;
        category: string;
        description: string | null;
        title: string;
        slug: string;
        viewCount: number;
    }>, "many">;
    weather: z.ZodObject<{
        region: z.ZodString;
        summary: z.ZodString;
        temperatureC: z.ZodNullable<z.ZodNumber>;
        conditions: z.ZodString;
        alerts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            region: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            severity: z.ZodEnum<["INFO", "WATCH", "WARNING", "EMERGENCY"]>;
            hazardType: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            title: string;
            severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
            region: string;
            hazardType: string | null;
            startsAt: string;
            endsAt: string | null;
        }, {
            id: string;
            description: string;
            title: string;
            severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
            region: string;
            hazardType: string | null;
            startsAt: string;
            endsAt: string | null;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        region: string;
        temperatureC: number | null;
        conditions: string;
        alerts: {
            id: string;
            description: string;
            title: string;
            severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
            region: string;
            hazardType: string | null;
            startsAt: string;
            endsAt: string | null;
        }[];
    }, {
        summary: string;
        region: string;
        temperatureC: number | null;
        conditions: string;
        alerts: {
            id: string;
            description: string;
            title: string;
            severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
            region: string;
            hazardType: string | null;
            startsAt: string;
            endsAt: string | null;
        }[];
    }>;
    jobPreview: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        companyName: z.ZodString;
        location: z.ZodNullable<z.ZodString>;
        trade: z.ZodNullable<z.ZodString>;
        payRange: z.ZodNullable<z.ZodString>;
        summary: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
        publishedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        url: string | null;
        payRange: string | null;
    }, {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        url: string | null;
        payRange: string | null;
    }>, "many">;
    safetyBlogPreview: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        title: z.ZodString;
        excerpt: z.ZodNullable<z.ZodString>;
        authorName: z.ZodNullable<z.ZodString>;
        imageUrl: z.ZodNullable<z.ZodString>;
        category: z.ZodString;
        readMinutes: z.ZodNumber;
        publishedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        category: string;
        title: string;
        publishedAt: string;
        imageUrl: string | null;
        slug: string;
        excerpt: string | null;
        authorName: string | null;
        readMinutes: number;
    }, {
        id: string;
        category: string;
        title: string;
        publishedAt: string;
        imageUrl: string | null;
        slug: string;
        excerpt: string | null;
        authorName: string | null;
        readMinutes: number;
    }>, "many">;
    projectUpdates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        projectName: z.ZodString;
        title: z.ZodString;
        summary: z.ZodNullable<z.ZodString>;
        publishedAt: z.ZodString;
        url: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        summary: string | null;
        projectName: string;
        publishedAt: string;
        url: string | null;
    }, {
        id: string;
        title: string;
        summary: string | null;
        projectName: string;
        publishedAt: string;
        url: string | null;
    }>, "many">;
    achievements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workerName: z.ZodString;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        completedAt: string;
        description: string | null;
        title: string;
        workerName: string;
    }, {
        id: string;
        completedAt: string;
        description: string | null;
        title: string;
        workerName: string;
    }>, "many">;
    announcements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        body: z.ZodString;
        publishedAt: z.ZodString;
        priority: z.ZodDefault<z.ZodEnum<["normal", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        body: string;
        title: string;
        publishedAt: string;
        priority: "high" | "normal";
    }, {
        id: string;
        body: string;
        title: string;
        publishedAt: string;
        priority?: "high" | "normal" | undefined;
    }>, "many">;
    cachedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    feed: {
        items: {
            id: string;
            source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
            title: string;
            summary: string | null;
            publishedAt: string;
            imageUrl: string | null;
            url: string | null;
            rankScore: number;
            metadata?: Record<string, unknown> | null | undefined;
        }[];
        nextCursor: string | null;
    };
    quickActions: {
        id: string;
        label: string;
        href: string;
        icon?: string | undefined;
    }[];
    weather: {
        summary: string;
        region: string;
        temperatureC: number | null;
        conditions: string;
        alerts: {
            id: string;
            description: string;
            title: string;
            severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
            region: string;
            hazardType: string | null;
            startsAt: string;
            endsAt: string | null;
        }[];
    };
    projectUpdates: {
        id: string;
        title: string;
        summary: string | null;
        projectName: string;
        publishedAt: string;
        url: string | null;
    }[];
    achievements: {
        id: string;
        completedAt: string;
        description: string | null;
        title: string;
        workerName: string;
    }[];
    announcements: {
        id: string;
        body: string;
        title: string;
        publishedAt: string;
        priority: "high" | "normal";
    }[];
    hubRole: "COMPANY_ADMIN" | "SUPERVISOR" | "WORKER" | "UNION_HALL";
    sections: ("feed" | "quickActions" | "trending" | "weather" | "jobs" | "safetyBlog" | "projectUpdates" | "achievements" | "announcements")[];
    trendingTopics: {
        id: string;
        category: string;
        description: string | null;
        title: string;
        slug: string;
        viewCount: number;
    }[];
    jobPreview: {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        url: string | null;
        payRange: string | null;
    }[];
    safetyBlogPreview: {
        id: string;
        category: string;
        title: string;
        publishedAt: string;
        imageUrl: string | null;
        slug: string;
        excerpt: string | null;
        authorName: string | null;
        readMinutes: number;
    }[];
    cachedAt: string;
}, {
    feed: {
        items: {
            id: string;
            source: "VERA_CORE_TRAINING" | "TRAINING_EXPIRY" | "VERA_CORE_PROJECT" | "VERA_CORE_EQUIPMENT" | "JOB_BOARD" | "SAFETY_BLOG" | "COMPANY_ANNOUNCEMENT" | "WORKER_ACHIEVEMENT" | "WORKER_VERIFICATION" | "EXPERT_ANSWER" | "UNION_DISPATCH" | "SYSTEM";
            title: string;
            summary: string | null;
            publishedAt: string;
            imageUrl: string | null;
            url: string | null;
            rankScore: number;
            metadata?: Record<string, unknown> | null | undefined;
        }[];
        nextCursor: string | null;
    };
    quickActions: {
        id: string;
        label: string;
        href: string;
        icon?: string | undefined;
    }[];
    weather: {
        summary: string;
        region: string;
        temperatureC: number | null;
        conditions: string;
        alerts: {
            id: string;
            description: string;
            title: string;
            severity: "EMERGENCY" | "INFO" | "WATCH" | "WARNING";
            region: string;
            hazardType: string | null;
            startsAt: string;
            endsAt: string | null;
        }[];
    };
    projectUpdates: {
        id: string;
        title: string;
        summary: string | null;
        projectName: string;
        publishedAt: string;
        url: string | null;
    }[];
    achievements: {
        id: string;
        completedAt: string;
        description: string | null;
        title: string;
        workerName: string;
    }[];
    announcements: {
        id: string;
        body: string;
        title: string;
        publishedAt: string;
        priority?: "high" | "normal" | undefined;
    }[];
    hubRole: "COMPANY_ADMIN" | "SUPERVISOR" | "WORKER" | "UNION_HALL";
    sections: ("feed" | "quickActions" | "trending" | "weather" | "jobs" | "safetyBlog" | "projectUpdates" | "achievements" | "announcements")[];
    trendingTopics: {
        id: string;
        category: string;
        description: string | null;
        title: string;
        slug: string;
        viewCount: number;
    }[];
    jobPreview: {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        url: string | null;
        payRange: string | null;
    }[];
    safetyBlogPreview: {
        id: string;
        category: string;
        title: string;
        publishedAt: string;
        imageUrl: string | null;
        slug: string;
        excerpt: string | null;
        authorName: string | null;
        readMinutes: number;
    }[];
    cachedAt: string;
}>;
export type FeedSource = z.infer<typeof FeedSourceSchema>;
export type HubHomepageRole = z.infer<typeof HubHomepageRoleSchema>;
export type HubSection = z.infer<typeof HubSectionSchema>;
export type HomepagePayload = z.infer<typeof HomepagePayloadSchema>;
export type FeedItemDto = z.infer<typeof FeedItemDtoSchema>;
export type TrendingTopicDto = z.infer<typeof TrendingTopicDtoSchema>;
export type WeatherSnapshotDto = z.infer<typeof WeatherSnapshotDtoSchema>;
export type JobPostDto = z.infer<typeof JobPostDtoSchema>;
export type SafetyArticleDto = z.infer<typeof SafetyArticleDtoSchema>;
export type ProjectUpdateDto = z.infer<typeof ProjectUpdateDtoSchema>;
export type WorkerAchievementDto = z.infer<typeof WorkerAchievementDtoSchema>;
export type CompanyAnnouncementDto = z.infer<typeof CompanyAnnouncementDtoSchema>;
export type QuickActionDto = z.infer<typeof QuickActionDtoSchema>;
