import React from "react";
import { Link } from "react-router-dom";
import { Bell, User, Search } from "lucide-react";
import { useAppSelector } from '../../../hooks/redux.hooks'

const TenantNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <nav className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-30">

      {/* LEFT SIDE: Brand/Title (Always Visible or contextual) */}
      <div className="flex items-center">
        {!isAuthenticated && (
          <Link to="/tenant/login" className="text-xl font-bold tracking-tight text-[#0F172A]">
            BidVerse<span className="text-[#2F6FED]">.</span>
          </Link>
        )}
      </div>

      {/* MIDDLE/RIGHT CONTENT: Conditional Rendering */}
      {isAuthenticated ? (
        <>

          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="SEARCH AUCTIONS OR BIDDERS..."
              className="w-full bg-[#F5F7FB] border border-[#E2E8F0] rounded-lg py-2 pl-10 pr-4 text-[11px] font-semibold tracking-wider text-[#0F172A] focus:ring-2 focus:ring-[#2F6FED]/10 focus:border-[#2F6FED] outline-none transition-all"
            />
          </div>

          {/* AUTHENTICATED: ACTIONS */}
          <div className="flex items-center gap-8">
            <button className="text-[#64748B] hover:text-[#2F6FED] transition-colors relative">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-[#E2E8F0]"></div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold tracking-tight text-[#0F172A]">
                  {user?.name || "Auction Admin"}
                </span>
                <span className="text-[10px] font-medium text-[#64748B]">
                  ID: #AH-9921
                </span>
              </div>
              <div className="w-10 h-10 bg-[#2F6FED] rounded-xl flex items-center justify-center text-white group-hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/20">
                <User size={20} />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* GUEST: LOGIN & REGISTER BUTTONS */
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