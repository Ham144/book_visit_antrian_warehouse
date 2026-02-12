import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Authorization } from 'src/common/authorization.decorator';
import { Auth } from 'src/common/auth.decorator';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Authorization()
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // 🧾 WhatsApp home (list chat)
  @Get('last')
  async getLastMessages(
    @Auth() userinfo: TokenPayload,
    @Query('searchKey') searchKey?: string,
  ) {
    return this.chatService.getLastMessages(userinfo, searchKey);
  }

  // 💬 buka chat
  @Get('history/:roomId')
  async getHistory(
    @Param('roomId') roomId: string,
    @Auth() userinfo: TokenPayload,
    @Query('recipient') recipient?: string,
    @Query('limit') limit = 50,
  ) {
    const room = recipient
      ? this.chatService.getRoomId(userinfo.username, recipient)
      : roomId;
    return this.chatService.getHistory(room, Number(limit), userinfo);
  }

  @Post('send')
  async sendMessage(
    @Auth() userinfo: TokenPayload,
    @Body() dto: CreateChatDto,
  ) {
    const payload = {
      ...dto,
      senderId: userinfo.username,
    };
    const message = await this.chatService.sendMessage(payload);
    const roomId = this.chatService.getRoomId(
      userinfo.username,
      dto.recipientId ?? '',
    );
    this.chatGateway.emitMessageToRoom(roomId, message);
    return message;
  }
}
