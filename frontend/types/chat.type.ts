

export interface IChat {
    id: string;
    roomId: string;
    senderId: string;
    message: string;
    createdAt: Date;
  }
  
  export interface IRoom {
    roomId: string,
    recipientId: string,
    lastMessageAt: null
    chats: IChat[]
  }

  export interface IUserChat {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  }