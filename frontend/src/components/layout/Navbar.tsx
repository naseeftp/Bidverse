import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux.hooks"; // Corrected typo: useAppSelector

const Navbar: React.FC = () => {
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  return (
    <nav className="bg-[#FFFFFF] border-b border-[#E6E0DA] py-5 px-10 flex justify-between items-center sticky top-0 z-50">
      {/* BRAND LOGO - Primary Text Color */}
      <Link to="/" className="text-2xl font-bold tracking-tighter uppercase text-[#1F1F1F]">
        BidVerse<span className="text-[#C9653B]">.</span>
      </Link>

      <div className="flex items-center gap-8">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-5">
            {/* GREETING - Secondary Text Color */}
            <span className="text-sm font-medium text-[#6B6B6B]">
              Welcome, <span className="text-[#1F1F1F]">{user.name || 'User'}</span>
            </span>
            
            {/* DASHBOARD BUTTON - Border and Text match Primary Text */}
            <button className="text-xs font-bold uppercase tracking-widest border border-[#1F1F1F] text-[#1F1F1F] px-5 py-2 hover:bg-[#1F1F1F] hover:text-white transition-all duration-300">
              Dashboard
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {/* LOGIN LINK - Primary Text Color */}
            <Link 
              to="/login" 
              className="text-sm font-semibold uppercase tracking-wider text-[#1F1F1F] hover:text-[#C9653B] transition-colors"
            >
              Login
            </Link>

            {/* REGISTER BUTTON - Primary CTA Color (#C9653B) */}
            <Link 
              to="/register" 
              className="text-sm font-bold uppercase tracking-widest bg-[#C9653B] text-white px-7 py-3 shadow-sm hover:brightness-110 transition-all active:scale-95"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;