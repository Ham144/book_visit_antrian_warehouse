import { Injectable } from '@nestjs/common';
import { CreateMoveTraceDto } from './dto/create-move-trace.dto';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class MoveTraceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMoveTraceDto: CreateMoveTraceDto) {
    await this.prismaService.moveTrace.create({
      data: createMoveTraceDto,
    });
    return {
      message: 'Success',
    };
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
