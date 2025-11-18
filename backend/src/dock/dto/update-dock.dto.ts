import { PartialType } from '@nestjs/mapped-types';
import { CreateDockDto } from './create-dock.dto';
import { IsString } from 'class-validator';

export class UpdateDockDto extends PartialType(CreateDockDto) {
  @IsString()
  id: string;
}
