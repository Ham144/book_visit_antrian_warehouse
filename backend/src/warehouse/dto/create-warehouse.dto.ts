import { IsArray, IsBoolean, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name: string;
  @IsString()
  location: string;

  @IsString()
  description: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @IsString({ each: true })
  members: string[];
}
