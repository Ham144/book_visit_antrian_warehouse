import { IsArray, IsObject, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name: string;
  @IsString()
  location?: string;
  @IsString()
  description?: string;

  @IsString({ each: true })
  members?: string[]; //username

  @IsArray()
  @IsObject({ each: true })
  docks?: [];
}
