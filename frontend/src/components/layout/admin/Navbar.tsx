import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle } from "lucide-react";
import { getSocket } from "../../../services/socket.service";
import { useUnreadCount } from "../../../hooks/useUnreadConvCount";

const AdminNavbar: React.FC = () => {
    const { unreadCount, refreshCount } = useUnreadCount()

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("chat:activity", refreshCount);
        return () => {
            socket.off("chat:activity", refreshCount);
        };
    }, [refreshCount]);

    const navigate = useNavigate()
    return (
        <nav className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">

            <div className="flex items-center gap-4 w-1/3">
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 pr-6 border-r border-[#E5E7EB]">
                    <button
                        onClick={() => navigate("/admin/notifications")}
                        className="text-[#6B7280] hover:text-[#D4AF37] transition-colors relative">
                        <Bell size={18} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full border-2 border-white"></span>
                    </button>
                    <button
                        onClick={() => navigate("/admin/chat")}
                        title="View Watchlist"
                        className="relative p-2 text-[#6B6B6B] hover:text-[#C9653B] hover:bg-[#FFF9F4] rounded-xl transition-all duration-300 group cursor-pointer focus:outline-none"
                    >
                        <MessageCircle size={18} className="transition-transform group-hover:scale-105" />

                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9653B] text-[9px] font-black text-white ring-2 ring-white animate-in scale-in-50 duration-200 select-none">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>


            </div>
        </nav>
    );
};

export default AdminNavbar;