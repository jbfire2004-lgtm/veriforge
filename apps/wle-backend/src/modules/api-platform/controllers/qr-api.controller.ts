import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { QrApiService } from '../services/qr-api.service';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.qr)
export class QrApiController {
  constructor(private readonly qr: QrApiService) {}

  @Post('scan')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  scan(@Body() body: { qr: string; assumedTarget?: string }) {
    return this.qr.scan(body);
  }
}
