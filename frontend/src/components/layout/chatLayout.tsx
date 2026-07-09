import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { ConversationDTO } from "../../types/chat.dto";
import chatService from "../../services/chat.service";
import toast from "react-hot-toast";

interface ChatWorkspaceProps {
    roleTheme: 'user' | 'tenant' | 'admin';
}
const THEME_STYLES = {
    user: {
        accent: "bg-[#1F1F1F]",
        text: "text-[#1F1F1F]",
        bgLight: "bg-[#FFF9F4]",
        activeBubble: "bg-[#1F1F1F] text-white",
        sidebarActive: "bg-[#F5F5F5] border-l-4 border-l-[#1F1F1F]",
    },
    tenant: {
        accent: "bg-[#C9653B]",
        text: "text-[#C9653B]",
        bgLight: "bg-[#FFF9F4]",
        activeBubble: "bg-[#C9653B] text-white",
        sidebarActive: "bg-[#C9653B]/5 border-l-4 border-l-[#C9653B]",
    },
    admin: {
        accent: "bg-[#000000]",
        text: "text-[#000000]",
        bgLight: "bg-[#FAFAFA]",
        activeBubble: "bg-[#000000] text-white",
        sidebarActive: "bg-[#EAEAEA] border-l-4 border-l-[#000000]",
    },
};

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ roleTheme }) => {
    const [conversations, setConversation] = useState<ConversationDTO[]>([]);
    const [searchParams,setSearchParams]=useSearchParams()
    const activeConversationId=searchParams.get('conversationId')
    const [loading, setLoading] = useState<Boolean>(true)
    const currentStyle = THEME_STYLES[roleTheme]

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
    const handleSelectConversation=(id:string)=>{
     setSearchParams({conversationId:id})
    }

    return(
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
              const partner = conv.participants[0]; 

              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                    isActive ? currentStyle.sidebarActive : "hover:bg-[#FFF9F4]/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#E6E0DA] flex items-center justify-center font-bold text-xs uppercase text-[#6B6B6B]">
                    {partner?.name?.substring(0, 2) || "CH"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#1F1F1F] truncate">{partner?.name || "Anonymous Operator"}</p>
                      <span className="text-[10px] text-[#6B6B6B] font-mono">2:05 pm</span>
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
        </div>
    )

}