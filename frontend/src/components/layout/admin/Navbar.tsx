import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell,MessageCircle } from "lucide-react";

const AdminNavbar: React.FC = () => {
    const navigate=useNavigate()
    return (
        <nav className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">

            <div className="flex items-center gap-4 w-1/3">

            </div>


            <div className="flex items-center gap-6">


                <div className="flex items-center gap-4 pr-6 border-r border-[#E5E7EB]">
                    <button className="text-[#6B7280] hover:text-[#D4AF37] transition-colors relative">
                        <Bell  size={18}/>
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#DC2626] rounded-full border-2 border-white"></span>
                    </button>
                    <button 
                    onClick={()=>navigate('/admin/chat')}
                    className="text-[#6B7280] hover:text-[#D4AF37] transition-colors hidden md:block">
                        <MessageCircle size={18} />
                    </button>
                </div>


            </div>
        </nav>
    );
};

export default AdminNavbar;