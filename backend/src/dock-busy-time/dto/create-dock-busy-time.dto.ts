import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDockBusyTimeDto {
  @IsString()
  @IsNotEmpty()
  dockId: string;
  @IsNotEmpty()
  @IsDate()
  from: Date;
  @IsDate()
  @IsNotEmpty()
  to: Date;
  @IsString()
  @IsOptional()
  reason?: string;
  @IsNotEmpty()
  createdAt: Date;
}
