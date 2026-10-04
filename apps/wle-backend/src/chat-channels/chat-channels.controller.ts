import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatChannelsService } from './chat-channels.service';

@Controller('chat-channels')
export class ChatChannelsController {
  constructor(private readonly channels: ChatChannelsService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.channels.createChannel(body.name);
  }

  @Get()
  list() {
    return this.channels.listChannels();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.channels.getChannel(slug);
  }
}
