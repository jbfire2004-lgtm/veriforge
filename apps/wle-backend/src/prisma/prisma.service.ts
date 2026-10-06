import {
  ForbiddenException,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    this.$use(async (params, next) => {
      if (params.model === 'CredentialLedgerEvent') {
        const blocked = [
          'update',
          'updateMany',
          'delete',
          'deleteMany',
          'upsert',
        ];
        if (blocked.includes(params.action)) {
          throw new ForbiddenException(
            'CredentialLedgerEvent rows are immutable and cannot be modified',
          );
        }
      }
      return next(params);
    });
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
