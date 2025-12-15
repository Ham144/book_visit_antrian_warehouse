import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ResponseVendorDto } from './dto/response-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const vendors = await this.prismaService.vendor.findMany();

    return plainToInstance(ResponseVendorDto, vendors, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(name: string) {
    const vendor = await this.prismaService.vendor.findUnique({
      where: {
        name: name,
      },
      include: {
        members: {
          select: {
            username: true,
            displayName: true,
            description: true,
            mail: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    return plainToInstance(ResponseVendorDto, vendor, {
      excludeExtraneousValues: true,
    });
  }
}
