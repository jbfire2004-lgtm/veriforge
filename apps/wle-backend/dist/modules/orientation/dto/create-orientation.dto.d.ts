import { OrientationPackageType } from '@prisma/client';
export declare class CreateOrientationDto {
    companyId?: number;
    projectId?: number;
    type: OrientationPackageType;
    title: string;
    languages?: string[];
}
