import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Gavel,
  Settings,
  LogOut,
  ShoppingBag,
  HandCoins,
  Menu,
  X
} from "lucide-react";
import { useAppDispatch } from "../../../hooks/redux.hooks";
import { logout } from "../../../redux/user/auth.slice";
import { VerificationStatus } from "../../../types/auctionHouse.type";
import auctionHouseService from "../../../services/auctionHouse.service";
import authService from "../../../services/auth.service";
import type { AdminAuctionHouseDetailDTO } from '../../../types/auctionHouse.type';

const Sidebar: React.FC = () => {
  const [house, setHouse] = useState<AdminAuctionHouseDetailDTO | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
  };

  const fetchAuctionProfile = async () => {
    const response = await auctionHouseService.getProfile();
    if (response.success && response.data) {
      setHouse(response.data);
    }
  };

  const status = house?.status;

  useEffect(() => {
    fetchAuctionProfile();
  }, []);

  // Close sidebar on route change automatically
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const publicItems = [
    { name: "Dashboard", path: "/tenant/dashboard", icon: <LayoutDashboard size={18} /> },
  ];

  const verifiedItems = [
    { name: "My Auctions", path: "/tenant/auctions", icon: <Gavel size={18} /> },
    { name: "My Orders", path: "/tenant/my-orders", icon: <ShoppingBag size={18} /> },
    { name: "Transactions", path: "/tenant/transactions", icon: <HandCoins size={18} /> },
    { name: "Revenue", path: "/tenant/revenue", icon: <HandCoins size={18} /> },
    { name: "Profile Settings", path: "/tenant/profile", icon: <Settings size={18} /> },
  ];

  const menuItems = [
    ...publicItems,
    ...(status === VerificationStatus.APPROVED ? verifiedItems : []),
  ];

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-6 left-6 z-50 p-3 bg-[#2F6FED] text-white rounded-full shadow-lg focus:outline-none hover:bg-[#2558C4] transition-colors"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-50 md:z-auto h-screen w-64 bg-white border-r border-[#E2E8F0] text-[#475569] flex flex-col transform transition-transform duration-300 ease-in-out shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="p-8 flex items-center justify-between">
          <Link to="/" onClick={closeSidebar} className="text-xl font-black tracking-tighter uppercase text-[#0F172A]">
            BidVerse<span className="text-[#2F6FED]">.</span>
            <span className="block text-[8px] tracking-[0.4em] text-[#475569] mt-1 opacity-70">
              Tenant Console
            </span>
          </Link>

          <button
            onClick={closeSidebar}
            className="md:hidden text-[#475569] hover:text-[#0F172A]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow py-4 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-[#F5F7FB] text-[#2F6FED]"
                    : "text-[#475569] hover:bg-[#F5F7FB] hover:text-[#0F172A]"
                  }`}
              >
                <span className={isActive ? "text-[#2F6FED]" : "text-[#94A3B8] group-hover:text-[#475569]"}>
                  {item.icon}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {item.name}
                </span>
              </Link>
            );
          })}

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

        <div className="p-6 border-t border-[#E2E8F0]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] w-full rounded-xl transition-all group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;