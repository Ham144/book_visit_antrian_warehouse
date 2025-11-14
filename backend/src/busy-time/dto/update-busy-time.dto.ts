import { PartialType } from '@nestjs/mapped-types';
import { CreateBusyTimeDto } from './create-busy-time.dto';

export class UpdateBusyTimeDto extends PartialType(CreateBusyTimeDto) {}
