import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FeedbackRequestStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';

type AuthReq = {
  user: { id: number; companyId?: number | null; role: UserRole };
};

@Controller('api/v1/feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  create(@Req() req: AuthReq, @Body() body: CreateFeedbackDto) {
    return this.feedback.create({
      title: body.title,
      description: body.description,
      category: body.category ?? 'general',
      companyId: body.companyId ?? req.user.companyId ?? null,
      userId: req.user.id,
    });
  }

  @Get()
  list(
    @Req() req: AuthReq,
    @Query('category') category?: string,
    @Query('status') status?: FeedbackRequestStatus,
    @Query('sort') sort?: 'upvotes' | 'newest',
  ) {
    const companyId =
      req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN
        ? undefined
        : req.user.companyId ?? undefined;
    return this.feedback.list({
      category,
      status,
      sort: sort ?? 'upvotes',
      companyId: companyId ?? undefined,
    });
  }

  @Post(':id/vote')
  vote(@Req() req: AuthReq, @Param('id') id: string) {
    return this.feedback.vote(parseInt(id, 10), req.user.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: UpdateFeedbackStatusDto) {
    return this.feedback.updateStatus(
      parseInt(id, 10),
      body.status,
      body.internalNotes,
    );
  }
}
