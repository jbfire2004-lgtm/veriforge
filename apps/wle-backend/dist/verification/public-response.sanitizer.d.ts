export type PublicCompanyRef = {
    name: string | null;
};
export declare function publicCompanyName(company: {
    id?: number;
    name?: string | null;
} | null | undefined): PublicCompanyRef | null;
export declare function publicTrainingRecord(tr: {
    id: number;
    expiresAt?: Date | null;
    issuedAt?: Date;
    completedAt?: Date | null;
    certificateNumber?: string | null;
    certification?: {
        name?: string;
        code?: string | null;
    } | null;
    courseName?: string | null;
    providerName?: string | null;
}): {
    courseName: string;
    certificationCode: string;
    expiresAt: Date;
    issuedAt: Date;
    completedAt: Date;
    status: string;
};
export declare function publicCredential(c: {
    id: number;
    name?: string | null;
    issuedAt?: Date;
    expiresAt?: Date | null;
    certification?: {
        name?: string;
        code?: string | null;
    } | null;
}): {
    name: string;
    status: string;
    issuedOn: Date;
    expiresOn: Date;
    certificationName: string;
};
export declare function publicEquipmentSummary(eq: {
    id: number;
    name: string;
    safetyStatus?: string;
}): {
    name: string;
    safetyStatus: string;
    isSafe: boolean;
};
export declare function publicWorkerCard(input: {
    qrToken: string | null;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
    companyName?: string | null;
    compliance?: {
        isCompliant?: boolean;
        issues?: unknown[];
    };
    certifications?: ReturnType<typeof publicTrainingRecord>[];
    credentials?: ReturnType<typeof publicCredential>[];
    equipment?: ReturnType<typeof publicEquipmentSummary>[];
}): {
    type: "worker";
    publicRef: string;
    displayName: string;
    photoUrl: string;
    company: {
        name: string;
    };
    compliance: {
        isCompliant: boolean;
        issueCount: number;
    };
    training: {
        courseName: string;
        certificationCode: string;
        expiresAt: Date;
        issuedAt: Date;
        completedAt: Date;
        status: string;
    }[];
    credentials: {
        name: string;
        status: string;
        issuedOn: Date;
        expiresOn: Date;
        certificationName: string;
    }[];
    equipment: {
        name: string;
        safetyStatus: string;
        isSafe: boolean;
    }[];
};
export declare function publicEquipmentCard(input: {
    qrToken: string | null;
    name: string;
    safetyStatus?: string;
    photoUrl?: string | null;
    companyName?: string | null;
    assignedWorkers?: {
        displayName: string;
    }[];
}): {
    type: "equipment";
    publicRef: string;
    name: string;
    safetyStatus: string;
    isSafe: boolean;
    photoUrl: string;
    company: {
        name: string;
    };
    assignedWorkers: {
        displayName: string;
    }[];
};
