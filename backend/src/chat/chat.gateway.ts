import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { PrismaService } from 'src/common/prisma.service';
import { ChatStatus } from 'src/common/shared-enum';

@WebSocketGateway()
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // username -> set of socket ids yang sedang join "user:username"
  private readonly userConnections = new Map<string, Set<string>>();
  private readonly socketUser = new Map<string, string>(); // socketId -> username

  constructor(
    private readonly chatService: ChatService,
    private readonly prismaService: PrismaService,
  ) {}

  handleDisconnect(client: any) {
    // cari user mana yang memiliki socket ini
    for (const [username, sockets] of this.userConnections.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);

        if (sockets.size === 0) {
          this.userConnections.delete(username);

          // broadcast offline
          this.server.emit('user_offline', { username });
        }
        break;
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    client.join(`room:${roomId}`);
  }

  @SubscribeMessage('join_list')
  handleJoinList(
    @ConnectedSocket() client: Socket,
    @MessageBody('recipientId') recipientId: string,
  ) {
    const current = this.userConnections.get(recipientId) ?? new Set<string>();
    const wasOffline = current.size === 0;

    current.add(client.id);
    this.userConnections.set(recipientId, current);

    this.socketUser.set(client.id, recipientId);

    client.join(`user:${recipientId}`);

    if (wasOffline) {
      this.server.emit('user_online', { username: recipientId });
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    client.leave(`room:${roomId}`);
  }

  //Tidak perlu lagi karea sudah ada implement handleDisconnect
  // @SubscribeMessage('leave_list')
  // handleLeaveList(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody('recipientId') recipientId: string,
  // ) {
  //   console.log(recipientId, 'trying to leave');
  //   const current = this.userConnections.get(recipientId);
  //   if (current) {
  //     current.delete(client.id);
  //     if (current.size === 0) {
  //       this.userConnections.delete(recipientId);
  //     }
  //   }
  //   client.leave(`user:${recipientId}`);
  // }

  async handleSystemNotification(dto: CreateChatDto) {
    const recipientId = dto.recipientId;
    if (!recipientId) return;
    const message = await this.chatService.sendMessage(dto);
    const roomId = this.chatService.getRoomId('system', recipientId);
    await this.emitMessageToRoom(roomId, recipientId, 'system', message);
  }

  async emitMessageToRoom(
    roomId: string,
    recipientId: string,
    senderId: string,
    message: unknown,
  ) {
    this.server.to(`room:${roomId}`).emit('receive_message', message);

    this.server.to(`user:${recipientId}`).emit('chat_list_update', message);

    this.server.to(`user:${senderId}`).emit('chat_list_update', message);
  }

  isUserOnline(username: string): boolean {
    return this.userConnections.has(username);
  }
}
