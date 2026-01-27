'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  MessageCircle, 
  X, 
  Send, 
  Search,
  Image as ImageIcon,
  Mic,
  Smile,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useUserInfo } from '../UserContext';
import axiosInstance from '@/lib/axios';
import { IRoom, IChat, IUserChat } from '@/types/chat.type';
import { BASE_URL } from '@/lib/constant';

// Inisialisasi socket
const socket = io(BASE_URL, {
  transports: ['websocket'],
  autoConnect: false
});

function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { userInfo } = useUserInfo();

  // Query untuk mendapatkan history pesan
  const { data: messages = [], isLoading } = useQuery<IChat[]>({
    queryFn: async () => {
      if (!selectedRoom?.roomId) return [];
      const res = await axiosInstance.get(`/api/chat/history/${selectedRoom.roomId}`);
      return res.data;
    },
    queryKey: ['messages', selectedRoom?.roomId],
    enabled: !!selectedRoom?.roomId
  });

  // Query untuk mendapatkan daftar room
  const { data: rooms = [] } = useQuery<IRoom[]>({
    queryKey: ['rooms', searchQuery],
    queryFn: async () => {
      const searchParams= new URLSearchParams();
      if(searchQuery) {
        searchParams.set('searchKey', searchQuery);
      }
      const res = await axiosInstance.get('/api/chat/last', {
        params: searchParams
      });
      return res.data;
    },
    enabled: !!userInfo
  });

  // Mutation untuk mengirim pesan
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!selectedRoom || !userInfo) return null;
      
      const payload = {
        senderId: userInfo.username,
        receiverId: selectedRoom.recipientId || selectedRoom.roomId,
        message: message
      };
      
      const res = await axiosInstance.post('/api/chat/send', payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data && selectedRoom) {
        // Update cache dengan pesan baru
        queryClient.setQueryData<IChat[]>(
          ['messages', selectedRoom.roomId],
          (old = []) => [...old, data]
        );
        
        // Emit via socket
        socket.emit('send_message', {
          senderId: userInfo?.username,
          receiverId: selectedRoom.recipientId || selectedRoom.roomId,
          message: data.message
        });
        
        setNewMessage('');
        scrollToBottom();
      }
    }
  });

  // Setup socket connection
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to chat server');
      
      // Join room jika ada selectedRoom
      if (selectedRoom?.roomId && userInfo?.username) {
        const roomId = `${userInfo.username}_${selectedRoom.roomId}`;
        socket.emit('join_room', { roomId });
      }
    });

    // Listener untuk pesan baru
    socket.on('receive_message', (message: IChat) => {
      console.log('Received message:', message);
      
      // Update cache dengan pesan baru
      if (selectedRoom?.roomId === message.roomId) {
        queryClient.setQueryData<IChat[]>(
          ['messages', selectedRoom.roomId],
          (old = []) => [...old, message]
        );
      }
      
      // Update unread count jika chat tidak terbuka
      if (!isOpen || selectedRoom?.roomId !== message.roomId) {
        setUnreadCount(prev => prev + 1);
      }
      
      scrollToBottom();
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [selectedRoom?.roomId, isOpen, userInfo?.username]);

  // Join room ketika selectedRoom berubah
  useEffect(() => {
    if (selectedRoom?.roomId && userInfo?.username && socket.connected) {
      const roomId = selectedRoom.roomId;
      socket.emit('join_room', { roomId });
    }
  }, [selectedRoom?.roomId, userInfo?.username]);

  // Hitung total unread messages
  useEffect(() => {
    const totalUnread = rooms.reduce(
      (sum, room) => sum + (room.status !== 'unread' ? 0 : 1),
      0
    );
    setUnreadCount(totalUnread);
  }, [rooms]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen, selectedRoom]);

  if (!userInfo) {
    return null;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'HH:mm', { locale: id });
  };

  const formatMessageTime = (date: Date | string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) {
      return formatTime(date);
    } else if (diffInDays === 1) {
      return 'Kemarin';
    } else if (diffInDays < 7) {
      return format(new Date(date), 'EEEE', { locale: id });
    } else {
      return format(new Date(date), 'dd/MM/yy', { locale: id });
    }
  };

  const handleRoomSelect = (room: IRoom) => {
    setSelectedRoom(room);
    // Reset unread count untuk room yang dipilih
    queryClient.setQueryData<IRoom[]>(['rooms'], (old = []) => 
      old.map(r => 
        r.roomId === room.roomId ? { ...r, unreadCount: 0 } : r
      )
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-6 h-6 px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
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
          {selectedRoom ? (
            <>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-white hover:bg-white/20 rounded-full p-1.5"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                icon
                {selectedRoom.recipient.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold">{selectedRoom.recipient.username}</h3>
                <p className="text-teal-100 text-sm">
                  {selectedRoom.recipient.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Messenger</h3>
                <p className="text-teal-100 text-sm">{rooms.length} percakapan</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {selectedRoom && (
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
              if (selectedRoom) {
                setSelectedRoom(null);
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
        {!selectedRoom ? (
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
            <div className="flex-1 overflow-y-auto min-h-full ">
              <div className="p-2 min-h-full">
                {!rooms.length ? 
                <div className="flex flex-col justify-center items-center p-4 h-full ">
                  <div className="p-2 border rounded-md text-center font-bold  text-white bg-teal-400 badge-neutral">Belum ada Pesan, Cari nama akun yang ingin anda chat</div>
                </div>
                 : rooms.map(room => (
                  <button
                    key={room.roomId}
                    onClick={() => handleRoomSelect(room)}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                  >
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-start">
                        <h5 className="font-semibold text-gray-900 truncate">{room.recipientId}</h5>
                        {room.chats[0].message && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatMessageTime(room.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">
                          {room.chats[0].message || 'Belum ada pesan'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
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
                      <p className="text-lg font-semibold text-gray-700">Belum ada pesan</p>
                      <p className="text-sm">Mulai percakapan dengan {selectedRoom.recipientId}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-50 rounded-full">
                        <span className="text-sm text-gray-600 font-medium">
                          Percakapan dengan {selectedRoom.recipientId}
                        </span>
                      </div>
                    </div>
                    {messages.map((message, index) => {
                      const isUserMessage = message.senderId === userInfo?.username;
                      const showTime = index === messages.length - 1 || 
                        new Date(message.createdAt).getTime() - new Date(messages[index + 1].createdAt).getTime() < -300000;
                      
                      return (
                        <div key={message.id} className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex flex-col max-w-[80%]">
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${isUserMessage
                                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                } shadow-sm`}
                            >
                              {!isUserMessage && (
                                <p className="text-xs font-semibold text-teal-600 mb-1">
                                  {selectedRoom.recipientId}
                                </p>
                              )}
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                            {showTime && (
                              <div className={`text-xs mt-1 px-1 ${isUserMessage ? 'text-right text-gray-500' : 'text-gray-400'}`}>
                                {formatTime(message.createdAt)}
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

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
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
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
                      disabled={sendMessageMutation.isPending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;