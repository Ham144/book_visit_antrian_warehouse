import { Expose } from "class-transformer";

export class ChatResponseDto {
    @Expose()
    @Expose()
    id: string;
    roomId: string;
    @Expose()
    senderId: string;
    @Expose()
    message: string;
    @Expose()
    createdAt: Date;
}