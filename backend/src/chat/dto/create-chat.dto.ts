import { IsString } from "class-validator";

export class CreateChatDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;

  @IsString()
  message: string;
}

