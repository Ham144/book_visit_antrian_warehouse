import { PartialType } from '@nestjs/mapped-types';
import { CreateBusyTimeDto } from './create-busy-time.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBusyTimeDto extends PartialType(CreateBusyTimeDto) {
  @IsNotEmpty()
  @IsString()
  id: string;
}
