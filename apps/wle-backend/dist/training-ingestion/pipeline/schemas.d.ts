import { z } from 'zod';
export declare const IngestRowSchema: z.ZodObject<{
    workerId: z.ZodNumber;
    certificationId: z.ZodOptional<z.ZodNumber>;
    certificationCode: z.ZodOptional<z.ZodString>;
    certificationName: z.ZodOptional<z.ZodString>;
    issuedAt: z.ZodString;
    expiresAt: z.ZodString;
    providerName: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodNumber>;
    fieldConfidence: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strip>;
export declare const ConfirmIngestBodySchema: z.ZodObject<{
    companyId: z.ZodNumber;
    correlationId: z.ZodOptional<z.ZodString>;
    rows: z.ZodArray<z.ZodObject<{
        workerId: z.ZodNumber;
        certificationId: z.ZodOptional<z.ZodNumber>;
        certificationCode: z.ZodOptional<z.ZodString>;
        certificationName: z.ZodOptional<z.ZodString>;
        issuedAt: z.ZodString;
        expiresAt: z.ZodString;
        providerName: z.ZodOptional<z.ZodString>;
        certificateNumber: z.ZodOptional<z.ZodString>;
        confidence: z.ZodOptional<z.ZodNumber>;
        fieldConfidence: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const QrIngestBodySchema: z.ZodObject<{
    companyId: z.ZodNumber;
    workerId: z.ZodNumber;
    qr: z.ZodString;
}, z.core.$strip>;
export declare const ProviderIngestCompletionSchema: z.ZodObject<{
    workerEmail: z.ZodOptional<z.ZodString>;
    workerPhone: z.ZodOptional<z.ZodString>;
    workerExternalId: z.ZodOptional<z.ZodString>;
    certificationCode: z.ZodOptional<z.ZodString>;
    certificationName: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    issuedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    companyExternalId: z.ZodOptional<z.ZodString>;
    projectExternalId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ProviderIngestBodySchema: z.ZodObject<{
    companyId: z.ZodNumber;
    templateKey: z.ZodDefault<z.ZodString>;
    completions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        workerEmail: z.ZodOptional<z.ZodString>;
        workerPhone: z.ZodOptional<z.ZodString>;
        workerExternalId: z.ZodOptional<z.ZodString>;
        certificationCode: z.ZodOptional<z.ZodString>;
        certificationName: z.ZodOptional<z.ZodString>;
        certificateNumber: z.ZodOptional<z.ZodString>;
        issuedAt: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        companyExternalId: z.ZodOptional<z.ZodString>;
        projectExternalId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ReviewCorrectBodySchema: z.ZodObject<{
    workerId: z.ZodOptional<z.ZodNumber>;
    certificationId: z.ZodOptional<z.ZodNumber>;
    certificationCode: z.ZodOptional<z.ZodString>;
    certificationName: z.ZodOptional<z.ZodString>;
    issuedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    providerName: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ConfirmIngestBody = z.infer<typeof ConfirmIngestBodySchema>;
export type QrIngestBody = z.infer<typeof QrIngestBodySchema>;
export type ProviderIngestBody = z.infer<typeof ProviderIngestBodySchema>;
export type ReviewCorrectBody = z.infer<typeof ReviewCorrectBodySchema>;
