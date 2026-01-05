
import React from 'react';
import { Home, ShoppingBag, ShoppingCart, MessageSquare } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, cartCount }) => {
  // Navigation now only includes 4 items, profile is moved to the top Navbar
  const navItems = [
    { id: 'home', icon: Home, label: 'خانه' },
    { id: 'products', icon: ShoppingBag, label: 'محصولات' },
    { id: 'consultation', icon: MessageSquare, label: 'مشاوره' },
    { id: 'cart', icon: ShoppingCart, label: 'سبد خرید', badge: cartCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-2 py-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-pharmacy-500' : 'text-slate-500'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-pharmacy-500/10 scale-110' : ''}`}>
                {/* Fixed: Ghost icon only renders when active to prevent double icons on inactive state */}
                {isActive && (
                    <Icon className="w-6 h-6 fill-current opacity-20 absolute inset-0 m-2" />
                )}
                <Icon className="w-6 h-6 relative z-10" />
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-pulse">
                    {item.badge.toLocaleString('fa-IR')}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
