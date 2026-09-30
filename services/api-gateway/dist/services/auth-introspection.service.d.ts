import type { AuthJwtPayload } from '../types';
export declare const authIntrospection: {
    validateToken(token: string): Promise<AuthJwtPayload>;
    introspectRemote(token: string): Promise<AuthJwtPayload>;
};
