export interface EvaluateParams {
    token: string;
    userId: string;
    companyId: string;
    resource: string;
    action: string;
}
export declare const rbacEvaluation: {
    evaluate(params: EvaluateParams): Promise<{
        allow: boolean;
        reason: string;
    }>;
    evaluateFromRequest(token: string, userId: string, companyId: string, resource: string, method: string): Promise<{
        allow: boolean;
        reason: string;
    }>;
};
