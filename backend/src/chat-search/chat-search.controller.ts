import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ChatSearchService } from './chat-search.service';

@Controller('chat-search')
export class ChatSearchController {
  constructor(private readonly search: ChatSearchService) {}

  @Get()
  searchMessages(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('q') q: string,
  ) {
    return this.search.search(userId, q);
  }
}
