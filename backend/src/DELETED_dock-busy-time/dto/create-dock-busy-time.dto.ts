import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDockBusyTimeDto {
  @IsString()
  @IsNotEmpty()
  dockId: string;
  @IsNotEmpty()
  @IsDate()
  from: string;
  @IsDate()
  @IsNotEmpty()
  to: string;
  @IsString()
  @IsOptional()
  reason?: string;
  @IsNotEmpty()
  createdAt: Date;
}
