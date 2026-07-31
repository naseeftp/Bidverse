import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { ConversationDTO, MessageDto } from "../../types/chat.dto";
import chatService from "../../services/chat.service";
import toast from "react-hot-toast";
import { useAppSelector } from "../../hooks/redux.hooks";
import { getSocket } from "../../services/socket.service";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";


interface ChatWorkspaceProps {
  roleTheme: 'user' | 'tenant' | 'admin';
}

const THEME_STYLES = {
  user: {
    accent: "bg-[#1F1F1F]",
    text: "text-[#1F1F1F]",
    bgLight: "bg-[#FFF9F4]",
    activeBubble: "bg-[#1F1F1F] text-white",
    peerBubble: "bg-[#F5F5F5] text-[#1F1F1F] border border-[#E6E0DA]",
    sidebarActive: "bg-[#F5F5F5] border-l-4 border-l-[#1F1F1F]",
  },
  tenant: {
    accent: "bg-[#C9653B]",
    text: "text-[#C9653B]",
    bgLight: "bg-[#FFF9F4]",
    activeBubble: "bg-[#C9653B] text-white",
    peerBubble: "bg-[#F5F5F5] text-[#1F1F1F] border border-[#E6E0DA]",
    sidebarActive: "bg-[#C9653B]/5 border-l-4 border-l-[#C9653B]",
  },
  admin: {
    accent: "bg-[#000000]",
    text: "text-[#000000]",
    bgLight: "bg-[#FAFAFA]",
    activeBubble: "bg-[#000000] text-white",
    peerBubble: "bg-[#EAEAEA] text-[#000000] border border-[#D1D1D1]",
    sidebarActive: "bg-[#EAEAEA] border-l-4 border-l-[#000000]",
  },
};

const EDIT_DELETE_TIME_WINDOW = 15 * 60 * 1000;

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ roleTheme }) => {
  const [conversations, setConversation] = useState<ConversationDTO[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConversationId = searchParams.get('conversationId');
  const [loading, setLoading] = useState<boolean>(true);

  const [typedMessage, setTypedMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, boolean>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [editingMessage, setEditingMessage] = useState<MessageDto | null>(null);
  const [editInputText, setEditInputText] = useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  const isCurrentlytyping = useRef<boolean>(false);
  const isTypingTimeOut = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user } = useAppSelector((state) => state.auth);
  const currentStyle = THEME_STYLES[roleTheme];
  const currentUserId = user?.userId;
  const activeConversation = conversations.find((conv) => conv._id === activeConversationId);
  const activeChatPartner = activeConversation?.participants.find((p) => p.userId !== currentUserId);
  const activePartnerName = activeChatPartner?.name || "Anonymous Operator";

  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
 const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await chatService.markMessageRead(conversationId);
      const socket = getSocket();
      socket.emit('messages:read', { conversationId, userId: currentUserId });
      setConversation((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
      setMessages((prev) =>
        prev.map((m) => {
          if (m.senderId !== currentUserId && !m.readBy?.includes(currentUserId || '')) {
            return { ...m, readBy: [...(m.readBy || []), currentUserId || ''] };
          }
          return m;
        })
      );
    } catch {
      toast.error('failed to markas read')
    }
  }, [currentUserId]);


  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatService.getUserConversations();
        if (response.success && response.data) {
          setConversation(response.data);
        } else {
          toast.error(response.message);
        }
      } catch {
        toast.error('Failed to get conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    const socket = getSocket();
    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await chatService.getMessages(activeConversationId);
        if (response.success && response.data) {
          setMessages(response.data);
          markConversationAsRead(activeConversationId)
        } else {
          toast.error(response.message);
        }
      } catch {
        toast.error('Failed to get chat history');
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
    socket.emit('conversation:join', activeConversationId);

    return () => {
      socket.emit('conversation:leave', activeConversationId);
      if (isTypingTimeOut.current) {
        clearTimeout(isTypingTimeOut.current);
      }
      isCurrentlytyping.current = false;
      setTypingUsers((prev) => {
        const newState = { ...prev };
        delete newState[activeConversationId];
        return newState;
      });
    };
  }, [activeConversationId, user?.userId, user?.role, markConversationAsRead]);

  useEffect(() => {
    const socket = getSocket();
    if (conversations && conversations.length > 0) {
      conversations.forEach((conv) => {
        socket.emit('conversation:join', conv._id);
      });
    }
    const handleRecieveMessage = (newMessage: MessageDto) => {
      if (newMessage.conversationId === activeConversationId) {
        setMessages((prev) => [...prev, newMessage]);
        if (newMessage.senderId !== currentUserId) {
          markConversationAsRead(activeConversationId);
        } else {
          setConversation((prev) =>
            prev.map((c) =>
              c._id === newMessage.conversationId
                ? {
                  ...c,
                  lastMessageSnippet: newMessage.content,
                  updatedAt: new Date(newMessage.createdAt!),
                  unreadCount: (c.unreadCount || 0) + 1,
                }
                : c
            )
          );
        }
      }

    };

    const handleReadStatus = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConversationId && data.userId !== currentUserId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.senderId === currentUserId && !m.readBy?.includes(data.userId)) {
              return { ...m, readBy: [...(m.readBy || []), data.userId] };
            }
            return m;
          })
        );
      }
    }
    socket.emit('users:get_online', (onlineIds: string[]) => {
      setOnlineUsers(new Set(onlineIds));
    });

    const handleConversationUpdated = (data: {
      conversationId: string;
      lastMessageSnippet: string;
      lastMessageAt: string;
      unreadCountMap?: Record<string, number>
    }) => {
      setConversation((prevConversations) => {
        const targetIndex = prevConversations.findIndex(c => c._id === data.conversationId);
        if (targetIndex === -1) return prevConversations;
        const updatedConversations = [...prevConversations];
        const isCurrentActive = data.conversationId === activeConversationId
        const userUnreadCount = data.unreadCountMap && currentUserId
          ? data.unreadCountMap[currentUserId] || 0
          : 0;

        updatedConversations[targetIndex] = {
          ...updatedConversations[targetIndex],
          lastMessageSnippet: data.lastMessageSnippet,
          updatedAt: new Date(data.lastMessageAt),
          unreadCount: isCurrentActive ? 0 : userUnreadCount,  // Don't show unread badge if user is actively viewing this room  
        };
        return updatedConversations.sort((a, b) => {
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });
      });
    };

    const handleTypingStatus = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const roomState = { ...(prev[data.conversationId] || {}) };
        if (data.isTyping) {
          roomState[data.userId] = true;
        } else {
          delete roomState[data.userId];
        }
        return {
          ...prev,
          [data.conversationId]: roomState
        };
      });
    };

    const handleUserStatus = (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.isOnline) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    const handleMessageDeleted = (data: { conversationId: string; messageId: string; isDeletedForEveryone: boolean }) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, content: 'This message was deleted.', isDeletedForEveryone: true }
              : msg
          )
        );
      }
      setConversation((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv._id === data.conversationId) {
            return {
              ...conv,
              lastMessageSnippet: "This message was deleted."
            };
          }
          return conv;
        })

      )
    };

    const handleMessageEdited = (data: {
      conversationId: string;
      messageId: string;
      newContent: string,
      isLastMessage: boolean
    }) => {
      if (data.conversationId === activeConversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === data.messageId ? { ...msg, content: data.newContent } : msg
          )
        )
      }
      if (data.isLastMessage) {
        setConversation((prevConversations) =>
          prevConversations.map((conv) =>
            conv._id === data.conversationId
              ? { ...conv, lastMessageSnippet: data.newContent }
              : conv
          )
        );
      }

    }

    socket.on('message:receive', handleRecieveMessage);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('typing:status', handleTypingStatus);
    socket.on('user:status', handleUserStatus);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:edited', handleMessageEdited)
    socket.on('messages:read', handleReadStatus)

    return () => {
      socket.off('message:receive', handleRecieveMessage);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('typing:status', handleTypingStatus);
      socket.off('user:status', handleUserStatus);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:edited', handleMessageEdited)
      socket.off('messages:read', handleReadStatus)
      if (conversations && conversations.length > 0) {
        conversations.forEach((conv) => {
          socket.emit('conversation:leave', conv._id);
        });
      }
    };
  }, [activeConversationId, conversations]);


  const handleInptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedMessage(e.target.value);
    if (!currentUserId || !activeConversationId) return;
    const socket = getSocket();
    if (!isCurrentlytyping.current) {
      isCurrentlytyping.current = true;
      socket.emit('typing:status', {
        conversationId: activeConversationId,
        userId: currentUserId,
        isTyping: true
      });
    }
    if (isTypingTimeOut.current) clearTimeout(isTypingTimeOut.current);
    isTypingTimeOut.current = setTimeout(() => {
      socket.emit('typing:status', {
        conversationId: activeConversationId,
        userId: currentUserId,
        isTyping: false
      });
      isCurrentlytyping.current = false;
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !activeConversationId) return;
    const messageContent = typedMessage.trim();
    setTypedMessage('');
    if (isTypingTimeOut.current) clearTimeout(isTypingTimeOut.current);
    isCurrentlytyping.current = false;
    getSocket().emit('typing:status', {
      conversationId: activeConversationId,
      userId: currentUserId,
      isTyping: false
    });
    try {
      const response = await chatService.sendMessage({
        conversationId: activeConversationId,
        content: messageContent,
        messageType: 'text'
      });

      if (response.success && response.data) {
        const newMessage = response.data;

        setConversation((prevConv) =>
          prevConv.map((c) =>
            c._id === activeConversationId
              ? { ...c, lastMessageSnippet: newMessage.content }
              : c
          )
        );
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Message could not send");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setOpenMenuId(null);
      const response = await chatService.deleteForEveryOne(messageId);
      if (response.success) {
        toast.success('Message deleted');

        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, content: "This message was deleted.", isDeletedForEveryone: true }
              : m
          )
        );
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    try {
      setOpenMenuId(null);
      const response = await chatService.deleteForMe(messageId);
      if (response.success) {
        setMessages((prevMessages) =>
          prevMessages.filter((m) => m._id !== messageId)
        )
      }
      else {
        toast.error(response.message)
      }
    } catch {
      toast.error('Failed to delete message');
    }

  }

  const handleOpenEditModal = (msg: MessageDto) => {
    setEditingMessage(msg);
    setOpenMenuId(null);
    setEditInputText(msg.content)
  }
  const handleCloseEditModal = () => {
    setEditingMessage(null);
    setEditInputText('');
  }

  const handleSaveEdit = async () => {
    if (!editingMessage || !editInputText.trim()) return
    try {
      setIsSubmittingEdit(true);
      const trimmedText = editInputText.trim();
      const response = await chatService.editMessage(editingMessage._id, trimmedText)
      if (response.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === editingMessage._id ? { ...m, content: trimmedText } : m
          )
        )

        if (activeConversationId) {
          setConversation((prev) =>
            prev.map((c) =>
              c._id === activeConversationId ?
                { ...c, lastMessageSnippet: trimmedText } : c
            )
          )
        }
        handleCloseEditModal()
      }
      else {
        toast.error(response.message)
      }
    } catch {
      toast.error('Failed to edit message');
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleStartRecord = async () => {
    try {
      await startRecording();
    } catch {
      toast.error('Permission denied to access microphone');
    }
  };

  const handleSendVoiceNote = async () => {
    if (!activeConversationId) return;
    try {
      setIsUploadingAudio(true);
      const audioBlob = await stopRecording();


      const uploadRes = await chatService.uploadAudio(audioBlob);
      if (!uploadRes.success || !uploadRes.data?.url) {
        toast.error('Failed to upload audio');
        return;
      }

      const response = await chatService.sendMessage({
        conversationId: activeConversationId,
        content: uploadRes.data.url,
        messageType: 'audio',
      });

      if (response.success && response.data) {
        setConversation((prevConv) =>
          prevConv.map((c) =>
            c._id === activeConversationId
              ? { ...c, lastMessageSnippet: '🎙️ Voice message' }
              : c
          )
        );
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to send voice note');
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectConversation = (id: string) => {
    setSearchParams({ conversationId: id });

    setConversation((prev) =>   //clear unread count for selected conversation
      prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
    );
    markConversationAsRead(id)
  };

  const activeRoomTypingObj = typingUsers[activeConversationId || ''] || {};
  const isPartnerTyping = !!activeRoomTypingObj[activeChatPartner?.userId || ''];
  const validateEditString = editInputText.trim().length > 0
  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-white border border-[#E6E0DA] rounded-3xl overflow-hidden shadow-sm">
      <div className="w-80 md:w-96 border-r border-[#E6E0DA] flex flex-col bg-white">
        <div className="p-4 border-b border-[#E6E0DA] flex items-center justify-between">
          <h2 className="text-sm font-black font-serif tracking-wider uppercase text-[#1F1F1F]">
            Conversations
          </h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest text-white ${currentStyle.accent}`}>
            {roleTheme} Node
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E6E0DA]/60">
          {loading ? (
            <p className="text-xs text-center text-[#6B6B6B] font-mono py-8 animate-pulse">Syncing channels...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-center text-[#6B6B6B] py-8">No conversation routes active.</p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv._id === activeConversationId;
              const chatPartner = conv.participants.find((p) => p.userId !== currentUserId);
              const partnerName = chatPartner?.name || 'Anonymous user';
              const currentRoomTypingObj = typingUsers[conv._id] || {};
              const isConvPartnerTyping = !!currentRoomTypingObj[chatPartner?.userId || ''];
              const isPartnerOnline = chatPartner?.userId ? onlineUsers.has(chatPartner.userId) : false;
              const unreadCount = conv.unreadCount || 0;
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${isActive ? currentStyle.sidebarActive : "hover:bg-[#FFF9F4]/60"}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E6E0DA] flex items-center justify-center font-bold text-xs uppercase text-[#6B6B6B]">
                      {partnerName.substring(0, 2) || "CH"}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-white transition-colors duration-300 ${isPartnerOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#1F1F1F] truncate">{partnerName}</p>
                      <span className="text-[10px] text-[#6B6B6B] font-mono">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-[#6B6B6B] truncate flex-1 mr-2">
                        {isConvPartnerTyping ? (
                          <span className="text-emerald-600 font-medium italic">typing...</span>
                        ) : (
                          conv.lastMessageSnippet || "No messages yet."
                        )}
                      </p>

                      {!isActive && unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>


      <div className={`flex-1 flex flex-col ${currentStyle.bgLight}`}>
        {activeConversationId ? (
          <div className="flex-1 flex flex-col h-full">

            <div className="p-4 bg-white border-b border-[#E6E0DA] flex items-center gap-3">
              <div className="relative flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {activeChatPartner?.userId && onlineUsers.has(activeChatPartner.userId) ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-300"></span>
                  )}
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                  {activePartnerName}
                  <span className="text-[10px] lowercase font-normal text-[#6B6B6B] ml-2 font-mono">
                    ({activeChatPartner?.userId && onlineUsers.has(activeChatPartner.userId) ? 'online' : 'offline'})
                  </span>
                </p>
              </div>
            </div>


            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
              {messagesLoading ? (
                <p className="text-xs text-center text-[#6B6B6B] font-mono py-8 animate-pulse">Retrieving communication logs...</p>
              ) : messages.length === 0 ? (
                <p className="text-xs text-center text-[#6B6B6B] py-8 m-auto font-mono">Channel initialization complete. Start transmitting.</p>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId === currentUserId;
                  const messageAge = Date.now() - new Date(msg.createdAt!).getTime();
                  const canModify = isSelf && messageAge <= EDIT_DELETE_TIME_WINDOW && !msg.isDeletedForEveryone;

                  return (
                    <div
                      key={msg._id}
                      className={`group relative flex flex-col max-w-[70%] text-xs p-3 rounded-2xl shadow-sm tracking-wide ${isSelf
                        ? `${currentStyle.activeBubble} self-end rounded-tr-none`
                        : `${currentStyle.peerBubble} self-start rounded-tl-none`
                        }`}
                    >

                      {!msg.isDeletedForEveryone && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === msg._id ? null : msg._id);
                            }}
                            className="p-1 rounded hover:bg-white/20 text-xs font-bold leading-none cursor-pointer"
                            title="Options"
                          >
                            ⋮
                          </button>

                          {openMenuId === msg._id && (
                            <div className="absolute right-0 top-6 bg-white text-[#1F1F1F] shadow-lg rounded-lg py-1 border border-[#E6E0DA] z-20 w-40">

                              {canModify && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(msg);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer font-medium"
                                >
                                  Edit message
                                </button>
                              )}


                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteForMe(msg._id);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer font-medium"
                              >
                                Delete for me
                              </button>


                              {canModify && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMessage(msg._id);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer font-medium border-t border-[#E6E0DA]/50"
                                >
                                  Delete for everyone
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="leading-relaxed pr-5">
                        {msg.messageType === 'audio' || (msg.content.includes('cloudinary.com') && msg.content.endsWith('.mp3')) ? (
                          <audio controls className="w-full max-w-[220px] h-8 mt-1 rounded-md">
                            <source src={msg.content} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        ) : (
                          msg.content
                        )}
                      </p>

                      <span className="text-[9px] mt-1 block text-right font-mono opacity-60">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                      {isSelf && !msg.isDeletedForEveryone && (
                        <span className="text-[10px] leading-none" title={msg.readBy?.includes(activeChatPartner?.userId || '') ? "Read" : "Sent"}>
                          {msg.readBy?.includes(activeChatPartner?.userId || '') ? (
                            <span className="text-sky-400 font-bold">✓✓</span>
                          ) : (
                            <span className="opacity-60">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                }

                )
              )}

              {isPartnerTyping && (
                <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B] bg-[#F5F5F5] border border-[#E6E0DA] self-start px-3 py-2 rounded-2xl rounded-tl-none tracking-wide animate-pulse shadow-sm">
                  <div className="flex gap-1 items-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B] animate-bounce"></span>
                  </div>
                  <span className="font-mono text-[10px] uppercase ml-1">{activePartnerName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>


            <div className="p-4 bg-white border-t border-[#E6E0DA] flex items-center gap-2">
              {isRecording ? (
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-red-600">
                      Recording... {formatTime(recordingTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelRecording}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendVoiceNote}
                      disabled={isUploadingAudio}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition-all hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      {isUploadingAudio ? 'Sending...' : 'Send Voice'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleStartRecord}
                    className="p-3 bg-[#FFF9F4] border border-[#E6E0DA] text-gray-700 hover:text-[#C9653B] rounded-xl transition-all cursor-pointer flex items-center justify-center"
                    title="Record Voice Message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={typedMessage}
                    onChange={handleInptChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#FFF9F4] border border-[#E6E0DA] rounded-xl px-4 py-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#C9653B]/60 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all active:scale-95 cursor-pointer ${currentStyle.accent}`}
                  >
                    Send
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F1F1F]">No Conversation Open</h3>
            <p className="text-[11px] text-[#6B6B6B] max-w-xs mt-1">
              Click on a conversation to continue chatting.
            </p>
          </div>
        )}
      </div>
      {editingMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E6E0DA] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E0DA] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                Edit Message
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                value={editInputText}
                onChange={(e) => setEditInputText(e.target.value)}
                placeholder="Type your updated message..."
                rows={4}
                className="w-full bg-[#FFF9F4] border border-[#E6E0DA] rounded-xl p-3 text-xs text-[#1F1F1F] focus:outline-none focus:border-[#C9653B]/60 transition-all resize-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E0DA]">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {validateEditString && (
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={handleSaveEdit}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all cursor-pointer ${currentStyle.accent
                    } ${isSubmittingEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmittingEdit ? 'Saving...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};