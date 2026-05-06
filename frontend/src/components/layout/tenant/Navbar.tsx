import React from "react";
import { Link } from "react-router-dom";
import { Bell, User} from "lucide-react";
import { useAppSelector } from '../../../hooks/redux.hooks'

const TenantNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <nav className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-30">

      
      <div className="flex items-center">
        {!isAuthenticated && (
          <Link to="/tenant/login" className="text-xl font-bold tracking-tight text-[#0F172A]">
            BidVerse<span className="text-[#2F6FED]">.</span>
          </Link>
        )}
      </div>

      
      {isAuthenticated ? (
        <>

          <div className="flex items-center gap-8">
            <button className="text-[#64748B] hover:text-[#2F6FED] transition-colors relative">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-[#E2E8F0]"></div>

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold tracking-tight text-[#0F172A]">
                  {user?.name || "Auction Admin"}
                </span>
               
              </div>
              <div className="w-10 h-10 bg-[#2F6FED] rounded-xl flex items-center justify-center text-white group-hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/20">
                <User size={20} />
              </div>
            </div>
          </div>
        </>
      ) : (
       
        <div className="flex items-center gap-4">
          <Link
            to="/tenant/login"
            className="text-[12px] font-bold uppercase tracking-widest text-[#475569] hover:text-[#2F6FED] transition-colors px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/tenant/register"
            className="bg-[#2F6FED] text-white text-[12px] font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-[#1E40AF] transition-all shadow-md shadow-blue-500/10"
          >
            Register House
          </Link>
        </div>
      )}
    </nav>
  );
};

export default TenantNavbar;