import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
type JwtUser = {
    id: number;
    email?: string;
    role?: string;
};
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    handleRequest<TUser = JwtUser>(err: unknown, user: unknown, info: unknown, context: ExecutionContext, status?: unknown): TUser;
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
}
export {};
