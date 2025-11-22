import { PartialType } from '@nestjs/mapped-types';
import { CreateAppUserDto } from './create-user.dto';
import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAppUserDto extends PartialType(CreateAppUserDto) {
  @IsString()
  @IsNotEmpty()
  id: string;
  @Optional()
  createdAt: Date;
  @Optional()
  updatedAt: Date;
}
