import { SafetyFormType } from '@prisma/client';
export declare function validateFormTypeData(formType: SafetyFormType | null | undefined, data: Record<string, unknown>, partial?: boolean): Array<{
    fieldId: string;
    message: string;
}>;
