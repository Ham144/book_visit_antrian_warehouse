import { PartialType } from '@nestjs/mapped-types';
import { CreateAppUserDto } from './create-user.dto';

export class UpdateAppUserDto extends PartialType(CreateAppUserDto) {}
