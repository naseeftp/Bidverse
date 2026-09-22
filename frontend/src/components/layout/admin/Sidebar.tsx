import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaThLarge,
    FaUsers,
    FaGavel,
    FaSignOutAlt,
    FaShieldAlt,
    FaStore,
    FaShoppingBag,
    FaWallet,
    FaBars,
    FaTimes,
} from "react-icons/fa";

import { logout } from "../../../redux/user/auth.slice";
import { useAppDispatch } from "../../../hooks/redux.hooks";
import authService from "../../../services/auth.service";

const AdminSidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const dispatch = useAppDispatch();

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const handleLogout = async () => {
        await authService.logout();
        dispatch(logout());
    };

    useEffect(() => {
        closeSidebar();
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaThLarge /> },
        { name: "User Management", path: "/admin/users", icon: <FaUsers /> },
        { name: "Auction Houses", path: "/admin/auction-houses", icon: <FaStore /> },
        { name: "Auctions", path: "/admin/auctions", icon: <FaGavel /> },
        { name: "Orders", path: "/admin/orders", icon: <FaShoppingBag /> },
        { name: "Transactions", path: "/admin/transactions", icon: <FaWallet /> },
        { name: "Revenue", path: "/admin/revenue", icon: <FaWallet /> },
    ];

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed bottom-6 left-6 z-50 p-3.5 bg-[#D4AF37] text-[#111827] rounded-full shadow-2xl focus:outline-none hover:bg-[#b8972e] transition-colors"
                aria-label="Toggle Menu"
            >
                {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-64 bg-[#111827] flex flex-col border-r border-[#D4AF37]/10 shadow-2xl transform transition-transform duration-300 ease-in-out shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <div className="p-6 md:p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D4AF37] rounded-sm">
                            <FaShieldAlt className="text-[#111827] text-xl" />
                        </div>
                        <div>
                            <h2 className="text-white text-sm font-bold tracking-[0.2em] uppercase">BidVerse</h2>
                            <p className="text-[#D4AF37] text-[9px] font-bold tracking-widest uppercase opacity-80">
                                Admin Console
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={closeSidebar}
                        className="md:hidden text-[#6B7280] hover:text-[#D4AF37] transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <nav className="flex-grow py-4 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${isActive(item.path)
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

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-500/10 transition-colors rounded-sm"
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;