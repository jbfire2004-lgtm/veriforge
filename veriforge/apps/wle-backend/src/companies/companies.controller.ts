import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CompaniesService } from './companies.service';
import { CompanyComplianceUiService } from './company-compliance-ui.service';
import { CompanyTrainingComplianceService } from './company-training-compliance.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { STAFF_ROLES } from '../modules/vera-core/roles';

type AuthedRequest = { user: { id: number; role: string } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companyTrainingCompliance: CompanyTrainingComplianceService,
    private readonly companyComplianceUi: CompanyComplianceUiService,
  ) {}

  @Get()
  @Roles(
    ...STAFF_ROLES,
    UserRole.UNION_HALL_ADMIN,
    UserRole.CONTRACTOR_ADMIN,
    UserRole.CONTRACTOR_USER,
  )
  findAll(@Req() req: AuthedRequest) {
    return this.companiesService.findAll(req.user);
  }

  // More specific than `:id` — register first.
  @Get(':id/compliance/overview')
  @Roles(
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  complianceOverview(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthedRequest,
  ) {
    return this.companyComplianceUi.getComplianceOverview(id, req.user);
  }

  @Get(':id/score')
  @Roles(
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  companyScore(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthedRequest,
  ) {
    return this.companyComplianceUi.getCompanyScore(id, req.user);
  }

  @Get(':id/compliance')
  @Roles(
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  compliance(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.companiesService.complianceSummary(id, req.user);
  }

  @Get(':id/training-compliance')
  @Roles(
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  trainingCompliance(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthedRequest,
  ) {
    return this.companyTrainingCompliance.getCompanyDashboard(id, req.user);
  }

  @Get(':id/projects/:projectId/training-compliance')
  @Roles(
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  projectTrainingCompliance(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Req() req: AuthedRequest,
  ) {
    return this.companyTrainingCompliance.getProjectDashboard(
      id,
      projectId,
      req.user,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
    return this.companiesService.findOne(id, req.user);
  }

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.PROJECT_MANAGER,
  )
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.remove(id);
  }
}
