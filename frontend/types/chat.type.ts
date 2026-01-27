

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
    lastMessageAt: null,
    recipient: IUserChat,
    status: string,
    chats: IChat[]
  }

  export interface IUserChat {
    username: string;
    displayName?: string;
    isOnline?: boolean;
  }