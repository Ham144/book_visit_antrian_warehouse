import { Expose } from 'class-transformer';

export class ChatResponseDto {
  @Expose()
  id: string;
  @Expose()
  roomId: string;
  @Expose()
  senderId: string;
  @Expose()
  message: string;
  @Expose()
  status?: string;
  @Expose()
  createdAt: Date;
}
