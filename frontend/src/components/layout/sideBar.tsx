import { MapPin, ShoppingBag, Hammer, User, LogOut} from 'lucide-react';
import React from 'react';

const Sidebar:React.FC = () => {
  const menuItems = [
    { name: 'My Bids', icon: Hammer, path: '/bids'},      
    { name: 'Orders', icon: ShoppingBag, path: '/orders'}, 
    { name: 'Addresses', icon: MapPin, path: '/addresses' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="w-64 h-screen bg-[#FFFFFF] border-r border-[#E6E0DA] flex flex-col">
     
      <div className="p-6 text-2xl font-bold text-[#1F1F1F]">
    
      </div>

     
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors group hover:bg-[#FFF9F4]"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#C9653B]" />
              <span className="text-[#1F1F1F] font-medium">{item.name}</span>
            </div>
          </a>
        ))}
      </nav>

     
      <div className="p-4 border-t border-[#E6E0DA]">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-[#6B6B6B] hover:text-[#C9653B]">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar