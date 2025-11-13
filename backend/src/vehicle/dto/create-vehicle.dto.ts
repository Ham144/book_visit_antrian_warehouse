import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  jenisKendaraan: string;

  @IsNotEmpty()
  @IsNumber()
  durasiBongkar: number;

  @IsString()
  description: string;

  @IsBoolean()
  isActive: boolean;
}
