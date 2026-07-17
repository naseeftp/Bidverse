import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { ConversationDTO, MessageDto } from "../../types/chat.dto";
import chatService from "../../services/chat.service";
import toast from "react-hot-toast";
import { useAppSelector } from "../../hooks/redux.hooks";
import { getSocket } from "../../services/socket.service";

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

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ roleTheme }) => {
  const [conversations, setConversation] = useState<ConversationDTO[]>([]);
  const [searchParams, setSearchParams] = useSearchParams()
  const activeConversationId = searchParams.get('conversationId')
  const [loading, setLoading] = useState<boolean>(true)

  const [typedMessage, setTypedMessage] = useState<string>('')
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  const { user } = useAppSelector((state) => state.auth)
  const currentStyle = THEME_STYLES[roleTheme]
  const currentUserId = user?.userId;
  const activeConversation = conversations.find((conv) => conv._id === activeConversationId);
  const activeChatPartner = activeConversation?.participants.find((p) => p.userId !== currentUserId);
  const activePartnerName = activeChatPartner?.name || "Anonymous Operator";


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom();
  }, [messages])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatService.getUserConversations();
        if (response.success && response.data) {
          setConversation(response.data)
        }
        else {
          toast.error(response.message)
        }
      } catch {
        toast.error('failed to get conversations')
      } finally {
        setLoading(false)
      }
    };
    fetchConversations()
  }, [])


  useEffect(() => {
    if (!activeConversationId) return;
    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await chatService.getMessages(activeConversationId)
        if (response.success && response.data) {
          setMessages(response.data)
        } else {
          toast.error(response.message)
        }
      } catch {
        toast.error('Failed to get  chat history');
      }
      finally {
        setMessagesLoading(false)
      }
    }
    fetchMessages()
    const socket = getSocket(user?.userId, user?.role);
    socket.emit('conversation:join', activeConversationId)
    socket.on('message:receive', (newMessage: MessageDto) => {
      if (newMessage.conversationId === activeConversationId) {
        setMessages((prev) => [...prev, newMessage])
      }
      setConversation((prevConv) =>
        prevConv.map((c) =>
          c._id === activeConversationId
            ? { ...c, lastMessageSnippet: newMessage.content }
            : c
        )
      );
    })
    return () => {
      socket.emit('conversation:leave', activeConversationId);
      socket.off('message:receive')
    }
  }, [activeConversationId, user?.userId, user?.role])


  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !activeConversationId) return;
    const messageContent = typedMessage.trim();
    setTypedMessage('');
    try {
      const response = await chatService.sendMessage({
        conversationId: activeConversationId,
        content: messageContent,
        messageType: 'text'
      });
      if (response.success && response.data) {
        const newMessage = response.data;
        setMessages((prev) => [...prev, newMessage]);
        setConversation((prevConv) =>
          prevConv.map((c) =>
            c._id === activeConversationId
              ? { ...c, lastMessageSnippet: newMessage.content }
              : c
          )
        );

      } else {
        toast.error(response.message)
      }
    } catch {
      toast.error("Message could not send");
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  const handleSelectConversation = (id: string) => {
    setSearchParams({ conversationId: id })
  }

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
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${isActive ? currentStyle.sidebarActive : "hover:bg-[#FFF9F4]/60"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E6E0DA] flex items-center justify-center font-bold text-xs uppercase text-[#6B6B6B]">
                    {partnerName.substring(0, 2) || "CH"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#1F1F1F] truncate">{partnerName}</p>
                      <span className="text-[10px] text-[#6B6B6B] font-mono">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] truncate mt-0.5">
                      {conv.lastMessageSnippet || "No message data transmissions inside room."}
                    </p>
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
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">{activePartnerName}</p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
              {messagesLoading ? (
                <p className="text-xs text-center text-[#6B6B6B] font-mono py-8 animate-pulse">Retrieving communication logs...</p>
              ) : messages.length === 0 ? (
                <p className="text-xs text-center text-[#6B6B6B] py-8 m-auto font-mono">Channel initialization complete. Start transmitting.</p>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col max-w-[70%] text-xs p-3 rounded-2xl shadow-sm tracking-wide ${isSelf
                          ? `${currentStyle.activeBubble} self-end rounded-tr-none`
                          : `${currentStyle.peerBubble} self-start rounded-tl-none`
                        }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <span className="text-[9px] mt-1 block text-right font-mono opacity-60">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>


            <div className="p-4 bg-white border-t border-[#E6E0DA] flex items-center gap-2">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
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
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1F1F1F]">No Conversation Open</h3>
            <p className="text-[11px] text-[#6B6B6B] max-w-xs mt-1">
              Click on a conversation to Continue Chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
}