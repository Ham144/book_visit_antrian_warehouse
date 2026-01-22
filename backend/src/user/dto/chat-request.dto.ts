import { IsString } from "class-validator";

export class ChatRequestDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;

  @IsString()
  message: string;
}
