import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AcpAccessService } from './acp-access.service';
export declare class VeraAccessGuard implements CanActivate {
    private readonly reflector;
    private readonly access;
    constructor(reflector: Reflector, access: AcpAccessService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
