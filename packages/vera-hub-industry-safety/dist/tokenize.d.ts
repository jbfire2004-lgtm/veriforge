export type TokenizeOptions = {
    projectSalt?: string;
    companySalt?: string;
};
/**
 * Tokenize project IDs → `proj_{hex}`
 * Salt is plane-specific so the same numeric id cannot link to a company token.
 */
export declare function tokenizeProjectId(projectId: string | number, salt?: string): string;
/**
 * Tokenize company IDs → `co_{hex}`
 */
export declare function tokenizeCompanyId(companyId: string | number, salt?: string): string;
export declare function tokenizeEntityId(entityType: "project" | "company", id: string | number, options?: TokenizeOptions): string;
export declare function isProjectToken(token: string): boolean;
export declare function isCompanyToken(token: string): boolean;
/** Tokens must never be returned in Hub API responses */
export declare function assertTokenNotInPublicPayload(payload: unknown): void;
