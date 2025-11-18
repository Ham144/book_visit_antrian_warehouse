import { PartialType } from '@nestjs/mapped-types';
import { CreateDockBusyTimeDto } from './create-dock-busy-time.dto';

export class UpdateDockBusyTimeDto extends PartialType(CreateDockBusyTimeDto) {}
