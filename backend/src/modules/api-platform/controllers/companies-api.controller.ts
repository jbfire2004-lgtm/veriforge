import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { COMPANY_ADMIN_ROLES, STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { CompanyApiService } from '../services/company-api.service';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { CompanyScoped } from '../decorators/scoped.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.companies)
export class CompaniesApiController {
  constructor(private readonly companies: CompanyApiService) {}

  @Post()
  @Roles(...COMPANY_ADMIN_ROLES)
  @ApiSuccess()
  create(@Body() body: Record<string, unknown>) {
    return this.companies.create(body);
  }

  @Patch(':id')
  @Roles(...COMPANY_ADMIN_ROLES)
  @ApiSuccess()
  @CompanyScoped('id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.companies.update(id, body);
  }

  @Get(':id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @CompanyScoped('id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.companies.get(id);
  }

  @Get(':id/workers')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @CompanyScoped('id')
  workers(@Param('id', ParseIntPipe) id: number) {
    return this.companies.workers(id);
  }

  @Get(':id/equipment')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @CompanyScoped('id')
  equipment(@Param('id', ParseIntPipe) id: number) {
    return this.companies.equipment(id);
  }

  @Get(':id/compliance')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @CompanyScoped('id')
  compliance(@Param('id', ParseIntPipe) id: number) {
    return this.companies.compliance(id);
  }
}
