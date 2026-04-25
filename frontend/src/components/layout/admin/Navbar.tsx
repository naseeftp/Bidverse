import React from "react";
import {FaBell,FaExpand } from "react-icons/fa";

const AdminNavbar: React.FC = () => {
    return (
        <nav className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">

            {/* Left Side: Search Bar */}
            <div className="flex items-center gap-4 w-1/3">
               
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

             
            </div>
        </nav>
    );
};

export default AdminNavbar;