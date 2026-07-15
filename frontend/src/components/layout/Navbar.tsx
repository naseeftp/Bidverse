import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux.hooks";
import { logout,setWatchlistCount} from "../../redux/user/auth.slice";
import { ChevronDown, Heart, Menu, X,MessageCircle} from "lucide-react";
import authService from "../../services/auth.service";
import watchListService from "../../services/watchList.service";
import { apiErrorHandler } from "../../utils/error.handle";

const Navbar: React.FC = () => {
  const { user, isAuthenticated ,watchlistCount} = useAppSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (isAuthenticated) {
      const fetchInitialCount = async () => {
        try {
          const response = await watchListService.findAllWatchListItems(1, 1);
          if (response.success && response.pagination) {
            dispatch(setWatchlistCount(response.pagination.totalItems));
          }
        } catch (error) {
          return apiErrorHandler(error,'Failed to get NavBar Watchlist count')
        }
      };
      
      fetchInitialCount();
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinkStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#C9653B] transition-all duration-300";
  const mobileNavLinkStyle = "block py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#1F1F1F] border-b border-[#E6E0DA]/50 hover:text-[#C9653B] transition-all";
  const dropdownItemStyle = "block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#1F1F1F] hover:bg-[#F9F8F7] hover:text-[#C9653B] transition-all duration-200 text-left w-full";

  return (
    <nav className="bg-[#FFFFFF] border-b border-[#E6E0DA] py-5 px-6 md:px-10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter uppercase text-[#1F1F1F]">
            BidVerse<span className="text-[#C9653B]">.</span>
          </Link>
        </div>

        <div className="hidden md:flex justify-center items-center gap-10">
          <Link to="/auctions" className={navLinkStyle}>Auctions</Link>
          <Link to="/auction-houses" className={navLinkStyle}>Auction Houses</Link>
          <Link to="/about" className={navLinkStyle}>About Us</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated && user ? (
            <>
             <button
                onClick={() => navigate("/watch-list")}
                title="View Watchlist"
                className="relative p-2 text-[#6B6B6B] hover:text-[#C9653B] hover:bg-[#FFF9F4] rounded-xl transition-all duration-300 group cursor-pointer focus:outline-none"
              >
                <Heart size={18} className="transition-transform group-hover:scale-105" />
                
                {watchlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9653B] text-[9px] font-black text-white ring-2 ring-white animate-in scale-in-50 duration-200 select-none">
                    {watchlistCount}
                  </span>
                )}
              </button>
               <button
                onClick={() => navigate("/chat")}
                title="View Watchlist"
                className="relative p-2 text-[#6B6B6B] hover:text-[#C9653B] hover:bg-[#FFF9F4] rounded-xl transition-all duration-300 group cursor-pointer focus:outline-none"
              >
                <MessageCircle size={18} className="transition-transform group-hover:scale-105" />
{/*                 
                {watchlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9653B] text-[9px] font-black text-white ring-2 ring-white animate-in scale-in-50 duration-200 select-none">
                    {watchlistCount}
                  </span>
                )} */}
              </button>
              
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#6B6B6B] group-hover:text-[#1F1F1F] transition-colors">
                    Welcome, <span className="text-[#1F1F1F] font-bold">{user.name?.split(' ')[0] || 'User'}</span>
                  </span>
                  <ChevronDown size={14} className={`text-[#6B6B6B] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>


                {isDropdownOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-white border border-[#E6E0DA] shadow-xl z-50 py-2 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <Link to="/profile" className={dropdownItemStyle}>Profile</Link>
                    <Link to="/dashboard" className={dropdownItemStyle}>Dashboard</Link>
                    <div className="h-[1px] bg-[#E6E0DA] my-1 mx-4"></div>
                    <button onClick={handleLogout} className={dropdownItemStyle}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/login" className={navLinkStyle}>Login</Link>
              <Link to="/register" className="text-[10px] font-bold uppercase tracking-widest text-[#1F1F1F] hover:text-[#C9653B] transition-all duration-300">Register</Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#1F1F1F] hover:bg-[#F9F8F7] rounded-xl md:hidden cursor-pointer focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-[#E6E0DA] shadow-xl md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-6 py-4 flex flex-col bg-white">
            
            {isAuthenticated && user && (
              <div className="pb-4 mb-2 border-b border-[#E6E0DA]">
                <p className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">Logged in as</p>
                <p className="text-sm font-bold text-[#1F1F1F]">{user.name}</p>
              </div>
            )}

            <Link to="/auctions" className={mobileNavLinkStyle}>Auctions</Link>
            <Link to="/auction-houses" className={mobileNavLinkStyle}>Auction Houses</Link>
            <Link to="/about" className={mobileNavLinkStyle}>About Us</Link>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className={mobileNavLinkStyle}>Profile</Link>
                <Link to="/dashboard" className={mobileNavLinkStyle}>Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#C9653B] transition-all cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 flex flex-col gap-3">
                <Link 
                  to="/login" 
                  className="block w-full text-center py-3 text-xs font-bold uppercase tracking-widest border border-[#E6E0DA] rounded-xl text-[#1F1F1F]"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full text-center py-3 text-xs font-bold uppercase tracking-widest bg-[#1F1F1F] text-white rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;