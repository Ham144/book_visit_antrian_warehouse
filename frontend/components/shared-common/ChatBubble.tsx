"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  MessageCircle,
  X,
  Send,
  Search,
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Truck,
  MoreVertical,
  Clock,
  Inbox,
  ChevronRight,
  Bell,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useUserInfo } from "../UserContext";
import axiosInstance from "@/lib/axios";
import { IRoom, IChat } from "@/types/chat.type";
import { BASE_URL } from "@/lib/constant";
import { toast } from "sonner";

const socket = io(BASE_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

export function stripHtmlPreview(html: string | null | undefined): string {
  if (!html) return "";
  const raw = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return raw.length > 80 ? raw.slice(0, 80) + "…" : raw;
}

export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // ignore if autoplay blocked
  }
}

function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(
    null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { userInfo } = useUserInfo();

  // Query untuk mendapatkan history pesan
  const { data: messages = [], isLoading } = useQuery<IChat[]>({
    queryFn: async () => {
      if (!selectedRoomId) return [];
      const res = await axiosInstance.get(
        `/api/chat/history/${selectedRoomId}`
      );
      return res.data;
    },
    queryKey: ["messages", selectedRoomId],
    enabled: !!selectedRoomId,
  });

  // Query untuk mendapatkan daftar room
  const {
    data: { chatRooms: rooms = [], totalUnreadMessages = 0 } = {},
    refetch: refetchList,
  } = useQuery<{
    chatRooms: IRoom[];
    totalUnreadMessages: number;
  }>({
    queryKey: ["rooms", searchQuery],
    queryFn: async () => {
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
    enabled: !!userInfo,
  });

  // Mutation untuk mengirim pesan
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      recipientId,
    }: {
      message: string;
      recipientId: string;
    }) => {
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
    onSuccess: (data) => {
      if (data && selectedRoomId && selectedRecipient) {
        queryClient.setQueryData<IChat[]>(
          ["messages", selectedRoomId],
          (old = []) => [...old, data]
        );
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        setNewMessage("");
        scrollToBottom();
      }
    },
  });

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      if (selectedRoomId && userInfo?.username) {
        socket.emit("join_room", { roomId: selectedRoomId });
      }
    });
    socket.on("receive_message", (message: IChat) => {
      const isFromOthers = message.senderId !== userInfo?.username;
      if (message.roomId && selectedRoomId === message.roomId) {
        queryClient.setQueryData<IChat[]>(
          ["messages", selectedRoomId],
          (old = []) => {
            if (message.id && old.some((m) => m.id === message.id)) return old;
            return [...old, message];
          }
        );
        scrollToBottom();
      }
      if (isFromOthers) {
        playNotificationSound();
      }
    });
    return () => {
      socket.off("connect");
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [selectedRoomId, isOpen, userInfo?.username]);

  useEffect(() => {
    if (selectedRoomId && userInfo?.username && socket.connected) {
      socket.emit("join_room", { roomId: selectedRoomId });
    }
  }, [selectedRoomId, userInfo?.username]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen, selectedRecipient]);

  if (!userInfo) {
    return null;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRecipient) {
      sendMessageMutation.mutate({
        message: newMessage,
        recipientId: selectedRecipient,
      });
    }
  };

  const formatTime = (date: Date | string) => {
    return format(new Date(date), "HH:mm", { locale: id });
  };

  const formatMessageTime = (date: Date | string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 3600 * 24)
    );

    if (diffInDays === 0) {
      return formatTime(date);
    } else if (diffInDays === 1) {
      return "Kemarin";
    } else if (diffInDays < 7) {
      return format(new Date(date), "EEEE", { locale: id });
    } else {
      return format(new Date(date), "dd/MM/yy", { locale: id });
    }
  };

  const handleRoomSelect = (room: IRoom) => {
    setSelectedRecipient(room.recipientId);
    setSelectedRoomId(room.roomId);
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {totalUnreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-6 h-6 px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
            {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
          </span>
        )}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          Buka Messenger
          <div className="absolute top-full right-5 -mt-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-500 to-teal-600">
        <div className="flex items-center space-x-3">
          {selectedRecipient ? (
            <>
              <div className="flex items-center gap-3">
                {/* Back Button */}
                <button
                  onClick={() => {
                    setSelectedRecipient(null);
                    setSelectedRoomId(null);
                    refetchList();
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Kembali ke daftar percakapan"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Avatar/Initial Container */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedRecipient?.charAt(0).toUpperCase() || "U"}
                  </div>

                  {/* Online Status Indicator */}
                  {true && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 ring-1 ring-green-400"></div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {selectedRecipient || "Unknown User"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        true ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`}
                    ></div>
                    <p className="text-teal-100/80 text-sm font-medium">
                      {true ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Additional Actions (optional) */}
                <div className="flex-shrink-0">
                  <button className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Messenger</h3>
                <p className="text-teal-100 text-sm">
                  {rooms.length} percakapan
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {selectedRecipient && (
            <>
              <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (selectedRecipient) {
                setSelectedRecipient(null);
                setSelectedRoomId(null);
              } else {
                setIsOpen(false);
              }
            }}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Minimize"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Daftar Percakapan */}
        {!selectedRecipient ? (
          <div className="w-full flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama admin / supir..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto min-h-full bg-white">
              <div className="p-4 min-h-full">
                {!rooms.length ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-teal-50 rounded-3xl p-8 max-w-sm mx-auto text-center border border-teal-100">
                      <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-200">
                        <Inbox className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        Belum Ada Percakapan
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Cari nama akun yang ingin Anda ajak chat
                        <br />
                        untuk memulai percakapan baru
                      </p>
                      <button
                        onClick={() =>
                          toast.info(
                            "Coba cari akun seseorang di pencarian Messenger"
                          )
                        }
                        className="mt-6 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
                      >
                        Mulai Chat
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rooms.map((room: IRoom) => (
                      <button
                        key={room.roomId}
                        onClick={() => handleRoomSelect(room)}
                        className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 rounded-2xl transition-all duration-200 group border border-transparent hover:border-gray-200"
                      >
                        {/* Avatar dengan Icon */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={`
                w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm
                ${
                  room.recipientId === "system"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-teal-500 to-emerald-600"
                }
              `}
                          >
                            {room.recipientId === "system" ? (
                              <Bell className="w-7 h-7 text-white" />
                            ) : (
                              <User className="w-7 h-7 text-white" />
                            )}
                          </div>

                          {/* Status Online (contoh) */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>

                          {/* Badge Notifikasi */}
                          {room.unreadMessages > 0 && (
                            <div className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center px-1.5 shadow-lg">
                              <span className="text-xs font-bold text-white">
                                {room.unreadMessages > 99
                                  ? "99+"
                                  : room.unreadMessages}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Konten Utama */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900 truncate text-base">
                                {room.recipientId === "system"
                                  ? "Notifikasi Sistem"
                                  : room.recipientId}
                              </h5>
                              {room.recipientId === "system" && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                                  Official
                                </span>
                              )}
                            </div>

                            {room.lastMessageAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {formatMessageTime(room.lastMessageAt)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 max-w-[200px]">
                              <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <p className="text-sm text-gray-600 truncate group-hover:text-gray-900">
                                {room.lastMessage ? (
                                  stripHtmlPreview(room.lastMessage)
                                ) : (
                                  <span className="text-gray-400 italic">
                                    Ketik pesan pertama...
                                  </span>
                                )}
                              </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-all group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-100 to-teal-100 flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-teal-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700">
                        Belum ada pesan
                      </p>
                      <p className="text-sm">
                        {selectedRecipient === "system"
                          ? "Notifikasi booking akan muncul di sini."
                          : `Mulai percakapan dengan ${selectedRecipient}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-50 rounded-full">
                        <span className="text-sm text-gray-600 font-medium">
                          {selectedRecipient === "system"
                            ? "Notifikasi Sistem"
                            : `Percakapan dengan ${selectedRecipient}`}
                        </span>
                      </div>
                    </div>
                    {messages.map((message, index) => {
                      const isUserMessage =
                        message.senderId === userInfo?.username;
                      const showTime =
                        index === messages.length - 1 ||
                        new Date(message.createdAt).getTime() -
                          new Date(messages[index + 1].createdAt).getTime() <
                          -300000;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isUserMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className="flex flex-col max-w-[80%]">
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isUserMessage
                                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none"
                                  : message.senderId === "system"
                                  ? "bg-amber-50 text-gray-900 border border-amber-200 rounded-bl-none shadow-sm"
                                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                              } shadow-sm`}
                            >
                              {!isUserMessage && (
                                <p className="text-xs font-semibold text-teal-600 mb-1">
                                  {message.senderId === "system"
                                    ? "Sistem"
                                    : selectedRecipient}
                                </p>
                              )}
                              {message.senderId === "system" ? (
                                <div
                                  className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-p:first:mt-0 prose-p:last:mb-0"
                                  dangerouslySetInnerHTML={{
                                    __html: message.message,
                                  }}
                                />
                              ) : (
                                <p className="text-sm leading-relaxed">
                                  {message.message}
                                </p>
                              )}
                            </div>
                            {showTime && (
                              <div
                                className={`text-xs mt-1 px-1 flex items-center gap-1 ${
                                  isUserMessage
                                    ? "text-right text-gray-500 justify-end"
                                    : "text-gray-400"
                                }`}
                              >
                                {isUserMessage && message.status && (
                                  <span className="opacity-80">
                                    {message.status === "READ"
                                      ? "Dibaca"
                                      : "Terkirim"}
                                  </span>
                                )}
                                <span>{formatTime(message.createdAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - disembunyikan untuk room sistem */}
              {selectedRecipient !== "system" && (
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-gray-200 bg-white"
                >
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2.5 text-gray-500 hover:text-teal-500 hover:bg-teal-50 rounded-full transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12 italic"
                        disabled={sendMessageMutation.isPending}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        !newMessage.trim() || sendMessageMutation.isPending
                      }
                      className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
