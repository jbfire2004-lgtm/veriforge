import { z } from "zod";
export declare const ReadinessLevelSchema: z.ZodEnum<["low", "medium", "high", "critical"]>;
export type ReadinessLevel = z.infer<typeof ReadinessLevelSchema>;
export type SchedulingScore = {
    score: number;
    level: ReadinessLevel;
    updatedAt: string;
};
export type WorkerScheduleInput = {
    id: string;
    name: string;
    companyId?: string;
    unionHallId?: string;
    projectIds?: string[];
    isCompliant?: boolean;
    expiringTraining?: number;
    competencyGaps?: number;
    readinessScore?: number;
    riskScore?: number;
    safetyRiskScore?: number;
    dispatchStatus?: "available" | "dispatched" | "unavailable";
    skills?: string[];
    hoursThisWeek?: number;
    absenceRisk?: number;
};
export type EquipmentScheduleInput = {
    id: string;
    name: string;
    companyId?: string;
    projectIds?: string[];
    lockedOut?: boolean;
    overdueInspection?: boolean;
    maintenanceDueDays?: number;
    readinessScore?: number;
    competencyGaps?: number;
};
export type ProjectScheduleInput = {
    id: string;
    name: string;
    companyId?: string;
    status?: string;
    requiredWorkers?: number;
    requiredEquipment?: number;
    assignedWorkers?: number;
    assignedEquipment?: number;
    readiness?: number;
    missingTraining?: number;
    startDate?: string;
    endDate?: string;
};
export type DispatchInput = {
    id: string;
    workerId: string;
    unionHallId: string;
    companyId: string;
    projectId?: string;
    dispatchedAt: string;
    recalledAt?: string;
};
export type TrainingForecastInput = {
    workerId: string;
    certificationName: string;
    expiresAt?: string;
    daysUntilExpiry?: number;
};
export type SchedulingContextInput = {
    companyId?: string;
    unionHallId?: string;
    projectId?: string;
    horizonDays?: number;
    offline?: boolean;
    workers?: WorkerScheduleInput[];
    equipment?: EquipmentScheduleInput[];
    projects?: ProjectScheduleInput[];
    dispatches?: DispatchInput[];
    trainingExpiries?: TrainingForecastInput[];
    twinReadiness?: Record<string, number>;
    twinRisk?: Record<string, number>;
    safetyRiskByProject?: Record<string, number>;
};
export type WorkforceForecast = {
    availability: {
        workerId: string;
        probability: number;
        horizonDays: number;
    }[];
    shortages: {
        projectId: string;
        deficit: number;
        message: string;
    }[];
    readiness: {
        workerId: string;
        score: number;
        level: ReadinessLevel;
    }[];
    fatigueRisk: {
        workerId: string;
        score: number;
    }[];
    turnoverRisk: {
        workerId: string;
        probability: number;
    }[];
    recommendations: string[];
};
export type EquipmentForecast = {
    availability: {
        equipmentId: string;
        probability: number;
    }[];
    downtimeRisk: {
        equipmentId: string;
        probability: number;
        reason: string;
    }[];
    shortages: {
        projectId: string;
        deficit: number;
    }[];
    maintenanceForecast: {
        equipmentId: string;
        dueInDays: number;
    }[];
    recommendations: string[];
};
export type TrainingForecast = {
    expiring: {
        workerId: string;
        certification: string;
        daysLeft: number;
    }[];
    gaps: {
        workerId: string;
        gap: string;
    }[];
    demand: {
        certification: string;
        count: number;
    }[];
    recommendedSessions: {
        label: string;
        workerIds: string[];
    }[];
};
export type ProjectStaffingAnalysis = {
    dailyWorkerNeed: {
        projectId: string;
        workers: number;
    }[];
    dailyEquipmentNeed: {
        projectId: string;
        equipment: number;
    }[];
    skillGaps: string[];
    trainingGaps: string[];
    complianceGaps: string[];
    delayRisk: {
        projectId: string;
        probability: number;
        reason: string;
    }[];
    workerAssignments: {
        workerId: string;
        projectId: string;
        score: number;
    }[];
    equipmentAssignments: {
        equipmentId: string;
        projectId: string;
        score: number;
    }[];
    recommendedLevels: {
        projectId: string;
        workers: number;
        equipment: number;
    }[];
};
export type DispatchOptimization = {
    optimizedOrder: {
        dispatchId: string;
        priority: number;
    }[];
    conflicts: {
        code: string;
        message: string;
    }[];
    shortages: string[];
    readinessScores: {
        workerId: string;
        score: number;
    }[];
    recommendations: string[];
};
export type ShiftOptimization = {
    shifts: {
        workerId: string;
        shift: string;
        score: number;
    }[];
    overtimeRisk: {
        workerId: string;
        probability: number;
    }[];
    fatigueAlerts: {
        workerId: string;
        message: string;
    }[];
    conflicts: string[];
    recommendations: string[];
};
export type CrewOptimization = {
    crews: {
        id: string;
        workerIds: string[];
        riskScore: number;
        readinessScore: number;
    }[];
    recommendations: string[];
};
export type ResourceAllocation = {
    workerAllocations: {
        workerId: string;
        projectId: string;
        priority: number;
    }[];
    equipmentAllocations: {
        equipmentId: string;
        projectId: string;
        priority: number;
    }[];
    trainingAllocations: {
        workerId: string;
        action: string;
    }[];
    goals: {
        readiness: number;
        risk: number;
        downtime: number;
        cost: number;
    };
};
export type MultiProjectBalance = {
    conflicts: string[];
    shortages: string[];
    overstaffing: string[];
    rebalanceActions: {
        type: "worker" | "equipment";
        entityId: string;
        fromProject?: string;
        toProject: string;
    }[];
};
export type SchedulingAutomation = {
    scheduleDrafts: string[];
    alerts: string[];
    jhaRecommendations?: string[];
};
export type TwinSchedulingOverlay = {
    worker?: Record<string, {
        schedulingRisk: number;
        availability: number;
        overtimeRisk: number;
    }>;
    equipment?: Record<string, {
        utilization: number;
        downtimeRisk: number;
    }>;
    project?: Record<string, {
        staffingScore: number;
        delayRisk: number;
        workerDeficit: number;
    }>;
};
export type SchedulingDashboardBundle = {
    generatedAt: string;
    workforce: {
        availableCount: number;
        shortageCount: number;
        avgReadiness: number;
    };
    equipment: {
        availableCount: number;
        shortageCount: number;
        downtimeAlerts: number;
    };
    training: {
        expiringCount: number;
        gapCount: number;
    };
    staffing: {
        assignmentCount: number;
        delayRiskCount: number;
    };
    dispatch: {
        conflictCount: number;
        optimizedCount: number;
    };
    shift: {
        overtimeAlerts: number;
        fatigueAlerts: number;
    };
    crew: {
        crewCount: number;
        avgReadiness: number;
    };
    allocation: {
        workerMoves: number;
        equipmentMoves: number;
    };
    balancing: {
        conflictCount: number;
        rebalanceCount: number;
    };
};
export type PredictiveSchedulingReport = {
    generatedAt: string;
    context: SchedulingContextInput;
    workforce: WorkforceForecast;
    equipment: EquipmentForecast;
    training: TrainingForecast;
    staffing: ProjectStaffingAnalysis;
    dispatch: DispatchOptimization;
    shift: ShiftOptimization;
    crew: CrewOptimization;
    allocation: ResourceAllocation;
    balancing: MultiProjectBalance;
    availability: {
        workerId: string;
        date: string;
        available: boolean;
    }[];
    absence: {
        workerId: string;
        probability: number;
        horizonDays: number;
    }[];
    overtime: {
        workerId: string;
        probability: number;
    }[];
    automation: SchedulingAutomation;
    twinOverlay: TwinSchedulingOverlay;
    dashboard: SchedulingDashboardBundle;
};
//# sourceMappingURL=types.d.ts.map