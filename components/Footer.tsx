
import React from 'react';
import { Phone, MapPin, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 text-right">
          
          {/* Section 1: Logo and Title (Rightmost in RTL) */}
          <div className="space-y-6 lg:col-span-2">
            <div className="inline-block transition-transform hover:scale-105 duration-300">
                <img 
                   src="https://drshamimnasab.ir/wp-content/uploads/2026/01/lorrrrrrrrr.png" 
                   alt="لوگو داروخانه دکتر شمیم نسب" 
                   className="h-40 md:h-48 w-auto object-contain"
                />
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-display border-b border-slate-800 pb-2 inline-block">دسترسی سریع</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="hover:text-pharmacy-500 cursor-pointer transition-colors">درباره ما</li>
              <li className="hover:text-pharmacy-500 cursor-pointer transition-colors">محصولات آرایشی</li>
              <li className="hover:text-pharmacy-500 cursor-pointer transition-colors">مکمل‌های ورزشی</li>
              <li className="hover:text-pharmacy-500 cursor-pointer transition-colors">مشاوره آنلاین</li>
            </ul>
          </div>

          {/* Section 3: Contact Info (Leftmost in RTL grid, but Right Aligned Content) */}
          <div className="text-right">
            <h4 className="text-white font-bold text-lg mb-6 font-display border-b border-slate-800 pb-2 inline-block">تماس با ما</h4>
            
            <div className="space-y-4 text-slate-400 text-sm w-full">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pharmacy-500 shrink-0" />
                <span className="dir-ltr text-pharmacy-400 font-bold tracking-wider">۰۲۱-۲۲۵۷۸۱۸۶</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pharmacy-500 mt-1 shrink-0" />
                <span className="leading-relaxed text-slate-300">
                 خیابان پاسداران خیابان پایدارفرد نبش بوستان نهم پلاک ۱۰۷ مقابل بیمارستان لبافی نژاد
                </span>
              </div>
              <div className="flex gap-4 mt-6">
                <Instagram className="w-6 h-6 hover:text-pink-500 cursor-pointer transition-all hover:scale-110" />
                <Linkedin className="w-6 h-6 hover:text-blue-500 cursor-pointer transition-all hover:scale-110" />
              </div>
            </div>

            {/* Requested Logo addition - Removed Box */}
            <div className="mt-8 transition-all hover:scale-105 group">
                <img 
                   src="https://drshamimnasab.ir/wp-content/uploads/2026/01/logoshamimnasab2_2048x725.png" 
                   alt="لوگو شمیم نسب ثانویه" 
                   className="h-10 md:h-12 w-auto object-contain brightness-125 drop-shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                />
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-900 mt-16 pt-8 text-center text-slate-600 text-[10px] md:text-xs">
          © ۲۰۲۴ Dr. Shamim Nasab Pharmacy. All rights reserved. طراحی شده با عشق برای سلامت جامعه.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
