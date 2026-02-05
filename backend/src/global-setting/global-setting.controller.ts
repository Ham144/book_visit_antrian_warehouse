import { Controller, Get, Put } from '@nestjs/common';
import { GlobalSettingService } from './global-setting.service';
import { updateGlobalSettingDto } from './dto/update-global-setting.dto';
import { Authorization } from 'src/common/authorization.decorator';

@Controller('global-setting')
export class GlobalSettingController {
  constructor(private readonly globalSettingService: GlobalSettingService) {}

  @Authorization('ADMIN_ORGANIZATION')
  @Get()
  getGlobalSettings() {
    return this.globalSettingService.getGlobalSetting();
  }

  @Authorization('ADMIN_ORGANIZATION')
  @Put()
  updateGlobalSettings(payload: updateGlobalSettingDto) {
    return this.globalSettingService.updateGlobalSetting(payload);
  }
}
