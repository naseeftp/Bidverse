import { 
  MapPin, 
  ShoppingBag, 
  Hammer, 
  User, 
  LogOut, 
  CalendarCheck, 
  Receipt, 
  HandCoins, 
  Menu, 
  X 
} from 'lucide-react';
import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const menuItems = [
    { name: 'My Bids', icon: Hammer, path: '/my-bids' },
    { name: 'My Slots', icon: CalendarCheck, path: '/my-slots' },
    { name: 'Payment Requests', icon: HandCoins, path: '/payment-requests' },
    { name: 'Transactions', icon: Receipt, path: '/my-transactions' },
    { name: 'Orders', icon: ShoppingBag, path: '/my-orders' },
    { name: 'Addresses', icon: MapPin, path: '/addresses' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Floating Toggle Button on Mobile Screens */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-5 right-5 z-50 p-3 bg-[#C9653B] text-white rounded-full shadow-lg focus:outline-none"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Dark Overlay for Mobile when Drawer is Open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Responsive Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 md:top-[64px] left-0 z-50 md:z-auto h-screen md:h-[calc(100vh-64px)] w-64 bg-white border-r border-[#E6E0DA] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header inside Drawer */}
        <div className="p-6 text-2xl font-bold text-[#1F1F1F] flex justify-between items-center md:hidden">
          <span>Menu</span>
          <button onClick={closeSidebar} className="text-[#6B6B6B] hover:text-[#C9653B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 pt-4 md:pt-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={closeSidebar}
              className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors group hover:bg-[#FFF9F4]"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#C9653B]" />
                <span className="text-[#1F1F1F] font-medium">{item.name}</span>
              </div>
            </a>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#E6E0DA]">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-[#6B6B6B] hover:text-[#C9653B] hover:bg-[#FFF9F4] transition-colors rounded-lg">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;