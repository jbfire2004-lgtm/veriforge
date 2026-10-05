import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { SdsService } from './sds.service';

const PM_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety/sds`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class SdsController {
  constructor(private readonly sds: SdsService) {}

  @Get('documents')
  list(@Query('companyId') companyId: string, @Query('q') q?: string) {
    return this.sds.listDocuments(parseInt(companyId, 10), q);
  }

  @Post('documents')
  create(
    @Body()
    body: {
      companyId: number;
      productName: string;
      manufacturer?: string;
      casNumbers?: string[];
      hazardClasses?: string[];
      storageKey?: string;
    },
  ) {
    return this.sds.createDocument(body);
  }

  @Get('documents/:id')
  get(@Param('id') id: string) {
    return this.sds.getDocument(id);
  }

  @Post('inventory')
  addInventory(
    @Body()
    body: {
      companyId: number;
      siteId: number;
      sdsDocumentId: string;
      quantity?: number;
      unit?: string;
      locationNote?: string;
    },
  ) {
    return this.sds.addInventoryItem(body);
  }

  @Get('policies')
  listPolicies(@Query('companyId') companyId: string) {
    return this.sds.listPolicies(parseInt(companyId, 10));
  }

  @Post('policies')
  createPolicy(
    @Body()
    body: {
      companyId: number;
      title: string;
      version?: string;
      storageKey?: string;
      category?: string;
    },
  ) {
    return this.sds.createPolicy(body);
  }

  @Post('policies/acknowledge')
  acknowledge(
    @Body()
    body: {
      policyDocumentId: string;
      workerId: number;
      signatureData?: string;
    },
  ) {
    return this.sds.acknowledgePolicy(body);
  }
}
