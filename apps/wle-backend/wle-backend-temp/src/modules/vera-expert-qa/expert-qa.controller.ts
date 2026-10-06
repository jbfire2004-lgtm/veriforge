import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ExpertQaService } from './expert-qa.service';
import { ExpertProfileService } from './expert-profile.service';

@Controller('api/v1/expert-qa')
export class ExpertQaController {
  constructor(
    private readonly qa: ExpertQaService,
    private readonly experts: ExpertProfileService,
  ) {}

  @Public()
  @Get('questions')
  list(@Query() query: Record<string, string>) {
    return this.qa.listPublic({
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
      trade: query.trade,
      tag: query.tag,
      q: query.q,
      sort: query.sort as 'newest' | 'votes' | 'unanswered' | undefined,
    });
  }

  @Public()
  @Get('questions/:slug')
  get(@Param('slug') slug: string) {
    return this.qa.getBySlug(slug);
  }

  @Public()
  @Get('experts/:userId')
  getExpert(@Param('userId') userId: string) {
    return this.experts.getByUserId(parseInt(userId, 10));
  }

  @Public()
  @Get('sitemap')
  sitemap() {
    return this.qa.sitemapSlugs();
  }

  @UseGuards(JwtAuthGuard)
  @Post('questions')
  ask(
    @Req() req: { user: { id: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.qa.createQuestion(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('answers')
  answer(
    @Req() req: { user: { id: number } },
    @Body() body: { questionId: string; body: string },
  ) {
    return this.qa.createAnswer(req.user.id, body.questionId, body.body);
  }

  @Post('answers/vote')
  @Public()
  vote(
    @Body() body: { answerId: string; value: 1 | -1; voterKey?: string },
    @Req() req: { user?: { id: number }; ip?: string },
  ) {
    const voterKey =
      body.voterKey ??
      (req.user?.id ? `user:${req.user.id}` : `ip:${req.ip ?? 'anon'}`);
    return this.qa.voteAnswer(
      body.answerId,
      body.value,
      voterKey,
      req.user?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('answers/accept')
  accept(
    @Req() req: { user: { id: number } },
    @Body() body: { questionId: string; answerId: string },
  ) {
    return this.qa.acceptAnswer(req.user.id, body.questionId, body.answerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('endorse')
  endorse(
    @Req() req: { user: { id: number } },
    @Body() body: { expertProfileId: string; skill: string; message?: string },
  ) {
    return this.qa.endorseExpert(
      req.user.id,
      body.expertProfileId,
      body.skill,
      body.message,
    );
  }
}
