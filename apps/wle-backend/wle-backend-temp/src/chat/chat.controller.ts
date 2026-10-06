import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';
  import { ChatService } from './chat.service';
  
  @Controller('chat')
  export class ChatController {
    constructor(private readonly chat: ChatService) {}
  
    @Post('direct')
    getOrCreateDirect(
      @Body() body: { userA: number; userB: number },
    ) {
      return this.chat.getOrCreateDirectRoom(body.userA, body.userB);
    }
  
    @Post('group')
    createGroup(
      @Body() body: { name: string; memberIds: number[] },
    ) {
      return this.chat.createGroupRoom(body.name, body.memberIds);
    }
  
    @Post('message')
    sendMessage(
      @Body()
      body: { roomId: number; senderId: number; content: string },
    ) {
      return this.chat.sendMessage(body.roomId, body.senderId, body.content);
    }
  
    @Get('messages/:roomId')
    getMessages(@Param('roomId', ParseIntPipe) roomId: number) {
      return this.chat.getMessages(roomId);
    }
  
    @Post('read')
    markRead(
      @Body() body: { messageId: number; userId: number },
    ) {
      return this.chat.markRead(body.messageId, body.userId);
    }
  
    @Get('rooms/:userId')
    listRooms(@Param('userId', ParseIntPipe) userId: number) {
      return this.chat.listRooms(userId);
    }
  }
  