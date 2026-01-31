import { Expose } from "class-transformer";


export class Room {
    id            :String
  createdAt     : String 
  lastMessageAt : String 
}

export class ResponseChatDto  {
    @Expose()
    id        : String
    @Expose()
    roomId    : String
    @Expose()
    senderId  : String   // refer ke User (tidak perlu relasi Prisma kalau sudah kompleks)
    @Expose()
    message   : String
    @Expose()
    status    : String   //read, delivered
    
    @Expose()
    createdAt :String
  
    @Expose()
    room      :Room     
}