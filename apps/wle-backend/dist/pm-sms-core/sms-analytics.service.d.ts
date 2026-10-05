import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class SmsAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    leadingIndicators(companyId: number, projectId?: number): Promise<{
        sclDistribution: Record<string, number>;
        hecaHighEnergyConditionalLoss: number;
        energyControlGaps: Record<string, number>;
        weeklyForecasts: {
            id: string;
            companyId: number;
            projectId: number | null;
            weekStart: Date;
            forecastJson: Prisma.JsonValue;
            alertsJson: Prisma.JsonValue;
            recommendationsJson: Prisma.JsonValue;
            sclBreakdownJson: Prisma.JsonValue;
            hecaHotspotsJson: Prisma.JsonValue;
            energyGapsJson: Prisma.JsonValue;
            modelVersion: number;
            createdAt: Date;
        }[];
    }>;
    saveWeeklyForecast(companyId: number, projectId: number | undefined, forecast: {
        forecastJson: Record<string, unknown>;
        alertsJson?: unknown[];
        recommendationsJson?: unknown[];
        sclBreakdownJson?: Record<string, number>;
        hecaHotspotsJson?: unknown[];
        energyGapsJson?: unknown[];
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        weekStart: Date;
        forecastJson: Prisma.JsonValue;
        alertsJson: Prisma.JsonValue;
        recommendationsJson: Prisma.JsonValue;
        sclBreakdownJson: Prisma.JsonValue;
        hecaHotspotsJson: Prisma.JsonValue;
        energyGapsJson: Prisma.JsonValue;
        modelVersion: number;
        createdAt: Date;
    }>;
    private mergeSclCounts;
}
