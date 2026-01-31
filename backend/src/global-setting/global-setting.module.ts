import { Module } from '@nestjs/common';
import { GlobalSettingController } from './global-setting.controller';
import { GlobalSettingService } from './global-setting.service';

@Module({
  controllers: [GlobalSettingController],
  providers: [GlobalSettingService]
})
export class GlobalSettingModule {}
