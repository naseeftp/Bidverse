import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Gavel, ShieldCheck, Settings, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux.hooks";
import { logout } from "../../../redux/user/auth.slice";
import { VerificationStatus } from "../../../types/auctionHouse.type";

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { status } = useAppSelector((state) => state.auctionHouse);

  const handleLogout = () => {
    dispatch(logout());
  };

  const publicItems = [
    { name: "Dashboard", path: "/tenant/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "KYC Verification", path: "/tenant/kyc", icon: <ShieldCheck size={18} /> },
  ];

  const verifiedItems = [
    { name: "My Auctions", path: "/tenant/auctions", icon: <Gavel size={18} /> },
    { name: "Settings", path: "/tenant/settings", icon: <Settings size={18} /> },
  ];

  const menuItems = [
    ...publicItems,
    ...(status === VerificationStatus.APPROVED ? verifiedItems : []),
  ];

  return (
    // Background set to Card Background (#FFFFFF) with a Slate Border (#E2E8F0)
    <aside className="w-64 h-screen bg-white border-r border-[#E2E8F0] text-[#475569] flex flex-col sticky top-0 overflow-hidden">
      
      {/* BRANDING SECTION */}
      <div className="p-8">
        <Link to="/" className="text-xl font-black tracking-tighter uppercase text-[#0F172A]">
          BidVerse<span className="text-[#2F6FED]">.</span>
          <span className="block text-[8px] tracking-[0.4em] text-[#475569] mt-1 opacity-70">
            Tenant Console
          </span>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-grow py-4 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-[#F5F7FB] text-[#2F6FED]" 
                  : "text-[#475569] hover:bg-[#F5F7FB] hover:text-[#0F172A]"}`}
            >
              {/* Icon logic: Active uses Royal Blue, Inactive uses Slate */}
              <span className={`${isActive ? "text-[#2F6FED]" : "text-[#94A3B8] group-hover:text-[#475569]"}`}>
                {item.icon}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* LOCKED FEATURES FEEDBACK */}
        {status !== VerificationStatus.APPROVED && (
          <div className="mt-8 mx-2 px-4 py-4 bg-[#F5F7FB] rounded-2xl border border-[#E2E8F0] border-dashed">
             <p className="text-[9px] text-[#475569] uppercase tracking-widest font-extrabold">
               Limited Access
             </p>
             <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">
               Complete verification to unlock all features.
             </p>
          </div>
        )}
      </nav>

      {/* FOOTER / LOGOUT */}
      <div className="p-6 border-t border-[#E2E8F0]">
        <button 
          onClick={handleLogout} 
          // Using Soft Red for Logout text
          className="flex items-center gap-4 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] w-full rounded-xl transition-all group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;