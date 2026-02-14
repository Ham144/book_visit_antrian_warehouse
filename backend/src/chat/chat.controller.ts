import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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
    const base = await this.chatService.getLastMessages(userinfo, searchKey);
    const chatRooms = base.chatRooms.map((room) => ({
      ...room,
      isOnline: this.chatGateway.isUserOnline(room.recipientId),
    }));

    return {
      ...base,
      chatRooms,
    };
  }

  // 💬 buka chat
  @Get('history/:roomId')
  async getHistory(
    @Param('roomId') roomId: string,
    @Auth() userinfo: TokenPayload,
    @Query('recipient') recipient?: string,
    @Query('lastMessageLimit') limit = 50,
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
    this.chatGateway.emitMessageToRoom(
      roomId,
      dto.recipientId,
      userinfo.username,
      message,
    );
    return message;
  }

  @Delete('selected')
  async deleteSelectedMessages(
    @Body('chatIds') chatIds: string[],
    @Body('roomId') roomId: string,
    @Body('recipientId') recipientId: string,
    @Auth() userinfo: TokenPayload,
  ) {
    this.chatService.deleteSelectedMessages(chatIds, userinfo);

    await this.chatGateway.emitMessageToRoom(
      roomId,
      recipientId,
      userinfo.username,
      'Berhasil menghapus pesan',
    );

    return {
      message: 'berhasil menghapuas',
      success: true,
    };
  }
  // Di controller - balik urutannya
  @Get('/get-room-id/:recipientId')
  async getRoomId(
    @Auth() userinfo: TokenPayload,
    @Param('recipientId') recipientId: string,
  ) {
    // userinfo.username = user A, recipientId = user B
    return this.chatService.getRoomId(userinfo.username, recipientId);
  }

  @Post('read-all')
  async readAllMessage(
    @Auth() userinfo: TokenPayload,
    @Body('roomId') roomId: string,
    @Body('recentMessageSeen') recentMessageSeen: Date,
  ) {
    return this.chatService.readAllMessage(roomId, recentMessageSeen, userinfo);
  }
}
