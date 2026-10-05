import { PrismaService } from '../prisma/prisma.service';
export type ResolvedWorkerRef = {
    workerId: number;
    qrToken: string | null;
    viaToken: boolean;
};
export type ResolvedEquipmentRef = {
    equipmentId: number;
    qrToken: string | null;
    viaToken: boolean;
};
export declare class PublicTokenResolver {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveWorkerRef(ref: string): Promise<ResolvedWorkerRef>;
    resolveEquipmentRef(ref: string): Promise<ResolvedEquipmentRef>;
    ensureWorkerToken(workerId: number): Promise<string>;
    ensureEquipmentToken(equipmentId: number): Promise<string>;
}
