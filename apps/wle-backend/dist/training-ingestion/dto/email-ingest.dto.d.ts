export declare class EmailAttachmentDto {
    filename: string;
    mimeType: string;
    contentBase64: string;
}
export declare class EmailIngestDto {
    companyId: number;
    fromEmail: string;
    subject?: string;
    attachments: EmailAttachmentDto[];
}
