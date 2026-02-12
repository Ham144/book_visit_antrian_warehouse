export enum ChatStatus {
  READ = "READ",
  DELIVERED = "DELIVERED",
}

export interface IChat {
  recipientId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  id?: string;
  roomId?: string;
  status?: ChatStatus;
  room?: IRoom;
}

export interface IRoom {
  id?: string;
  roomId: string;
  recipientId: string;
  lastMessage?: string | null;
  lastMessageAt?: Date | null;
  createdAt?: Date;
  chats?: IChat[];
  unreadMessages?: number;
}

export interface IUserChat {
  username: string;
  displayName?: string;
  isOnline?: boolean;
}
