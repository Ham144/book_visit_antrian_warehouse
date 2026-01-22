import { BadRequestException, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import  * as hash from "crypto";
import { PrismaService } from "src/common/prisma.service";
import { ChatResponseDto } from "src/dock/dto/chat-response.dto";
import { ChatRequestDto } from "src/user/dto/chat-request.dto";
import { TokenPayload } from "src/user/dto/token-payload.dto";

@Injectable()
export class ChatService {
    constructor(private readonly prismaService: PrismaService) {}
    
    async sendMessage(
        dto: ChatRequestDto,
      ): Promise<ChatResponseDto> {
        const isreceiverValid = await this.prismaService.user.findFirst({
          where: { username: dto.receiverId },
        });
      
        if (!isreceiverValid) {
          throw new BadRequestException('receiverId tidak valid');
        }
      
        const message = await this.prismaService.chat.create({
          data: {
            senderId: dto.senderId,
            message: dto.message,
            room: {
              connectOrCreate: {
                where: {
                  id: this.getRoomId(dto.senderId, dto.receiverId),
                },
                create: {
                  id: this.getRoomId(dto.senderId, dto.receiverId),
                },
              },
            },
          },
        });
      
        return plainToInstance(ChatResponseDto, message, {
          excludeExtraneousValues: true,
        });
      }
      

  async getHistory(roomId: string, lastMessageLimit: number) {
    const messages = await this.prismaService.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: lastMessageLimit
    });
    return plainToInstance(ChatResponseDto, messages, {
        excludeExtraneousValues: true
    })
  }

  async getLastMessages(userInfo: TokenPayload, searchKeyUser?: string) {
    const rooms = await this.prismaService.room.findMany({
      where: {
        chats: {
          some: { senderId: userInfo.username },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        chats: {
          orderBy: { createdAt: 'desc' },
          take: 2,
        },
      },
    });
  
    const chatRooms = rooms
      .map((room) => {
        const chats = room.chats;
        const other = chats.find(
          (c) => c.senderId !== userInfo.username,
        );
  
        if (!other) return null;
  
        return {
          roomId: room.id,
          recipientId: other.senderId,
          lastMessage: chats[0]?.message ?? null,
          lastMessageAt: room.lastMessageAt,
        };
      })
      .filter(Boolean)
      .filter((r) =>
        searchKeyUser
          ? r.recipientId
              .toLowerCase()
              .includes(searchKeyUser.toLowerCase())
          : true,
      );
  
    // tambah user yang belum pernah chat
    if (searchKeyUser) {
      const users = await this.prismaService.user.findMany({
        where: {
          username: {
            contains: searchKeyUser,
            mode: 'insensitive',
          },
          NOT: {
            username: userInfo.username,
          },
        },
      });
  
      users.forEach((u) => {
        if (
          !chatRooms.find(
            (r) => r.recipientId === u.username,
          )
        ) {
          chatRooms.push({
            roomId: this.getRoomId(userInfo.username, u.username),
            recipientId: u.username,
            lastMessage: null,
            lastMessageAt: null,
          });
        }
      });
    }
    return chatRooms;
  }
  
  
  getRoomId(userA: string, userB: string): string {
    const sortedUsers = [userA, userB].sort();
    return hash.createHash('sha256')
      .update(sortedUsers.join(':'))
      .digest('hex');
  }
  
}
