import { Injectable } from '@nestjs/common';
import { CreateMoveTraceDto } from './dto/create-move-trace.dto';
import { PrismaService } from 'src/common/prisma.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class MoveTraceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatGateWay: ChatGateway,
  ) {}

  async create(createMoveTraceDto: CreateMoveTraceDto) {
    const moveTrace = await this.prismaService.moveTrace.create({
      data: createMoveTraceDto,
    });

    const booking = await this.prismaService.booking.findUnique({
      where: { id: createMoveTraceDto.bookingId },
      select: { code: true, driverUsername: true, createByUsername: true },
    });
    if (!booking) return { message: 'Success' };

    const recipients = [
      booking.driverUsername,
      booking.createByUsername,
    ].filter(Boolean) as string[];
    const uniqueRecipients = [...new Set(recipients)];
    if (createMoveTraceDto.doer == booking.createByUsername) {
      return {
        message: 'Booking created by the user, no need to send notification',
      };
    }

    const createdAtStr = moveTrace.createdAt.toISOString();
    const message = `
<p style="margin:0 0 6px 0;"><strong>📦 Update Riwayat Booking</strong></p>
<p style="margin:0;">
<b>Keputusan:</b> ${createMoveTraceDto.doer}<br/>
<b>Kode Booking:</b> ${booking.code ?? createMoveTraceDto.bookingId}<br/>
<b>Status:</b> ${createMoveTraceDto.fromStatus} → ${createMoveTraceDto.toStatus}<br/>
<b>Target Tiba:</b> ${new Date(createMoveTraceDto.fromArrivalTime).toLocaleString()} → ${new Date(createMoveTraceDto.toArrivalTime).toLocaleString()}<br/>
<b>Detail:</b> ${createMoveTraceDto.detailMovement ?? '-'}
</p>
<p style="margin-top:8px; font-size:12px; color:#666;">${new Date(createdAtStr).toLocaleString()}</p>
`;

    for (const recipientId of uniqueRecipients) {
      await this.chatGateWay.handleSystemNotification({
        senderId: 'system',
        recipientId,
        message,
      });
    }

    return { message: 'Success' };
  }

  async findAll(id: string) {
    const data = this.prismaService.moveTrace.findMany({
      where: {
        bookingId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    });

    return data;
  }
}
