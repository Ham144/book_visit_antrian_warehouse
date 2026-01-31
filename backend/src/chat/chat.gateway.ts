import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Socket, Server } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // 1️⃣ join room
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    client.join(roomId);
  }

  @SubscribeMessage('send_message')
    async handleSendMessage(
    @MessageBody() dto: CreateChatDto,
    ) {
    const message = await this.chatService.sendMessage(dto);

    this.server
        .to(this.chatService.getRoomId(dto.senderId, dto.receiverId))
        .emit('receive_message', message);

    return message;
}
}
