import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { updateGlobalSettingDto } from './dto/update-global-setting.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseGlobalSettings } from './dto/response-global-setting.dto';

@Injectable()
export class GlobalSettingService {
  constructor(private readonly prismaService: PrismaService) {}

  async getGlobalSetting() {
    const data = await this.prismaService.globalsetting.findFirst();
    return plainToInstance(ResponseGlobalSettings, data, {
      excludeExtraneousValues: true,
      groups: ['detail'],
    });
  }

  async updateGlobalSetting(payload: updateGlobalSettingDto) {
    const { settingName } = payload;

    await this.prismaService.globalsetting.findFirst({
      where: {
        settingName: settingName,
      },
    });
    return {
      message: 'Global Setting Updated Successfully',
    };
  }
}
