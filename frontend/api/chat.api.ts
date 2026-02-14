import axiosInstance from "@/lib/axios";
import { UserApp, UserInfo } from "@/types/auth";
import { IChat } from "@/types/chat.type";

export const ChatApi = {
  lastMessageList: async (searchQuery: string) => {
    const searchParams = new URLSearchParams();
    if (searchQuery) {
      searchParams.set("searchKey", searchQuery);
    }
    const res = await axiosInstance.get("/api/chat/last", {
      params: searchParams,
    });
    //reduce total unreadMessages
    return res.data;
  },
  sendMessage: async (
    message: string,
    recipientId: string,
    userInfo: UserApp | UserInfo,
    selectedRecipient: string
  ) => {
    if (!selectedRecipient || !userInfo) return null;
    const payload: IChat = {
      createdAt: new Date(),
      message: message,
      senderId: userInfo.username,
      recipientId: recipientId,
    };

    const res = await axiosInstance.post("/api/chat/send", payload);
    return res.data;
  },
  getHistory: async (selectedRoomId: string, lastMessageLimit: number) => {
    if (!selectedRoomId) return [];
    const params = new URLSearchParams();
    if (lastMessageLimit)
      params.set("lastMessageLimit", lastMessageLimit.toString());
    const res = await axiosInstance.get(`/api/chat/history/${selectedRoomId}`, {
      params,
    });
    return res.data;
  },
  readAllMessage: async (roomId: string, recentMessageSeen: Date) => {
    const res = await axiosInstance.post("/api/chat/read-all", {
      roomId,
      recentMessageSeen,
    });
    return res.data;
  },
  getRoomId: async (recipientId: string) => {
    if (!recipientId) return;
    const res = await axiosInstance.get("/api/chat/get-room-id/" + recipientId);
    return res.data;
  },

  deleteMessages: async (
    chatIds: string[],
    roomId: string,
    recipientId: string
  ) => {
    const res = await axiosInstance.delete("/api/chat/selected", {
      data: {
        chatIds,
        roomId,
        recipientId,
      },
    });
    return res.data;
  },
};
