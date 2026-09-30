export interface AuthJwtPayload {
    user_id: string;
    company_id: string;
    email?: string;
    roles?: string[];
    exp?: number;
}
export type AuthMode = 'none' | 'public' | 'optional' | 'required';
export interface RbacRouteConfig {
    resource: string;
}
export interface RouteDefinitionJson {
    id: string;
    prefix: string;
    targetEnv: string;
    target?: string;
    pathRewrite?: Record<string, string>;
    auth: AuthMode;
    publicPaths?: string[];
    companyScope?: boolean;
    rbac?: RbacRouteConfig | false;
}
export interface ResolvedRoute {
    id: string;
    prefix: string;
    target: string;
    pathRewrite?: Record<string, string>;
    auth: AuthMode;
    publicPaths: RegExp[];
    companyScope: boolean;
    rbac?: RbacRouteConfig;
}
export interface NormalizedErrorBody {
    error: string;
    code: string;
    requestId?: string;
    details?: unknown;
}
