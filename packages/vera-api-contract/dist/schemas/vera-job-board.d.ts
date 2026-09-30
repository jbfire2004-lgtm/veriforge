import { z } from "zod";
export declare const JobBoardExperienceLevelSchema: z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>;
export declare const JobBoardApplicationStatusSchema: z.ZodEnum<["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED", "WITHDRAWN"]>;
export declare const JobBoardJobSummarySchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    companyName: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    locationCity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    locationRegion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    trade: z.ZodNullable<z.ZodString>;
    payRange: z.ZodNullable<z.ZodString>;
    payMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    payMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    payPeriod: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    experienceLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>>;
    summary: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
    ticketNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    projectName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    trade: string | null;
    title: string;
    summary: string | null;
    companyName: string;
    location: string | null;
    publishedAt: string;
    slug: string;
    payRange: string | null;
    projectName?: string | null | undefined;
    locationCity?: string | null | undefined;
    locationRegion?: string | null | undefined;
    payMin?: number | null | undefined;
    payMax?: number | null | undefined;
    payPeriod?: string | null | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
    ticketNames?: string[] | undefined;
}, {
    id: string;
    trade: string | null;
    title: string;
    summary: string | null;
    companyName: string;
    location: string | null;
    publishedAt: string;
    slug: string;
    payRange: string | null;
    projectName?: string | null | undefined;
    locationCity?: string | null | undefined;
    locationRegion?: string | null | undefined;
    payMin?: number | null | undefined;
    payMax?: number | null | undefined;
    payPeriod?: string | null | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
    ticketNames?: string[] | undefined;
}>;
export declare const JobBoardJobDetailSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    title: z.ZodString;
    companyName: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    locationCity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    locationRegion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    trade: z.ZodNullable<z.ZodString>;
    payRange: z.ZodNullable<z.ZodString>;
    payMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    payMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    payPeriod: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    experienceLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>>;
    summary: z.ZodNullable<z.ZodString>;
    publishedAt: z.ZodString;
    ticketNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    projectName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    description: z.ZodNullable<z.ZodString>;
    companyId: z.ZodNullable<z.ZodNumber>;
    projectId: z.ZodNullable<z.ZodNumber>;
    applicationCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    companyId: number | null;
    id: string;
    trade: string | null;
    projectId: number | null;
    description: string | null;
    title: string;
    summary: string | null;
    companyName: string;
    location: string | null;
    publishedAt: string;
    slug: string;
    payRange: string | null;
    projectName?: string | null | undefined;
    locationCity?: string | null | undefined;
    locationRegion?: string | null | undefined;
    payMin?: number | null | undefined;
    payMax?: number | null | undefined;
    payPeriod?: string | null | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
    ticketNames?: string[] | undefined;
    applicationCount?: number | undefined;
}, {
    companyId: number | null;
    id: string;
    trade: string | null;
    projectId: number | null;
    description: string | null;
    title: string;
    summary: string | null;
    companyName: string;
    location: string | null;
    publishedAt: string;
    slug: string;
    payRange: string | null;
    projectName?: string | null | undefined;
    locationCity?: string | null | undefined;
    locationRegion?: string | null | undefined;
    payMin?: number | null | undefined;
    payMax?: number | null | undefined;
    payPeriod?: string | null | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
    ticketNames?: string[] | undefined;
    applicationCount?: number | undefined;
}>;
export declare const JobBoardJobListSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        title: z.ZodString;
        companyName: z.ZodString;
        location: z.ZodNullable<z.ZodString>;
        locationCity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        locationRegion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        trade: z.ZodNullable<z.ZodString>;
        payRange: z.ZodNullable<z.ZodString>;
        payMin: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        payMax: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        payPeriod: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        experienceLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>>;
        summary: z.ZodNullable<z.ZodString>;
        publishedAt: z.ZodString;
        ticketNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        projectName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        slug: string;
        payRange: string | null;
        projectName?: string | null | undefined;
        locationCity?: string | null | undefined;
        locationRegion?: string | null | undefined;
        payMin?: number | null | undefined;
        payMax?: number | null | undefined;
        payPeriod?: string | null | undefined;
        experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
        ticketNames?: string[] | undefined;
    }, {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        slug: string;
        payRange: string | null;
        projectName?: string | null | undefined;
        locationCity?: string | null | undefined;
        locationRegion?: string | null | undefined;
        payMin?: number | null | undefined;
        payMax?: number | null | undefined;
        payPeriod?: string | null | undefined;
        experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
        ticketNames?: string[] | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        slug: string;
        payRange: string | null;
        projectName?: string | null | undefined;
        locationCity?: string | null | undefined;
        locationRegion?: string | null | undefined;
        payMin?: number | null | undefined;
        payMax?: number | null | undefined;
        payPeriod?: string | null | undefined;
        experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
        ticketNames?: string[] | undefined;
    }[];
    total: number;
    page: number;
    pageSize: number;
}, {
    items: {
        id: string;
        trade: string | null;
        title: string;
        summary: string | null;
        companyName: string;
        location: string | null;
        publishedAt: string;
        slug: string;
        payRange: string | null;
        projectName?: string | null | undefined;
        locationCity?: string | null | undefined;
        locationRegion?: string | null | undefined;
        payMin?: number | null | undefined;
        payMax?: number | null | undefined;
        payPeriod?: string | null | undefined;
        experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null | undefined;
        ticketNames?: string[] | undefined;
    }[];
    total: number;
    page: number;
    pageSize: number;
}>;
export declare const JobBoardWorkerSkillSchema: z.ZodObject<{
    skill: z.ZodString;
    level: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    skill: string;
    level: string | null;
}, {
    skill: string;
    level: string | null;
}>;
export declare const JobBoardPortfolioPhotoSchema: z.ZodObject<{
    id: z.ZodString;
    imageUrl: z.ZodString;
    caption: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    imageUrl: string;
    caption: string | null;
}, {
    id: string;
    imageUrl: string;
    caption: string | null;
}>;
export declare const JobBoardWorkHistorySchema: z.ZodObject<{
    id: z.ZodString;
    employer: z.ZodString;
    role: z.ZodString;
    trade: z.ZodNullable<z.ZodString>;
    startDate: z.ZodNullable<z.ZodString>;
    endDate: z.ZodNullable<z.ZodString>;
    description: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    role: string;
    trade: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    employer: string;
}, {
    id: string;
    role: string;
    trade: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    employer: string;
}>;
export declare const JobBoardWorkerEndorsementSchema: z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodString;
    message: z.ZodNullable<z.ZodString>;
    endorserName: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string | null;
    id: string;
    createdAt: string;
    skill: string;
    endorserName: string;
}, {
    message: string | null;
    id: string;
    createdAt: string;
    skill: string;
    endorserName: string;
}>;
export declare const JobBoardWorkerProfileSchema: z.ZodObject<{
    id: z.ZodString;
    workerId: z.ZodNumber;
    displayName: z.ZodString;
    headline: z.ZodNullable<z.ZodString>;
    bio: z.ZodNullable<z.ZodString>;
    primaryTrade: z.ZodNullable<z.ZodString>;
    experienceLevel: z.ZodNullable<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>;
    yearsExperience: z.ZodNullable<z.ZodNumber>;
    locationCity: z.ZodNullable<z.ZodString>;
    locationRegion: z.ZodNullable<z.ZodString>;
    openToWork: z.ZodBoolean;
    skills: z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        level: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        skill: string;
        level: string | null;
    }, {
        skill: string;
        level: string | null;
    }>, "many">;
    portfolio: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        imageUrl: z.ZodString;
        caption: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        imageUrl: string;
        caption: string | null;
    }, {
        id: string;
        imageUrl: string;
        caption: string | null;
    }>, "many">;
    workHistory: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        employer: z.ZodString;
        role: z.ZodString;
        trade: z.ZodNullable<z.ZodString>;
        startDate: z.ZodNullable<z.ZodString>;
        endDate: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: string;
        trade: string | null;
        description: string | null;
        startDate: string | null;
        endDate: string | null;
        employer: string;
    }, {
        id: string;
        role: string;
        trade: string | null;
        description: string | null;
        startDate: string | null;
        endDate: string | null;
        employer: string;
    }>, "many">;
    endorsements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        skill: z.ZodString;
        message: z.ZodNullable<z.ZodString>;
        endorserName: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string | null;
        id: string;
        createdAt: string;
        skill: string;
        endorserName: string;
    }, {
        message: string | null;
        id: string;
        createdAt: string;
        skill: string;
        endorserName: string;
    }>, "many">;
    tickets: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workerId: number;
    displayName: string;
    bio: string | null;
    headline: string | null;
    locationCity: string | null;
    locationRegion: string | null;
    experienceLevel: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null;
    primaryTrade: string | null;
    yearsExperience: number | null;
    openToWork: boolean;
    skills: {
        skill: string;
        level: string | null;
    }[];
    portfolio: {
        id: string;
        imageUrl: string;
        caption: string | null;
    }[];
    workHistory: {
        id: string;
        role: string;
        trade: string | null;
        description: string | null;
        startDate: string | null;
        endDate: string | null;
        employer: string;
    }[];
    endorsements: {
        message: string | null;
        id: string;
        createdAt: string;
        skill: string;
        endorserName: string;
    }[];
    tickets?: string[] | undefined;
}, {
    id: string;
    workerId: number;
    displayName: string;
    bio: string | null;
    headline: string | null;
    locationCity: string | null;
    locationRegion: string | null;
    experienceLevel: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | null;
    primaryTrade: string | null;
    yearsExperience: number | null;
    openToWork: boolean;
    skills: {
        skill: string;
        level: string | null;
    }[];
    portfolio: {
        id: string;
        imageUrl: string;
        caption: string | null;
    }[];
    workHistory: {
        id: string;
        role: string;
        trade: string | null;
        description: string | null;
        startDate: string | null;
        endDate: string | null;
        employer: string;
    }[];
    endorsements: {
        message: string | null;
        id: string;
        createdAt: string;
        skill: string;
        endorserName: string;
    }[];
    tickets?: string[] | undefined;
}>;
export declare const JobBoardApplicationSchema: z.ZodObject<{
    id: z.ZodString;
    jobId: z.ZodString;
    workerId: z.ZodNumber;
    status: z.ZodEnum<["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED", "WITHDRAWN"]>;
    coverMessage: z.ZodNullable<z.ZodString>;
    chatRoomId: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodString;
    workerName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "REJECTED" | "REVIEWING" | "SHORTLISTED" | "HIRED" | "WITHDRAWN";
    id: string;
    workerId: number;
    createdAt: string;
    jobId: string;
    coverMessage: string | null;
    chatRoomId: number | null;
    workerName?: string | undefined;
}, {
    status: "PENDING" | "REJECTED" | "REVIEWING" | "SHORTLISTED" | "HIRED" | "WITHDRAWN";
    id: string;
    workerId: number;
    createdAt: string;
    jobId: string;
    coverMessage: string | null;
    chatRoomId: number | null;
    workerName?: string | undefined;
}>;
export declare const jobBoardSearchSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    pageSize: z.ZodOptional<z.ZodNumber>;
    trade: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    payMin: z.ZodOptional<z.ZodNumber>;
    payMax: z.ZodOptional<z.ZodNumber>;
    experienceLevel: z.ZodOptional<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>;
    ticket: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
    trade?: string | undefined;
    location?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    payMin?: number | undefined;
    payMax?: number | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | undefined;
    ticket?: string | undefined;
}, {
    q?: string | undefined;
    trade?: string | undefined;
    location?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    payMin?: number | undefined;
    payMax?: number | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | undefined;
    ticket?: string | undefined;
}>;
export declare const createJobPostSchema: z.ZodObject<{
    title: z.ZodString;
    companyName: z.ZodString;
    description: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    locationCity: z.ZodOptional<z.ZodString>;
    locationRegion: z.ZodOptional<z.ZodString>;
    trade: z.ZodOptional<z.ZodString>;
    payMin: z.ZodOptional<z.ZodNumber>;
    payMax: z.ZodOptional<z.ZodNumber>;
    payPeriod: z.ZodOptional<z.ZodString>;
    payRange: z.ZodOptional<z.ZodString>;
    experienceLevel: z.ZodOptional<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>;
    summary: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodOptional<z.ZodNumber>;
    requiredTickets: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expiresAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    companyName: string;
    companyId?: number | undefined;
    trade?: string | undefined;
    projectId?: number | undefined;
    expiresAt?: string | undefined;
    summary?: string | undefined;
    location?: string | undefined;
    payRange?: string | undefined;
    locationCity?: string | undefined;
    locationRegion?: string | undefined;
    payMin?: number | undefined;
    payMax?: number | undefined;
    payPeriod?: string | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | undefined;
    requiredTickets?: string[] | undefined;
}, {
    description: string;
    title: string;
    companyName: string;
    companyId?: number | undefined;
    trade?: string | undefined;
    projectId?: number | undefined;
    expiresAt?: string | undefined;
    summary?: string | undefined;
    location?: string | undefined;
    payRange?: string | undefined;
    locationCity?: string | undefined;
    locationRegion?: string | undefined;
    payMin?: number | undefined;
    payMax?: number | undefined;
    payPeriod?: string | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | undefined;
    requiredTickets?: string[] | undefined;
}>;
export declare const applyToJobSchema: z.ZodObject<{
    jobId: z.ZodString;
    coverMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    coverMessage?: string | undefined;
}, {
    jobId: string;
    coverMessage?: string | undefined;
}>;
export declare const updateApplicationStatusSchema: z.ZodObject<{
    applicationId: z.ZodString;
    status: z.ZodEnum<["PENDING", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED", "WITHDRAWN"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "REJECTED" | "REVIEWING" | "SHORTLISTED" | "HIRED" | "WITHDRAWN";
    applicationId: string;
}, {
    status: "PENDING" | "REJECTED" | "REVIEWING" | "SHORTLISTED" | "HIRED" | "WITHDRAWN";
    applicationId: string;
}>;
export declare const upsertWorkerProfileSchema: z.ZodObject<{
    headline: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    primaryTrade: z.ZodOptional<z.ZodString>;
    experienceLevel: z.ZodOptional<z.ZodEnum<["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"]>>;
    yearsExperience: z.ZodOptional<z.ZodNumber>;
    locationCity: z.ZodOptional<z.ZodString>;
    locationRegion: z.ZodOptional<z.ZodString>;
    openToWork: z.ZodOptional<z.ZodBoolean>;
    skills: z.ZodOptional<z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        level: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        skill: string;
        level?: string | undefined;
    }, {
        skill: string;
        level?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    bio?: string | undefined;
    headline?: string | undefined;
    locationCity?: string | undefined;
    locationRegion?: string | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | undefined;
    primaryTrade?: string | undefined;
    yearsExperience?: number | undefined;
    openToWork?: boolean | undefined;
    skills?: {
        skill: string;
        level?: string | undefined;
    }[] | undefined;
}, {
    bio?: string | undefined;
    headline?: string | undefined;
    locationCity?: string | undefined;
    locationRegion?: string | undefined;
    experienceLevel?: "ENTRY" | "INTERMEDIATE" | "JOURNEYMAN" | "FOREMAN" | undefined;
    primaryTrade?: string | undefined;
    yearsExperience?: number | undefined;
    openToWork?: boolean | undefined;
    skills?: {
        skill: string;
        level?: string | undefined;
    }[] | undefined;
}>;
export type JobBoardJobSummary = z.infer<typeof JobBoardJobSummarySchema>;
export type JobBoardJobDetail = z.infer<typeof JobBoardJobDetailSchema>;
export type JobBoardJobList = z.infer<typeof JobBoardJobListSchema>;
export type JobBoardWorkerProfile = z.infer<typeof JobBoardWorkerProfileSchema>;
export type JobBoardApplication = z.infer<typeof JobBoardApplicationSchema>;
