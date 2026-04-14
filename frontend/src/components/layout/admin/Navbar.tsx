import React from "react";
import { FaSearch, FaBell, FaUserCircle, FaExpand } from "react-icons/fa";

const AdminNavbar: React.FC = () => {
    return (
        <nav className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">

            {/* Left Side: Search Bar */}
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#D4AF37] transition-colors">
                        <FaSearch size={14} />
                    </span>
                    <input
                        type="text"
                        placeholder="SEARCH SYSTEM..."
                        className="w-full bg-[#F3F4F6] border border-transparent px-10 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#D4AF37] transition-all rounded-sm placeholder:text-[#94A3B8]"
                    />
                </div>
            </div>

            {/* Right Side: Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* Utilities */}
                <div className="flex items-center gap-4 pr-6 border-r border-[#E5E7EB]">
                    <button className="text-[#6B7280] hover:text-[#D4AF37] transition-colors relative">
                        <FaBell size={18} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full border-2 border-white"></span>
                    </button>
                    <button className="text-[#6B7280] hover:text-[#D4AF37] transition-colors hidden md:block">
                        <FaExpand size={16} />
                    </button>
                </div>

                {/* Profile Identity */}
                <div className="flex items-center gap-4 pl-2 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-bold text-[#0F172A] uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">
                            Root Admin
                        </p>
                        <p className="text-[9px] text-[#16A34A] font-bold uppercase tracking-widest">
                            Online
                        </p>
                    </div>

                    <div className="w-10 h-10 bg-[#111827] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#111827] transition-all duration-300">
                        <FaUserCircle size={24} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;