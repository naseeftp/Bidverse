import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TenantNavbar from "./Navbar";
import { useAppSelector } from "../../../hooks/redux.hooks";



const TenantLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      {isAuthenticated && <Sidebar />}
      <div className="flex flex-col flex-grow">
        <TenantNavbar />
        <main className="p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TenantLayout;