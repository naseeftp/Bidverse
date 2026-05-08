import Sidebar from "./sideBar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux.hooks";

const UserLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9F4]">
      
      <header className="w-full bg-white border-b border-[#E6E0DA] sticky top-0 z-50">
        <Navbar />
      </header>

      <div className="flex flex-1">
        
        {isAuthenticated && (
          <aside className="w-64 bg-white border-r border-[#E6E0DA] hidden md:block sticky top-[64px] h-[calc(100vh-64px)]">
            <Sidebar />
          </aside>
        )}

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;