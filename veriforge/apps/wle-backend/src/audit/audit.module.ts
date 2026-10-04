import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogService } from './audit-log.service';
import { AuditController } from './audit.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditLogService, AuditService],
  exports: [AuditLogService, AuditService],
})
export class AuditModule {}
