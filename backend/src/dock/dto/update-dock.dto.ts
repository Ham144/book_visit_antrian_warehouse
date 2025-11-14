import { PartialType } from '@nestjs/mapped-types';
import { CreateDockDto } from './create-dock.dto';

export class UpdateDockDto extends PartialType(CreateDockDto) {}
