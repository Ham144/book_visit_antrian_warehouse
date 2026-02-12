import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    client.join(roomId);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(@MessageBody() dto: CreateChatDto) {
    const message = await this.chatService.sendMessage(dto);
    const roomId = this.chatService.getRoomId(dto.senderId, dto.recipientId);
    this.server.to(roomId).emit('receive_message', message);
    return message;
  }

  async handleSystemNotification(dto: CreateChatDto) {
    const recipientId = dto.recipientId;
    if (!recipientId) return;
    const message = await this.chatService.sendMessage(dto);
    const roomId = this.chatService.getRoomId('system', recipientId);
    this.server.to(roomId).emit('receive_message', message);
  }

  emitMessageToRoom(roomId: string, message: unknown) {
    this.server.to(roomId).emit('receive_message', message);
  }
}
