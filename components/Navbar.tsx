
import React from 'react';
import { ShoppingBag, Home, ShoppingCart, User as UserIcon, MessageSquare, BookOpen } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  currentUser: User | null;
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, cartCount, currentUser, onLoginClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 landscape:h-20 md:landscape:h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Mobile height increased from h-14 to h-20 for better touch compatibility */}
        <div className="flex items-center justify-between h-20 md:h-20">
          
          {/* Right side: Logo - Reduced size as requested */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
             <img 
               src="https://drshamimnasab.ir/wp-content/uploads/2026/01/lorr.png" 
               alt="داروخانه دکتر شمیم نسب" 
               className="h-9 md:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105"
             />
          </div>

          {/* Center: Navigation Links (Desktop only) */}
          <div className="hidden md:flex gap-4 items-center">
            <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-pharmacy-500' : 'text-slate-300 hover:text-white'}`}
            >
                <Home className="w-4 h-4" />
                خانه
            </button>
            <button 
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'products' ? 'text-pharmacy-500' : 'text-slate-300 hover:text-white'}`}
            >
                <ShoppingBag className="w-4 h-4" />
                محصولات
            </button>
            
            <button 
                onClick={() => setActiveTab('mag')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'mag' ? 'text-pharmacy-500' : 'text-slate-300 hover:text-white'}`}
            >
                <BookOpen className="w-4 h-4" />
                مجله سلامت
            </button>

            <button 
                onClick={() => setActiveTab('consultation')}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'consultation' ? 'text-pharmacy-500' : 'text-slate-300 hover:text-white'}`}
            >
                <MessageSquare className="w-4 h-4" />
                مشاوره تخصصی
            </button>

            <button 
                onClick={() => setActiveTab('cart')}
                className={`relative flex items-center gap-2 text-sm font-medium transition-all p-2 rounded-xl ${activeTab === 'cart' ? 'bg-pharmacy-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
                <ShoppingCart className="w-5 h-5" />
                سبد خرید
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                        {cartCount.toLocaleString('fa-IR')}
                    </span>
                )}
            </button>
          </div>

          {/* Left side: User/Auth & Mobile Mag Link */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Mag Button */}
            <button 
                onClick={() => setActiveTab('mag')}
                className={`md:hidden px-3 py-2 rounded-xl border transition-all flex items-center gap-2 ${activeTab === 'mag' ? 'bg-pharmacy-500 text-white border-pharmacy-500' : 'border-slate-700 text-slate-300'}`}
            >
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-bold">وبلاگ</span>
            </button>

            <div className="hidden md:block w-px h-8 bg-slate-800 mx-2"></div>

            {currentUser ? (
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 md:px-4 py-2 md:py-1.5 rounded-xl md:rounded-xl transition-all border ${activeTab === 'profile' ? 'bg-slate-800 border-pharmacy-500 text-pharmacy-500' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
              >
                <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-pharmacy-600 flex items-center justify-center text-white text-xs md:text-base">
                  {currentUser.firstName[0]}
                </div>
                <span className="text-xs md:text-sm font-bold truncate max-w-[80px] md:max-w-none">
                    {currentUser.firstName}
                </span>
              </button>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 md:px-5 py-3 md:py-2.5 rounded-xl md:rounded-xl border border-slate-700 hover:border-pharmacy-500 transition-all text-xs md:text-sm font-bold shadow-xl active:scale-95 h-full"
              >
                <UserIcon className="w-4 h-4 md:w-4 md:h-4" />
                ورود <span className="hidden sm:inline">| ثبت نام</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
