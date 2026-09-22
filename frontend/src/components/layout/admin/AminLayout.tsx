import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import AdminNavbar from "./Navbar";
import React from "react";
import { useAppSelector } from "../../../hooks/redux.hooks";

const AdminLayout: React.FC = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    return (
        <div className="flex min-h-screen bg-[#F3F4F6] relative">
            {isAuthenticated && <AdminSidebar />}

            <div className="flex flex-col flex-grow min-w-0">
                {isAuthenticated && <AdminNavbar />}
                <main className="p-4 sm:p-6 md:p-8 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;