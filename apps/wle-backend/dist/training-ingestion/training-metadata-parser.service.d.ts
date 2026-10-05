import { TrainingIngestRowDto } from './dto/ingest-training-rows.dto';
export type ParsedIngestPayload = {
    rows: TrainingIngestRowDto[];
};
export declare class TrainingMetadataParserService {
    parseFormMetadataString(json: string | undefined): ParsedIngestPayload | null;
    parseJsonFileContent(utf8: string): ParsedIngestPayload;
    normalizePayload(raw: unknown): ParsedIngestPayload;
    tryParseEmbeddedJsonFromText(text: string | null | undefined): ParsedIngestPayload | null;
    private collectBalancedJsonSlices;
    private findMatchingJsonBracketEnd;
    private coerceRow;
    validateRows(rows: TrainingIngestRowDto[]): Promise<string[]>;
    mergePayloads(filePayload: ParsedIngestPayload | null, formPayload: ParsedIngestPayload | null): TrainingIngestRowDto[];
}
