import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
    FaThLarge, 
    FaUsers, 
    FaGavel, 
    FaChartPie, 
    FaCog, 
    FaSignOutAlt, 
    FaShieldAlt 
} from "react-icons/fa";
import { logout } from "../../../redux/user/auth.slice";
import { useAppDispatch } from "../../../hooks/redux.hooks";
const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const dispatch=useAppDispatch();
    const handleLogout=()=>{
        dispatch(logout())
    }
  
    const isActive = (path: string) => location.pathname === path;

 const navItems = [
       
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaThLarge /> },
        { name: "User Management", path: "/admin/users", icon: <FaUsers /> },
        { name: "Auction Houses", path: "/admin/auction-houses", icon: <FaGavel /> },
        { name: "Financials", path: "/admin/reports", icon: <FaChartPie /> },
        { name: "System Settings", path: "/admin/settings", icon: <FaCog /> },
    ];

    return (
        <aside className="w-64 min-h-screen bg-[#111827] flex flex-col border-r border-[#D4AF37]/10 shadow-2xl">
           
            <div className="p-8 flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37] rounded-sm">
                    <FaShieldAlt className="text-[#111827] text-xl" />
                </div>
                <div>
                    <h2 className="text-white text-sm font-bold tracking-[0.2em] uppercase">BidVerse</h2>
                    <p className="text-[#D4AF37] text-[9px] font-bold tracking-widest uppercase opacity-80">Admin Console</p>
                </div>
            </div>

           
            <nav className="flex-grow mt-4 px-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                            isActive(item.path)
                                ? "bg-[#D4AF37] text-[#111827] shadow-lg shadow-[#D4AF37]/20"
                                : "text-[#6B7280] hover:text-[#D4AF37] hover:bg-[#1f2937]"
                        }`}
                    >
                        <span className="text-base">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            
            <div className="p-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-[10px] font-bold">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-white text-[10px] font-bold truncate">Root Administrator</p>
                        <p className="text-[#6B7280] text-[8px] uppercase tracking-tighter">Level 10 Access</p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-500/10 transition-colors rounded-sm"
                >
                    <FaSignOutAlt />
                    Terminate Session
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;