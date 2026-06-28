import React, { useEffect, useState } from "react";
import chatService from "../../services/chat.service";
import toast from "react-hot-toast";
import type { ConversationDTO } from "../../types/chat.dto";

const ChatPage: React.FC = () => {
    const [conversations, setConversations] = useState<ConversationDTO[]>([])

    const fetchConversations = async () => {
        try {
            const result = await chatService.getUserConversations();
            if (result.success && result.data) {
                setConversations(result.data)
            }
            else {
                toast.error(result.message)
            }
        } catch {
            toast.error('error while fetching conversations')
        }

    }
    useEffect(() => {
        fetchConversations()
    }, [])

}
export default ChatPage
