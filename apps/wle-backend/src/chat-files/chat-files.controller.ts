import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatFilesService } from './chat-files.service';

@Controller('chat-files')
export class ChatFilesController {
  constructor(private readonly files: ChatFilesService) {}

  @Post()
  attach(
    @Body()
    body: {
      messageId: number;
      url: string;
      type: string;
    },
  ) {
    return this.files.attachFile(body.messageId, body.url, body.type);
  }

  @Get(':messageId')
  getFiles(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.files.getFiles(messageId);
  }
}
