import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  createdAt?: string;
}
