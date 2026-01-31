import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { updateGlobalSettingDto } from './dto/update-global-setting.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GlobalSettingService {
    constructor(private readonly prismaService: PrismaService) {}
    
    async getGlobalSetting() {
        const data =  await this.prismaService.globalsetting.findFirst();
        return plainToInstance(updateGlobalSettingDto, data, {
            excludeExtraneousValues: true
        })
    }

    async updateGlobalSetting(payload: updateGlobalSettingDto) {
        const {settingName} = payload

         await this.prismaService.globalsetting.findFirst({
            where: {
                settingName: settingName
            }
        })
        return {
            message: "Global Setting Updated Successfully",
        }
    }
}
