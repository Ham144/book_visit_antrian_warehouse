import { Controller } from '@nestjs/common';
import { GlobalSettingService } from './global-setting.service';

@Controller('global-setting')
export class GlobalSettingController {
    constructor(private readonly globalSettingService: GlobalSettingService) {}

    
}
