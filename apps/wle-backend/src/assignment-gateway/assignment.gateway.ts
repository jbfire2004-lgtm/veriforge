import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({ cors: true })
  export class AssignmentGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;
  
    afterInit() {
      console.log('Assignment WebSocket ready');
    }
  
    broadcastAssignmentUpdate(data: any) {
      this.server.emit('assignment_update', data);
    }
  }
