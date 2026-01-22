import { Controller, Get, Param, Post, Req, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Authorization } from "src/common/authorization.decorator";
import { Auth } from "src/common/auth.decorator";
import { TokenPayload } from "src/user/dto/token-payload.dto";

@Authorization()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 🧾 WhatsApp home (list chat)
  @Get('last')
  async getLastMessages(
    @Auth() userinfo: TokenPayload,
    @Query('searchKey') searchKey?: string,
  ) {
    return this.chatService.getLastMessages(
      userinfo,
      searchKey,
    );
  }

  // 💬 buka chat
  @Get('history/:roomId')
  async getHistory(
    @Param('roomId') roomId: string,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getHistory(roomId, Number(limit));
  }
}
