import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, number>(); // socketId -> userId

  constructor(private chat: ChatService) {}

  // IDENTIFY USER
  @SubscribeMessage('identify')
  identify(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.onlineUsers.set(client.id, data.userId);

    this.server.emit('presence_update', {
      userId: data.userId,
      status: 'online',
    });
  }

  // DISCONNECT
  handleDisconnect(client: Socket) {
    const userId = this.onlineUsers.get(client.id);
    if (userId) {
      this.onlineUsers.delete(client.id);
      this.server.emit('presence_update', {
        userId,
        status: 'offline',
      });
    }
  }

  // JOIN ROOM
  @SubscribeMessage('join_room')
  joinRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room_${data.roomId}`);
  }

  // SEND MESSAGE
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody()
    data: { roomId: number; senderId: number; content: string },
  ) {
    const msg = await this.chat.sendMessage(
      data.roomId,
      data.senderId,
      data.content,
    );

    this.server.to(`room_${data.roomId}`).emit('new_message', msg);
  }

  // TYPING INDICATOR
  @SubscribeMessage('typing')
  typing(
    @MessageBody()
    data: { roomId: number; userId: number; isTyping: boolean },
  ) {
    this.server.to(`room_${data.roomId}`).emit('typing_update', data);
  }
}
