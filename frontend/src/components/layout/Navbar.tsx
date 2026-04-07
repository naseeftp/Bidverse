import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux.hooks";
import { logout } from "../../redux/user/auth.slice"; // Ensure you have a logout action
import { ChevronDown } from "lucide-react"; // Using lucide-react for the arrow

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navLinkStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#C9653B] transition-all duration-300";
  const dropdownItemStyle = "block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#1F1F1F] hover:bg-[#F9F8F7] hover:text-[#C9653B] transition-all duration-200 text-left w-full";

  return (
    <nav className="bg-[#FFFFFF] border-b border-[#E6E0DA] py-6 px-10 sticky top-0 z-50">
      <div className="grid grid-cols-3 items-center w-full">
        
        {/* LEFT: BRAND LOGO */}
        <div className="flex justify-start">
          <Link to="/" className="text-2xl font-bold tracking-tighter uppercase text-[#1F1F1F]">
            BidVerse<span className="text-[#C9653B]">.</span>
          </Link>
        </div>

        {/* MIDDLE: NAVIGATION LINKS */}
        <div className="hidden md:flex justify-center items-center gap-10">
          <Link to="/auctions" className={navLinkStyle}>Auctions</Link>
          <Link to="/auction-houses" className={navLinkStyle}>Auction Houses</Link>
          <Link to="/about" className={navLinkStyle}>About Us</Link>
        </div>

        {/* RIGHT: AUTH SECTION */}
        <div className="flex justify-end items-center">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <span className="text-[10px] font-medium uppercase tracking-widest text-[#6B6B6B] group-hover:text-[#1F1F1F] transition-colors">
                  Welcome, <span className="text-[#1F1F1F] font-bold">{user.name?.split(' ')[0] || 'User'}</span>
                </span>
                <ChevronDown size={14} className={`text-[#6B6B6B] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white border border-[#E6E0DA] shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                  <Link to="/profile" className={dropdownItemStyle} onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>
                  
                  <div className="h-[1px] bg-[#E6E0DA] my-1 mx-4"></div>
                  <button onClick={handleLogout} className={dropdownItemStyle}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link to="/login" className={navLinkStyle}>Login</Link>
              <Link to="/register" className="text-[10px] font-bold uppercase tracking-widest text-[#1F1F1F] hover:text-[#C9653B] transition-all duration-300">Register</Link>
            </div>
          )}
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;