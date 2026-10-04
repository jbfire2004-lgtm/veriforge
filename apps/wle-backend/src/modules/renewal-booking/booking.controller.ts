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
import { API_V1_PREFIX } from '../../config/routes';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { BookRenewalDto } from './dto/book-renewal.dto';
import { ConfirmVendorBookingDto } from './dto/confirm-vendor-booking.dto';
import { BookingAggregatorService } from './services/booking-aggregator.service';
import { BookingWorkflowService } from './services/booking-workflow.service';

@Controller(API_V1_PREFIX)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.COMPANY_ADMIN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.TRAINING_PROVIDER_ADMIN,
)
export class BookingController {
  constructor(
    private readonly aggregator: BookingAggregatorService,
    private readonly workflow: BookingWorkflowService,
  ) {}

  @Get('renewals/:workerId')
  getRenewals(@Param('workerId') workerId: string) {
    return this.aggregator.getRenewalOptionsForWorker(workerId);
  }

  @Get('vendors/:certType/availability')
  getVendorAvailability(
    @Param('certType') certType: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.aggregator.getAvailabilityForCertType(certType, workerId);
  }

  @Post('renewals/book')
  bookRenewal(@Body() dto: BookRenewalDto) {
    return this.workflow.bookRenewal(dto);
  }

  @Post('vendors/confirm-booking')
  confirmVendorBooking(@Body() dto: ConfirmVendorBookingDto) {
    return this.workflow.handleVendorConfirmation(dto);
  }
}
