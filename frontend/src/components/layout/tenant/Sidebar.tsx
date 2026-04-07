import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Gavel, ShieldCheck, Settings, LogOut } from "lucide-react";
import { useAppDispatch } from "../../../hooks/redux.hooks";
import { logout } from "../../../redux/user/auth.slice";
const Sidebar: React.FC = () => {
  const dispatch=useAppDispatch();
  const handleLogout=()=>{
    dispatch(logout())
  }
  const location = useLocation();
  
  const menuItems = [
    { name: "Dashboard", path: "/tenant/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "My Auctions", path: "/tenant/auctions", icon: <Gavel size={18} /> },
    { name: "KYC Verification", path: "/tenant/kyc", icon: <ShieldCheck size={18} /> },
    { name: "Settings", path: "/tenant/settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-[#1A1A1A] text-[#F8F9FA] flex flex-col sticky top-0 overflow-hidden">
      {/* BRAND SECTION */}
      <div className="p-8 border-b border-white/5">
        <Link to="/" className="text-xl font-black tracking-tighter uppercase text-white">
          BidVerse<span className="text-[#A0A0A0]">.</span>
          <span className="block text-[8px] tracking-[0.4em] text-[#6B6B6B] mt-1">Tenant Console</span>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-grow py-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-300 group
                ${isActive 
                  ? "bg-white text-[#1A1A1A]" 
                  : "text-[#A0A0A0] hover:text-white hover:bg-white/5"}`}
            >
              <span className={`${isActive ? "text-[#1A1A1A]" : "text-[#6B6B6B] group-hover:text-white"}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      
      <div className="p-6 border-t border-white/5">
        <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-[#FF4D4D] hover:bg-[#FF4D4D]/10 w-full rounded-sm transition-all">
          <LogOut size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;