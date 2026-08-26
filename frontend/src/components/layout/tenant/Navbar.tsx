import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, User, MessageCircle } from "lucide-react";
import { useAppSelector } from '../../../hooks/redux.hooks'
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../../services/socket.service";
import { useUnreadCount } from "../../../hooks/useUnreadConvCount";

const TenantNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
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
    <nav className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-30">


      <div className="flex items-center">
        {!isAuthenticated && (
          <Link to="/tenant/login" className="text-xl font-bold tracking-tight text-[#0F172A]">
            BidVerse<span className="text-[#2F6FED]">.</span>
          </Link>
        )}
      </div>
      {isAuthenticated ? (
        <>

          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/tenant/chat")}
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
            <button
              onClick={() => navigate('/tenant/notifications')}
              className="text-[#64748B] hover:text-[#2F6FED] transition-colors relative">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-[#E2E8F0]"></div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold tracking-tight text-[#0F172A]">
                  {user?.name || "Auction Admin"}
                </span>

              </div>
              <div className="w-10 h-10 bg-[#2F6FED] rounded-xl flex items-center justify-center text-white group-hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/20">
                <User size={20} />
              </div>
            </div>
          </div>
        </>
      ) : (

        <div className="flex items-center gap-4">
          <Link
            to="/tenant/login"
            className="text-[12px] font-bold uppercase tracking-widest text-[#475569] hover:text-[#2F6FED] transition-colors px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/tenant/register"
            className="bg-[#2F6FED] text-white text-[12px] font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-[#1E40AF] transition-all shadow-md shadow-blue-500/10"
          >
            Register House
          </Link>
        </div>
      )}
    </nav>
  );
};

export default TenantNavbar;