
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onConsultation: () => void;
  generatedVideoUrl?: string | null;
}

const PHARMACY_IMAGES = [
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/WhatsApp-Image-2023-05-22-at-3.59.24-AM-1.jpeg",
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/WhatsApp-Image-2023-05-22-at-3.59.24-AM.jpeg",
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/photo_5987770536677195117_y.jpg",
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/photo_5987770536677195123_y.jpg",
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/photo_5987770536677195119_y.jpg",
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/photo_5987770536677195120_y.jpg",
  "https://drshamimnasab.ir/wp-content/uploads/2023/06/photo_5987770536677195113_y.jpg"
];

const Hero: React.FC<HeroProps> = ({ onExplore, onConsultation, generatedVideoUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / 600, 1);
      setScrollProgress(progress);
      
      if (containerRef.current) {
        containerRef.current.style.opacity = `${1 - scrolled / 800}`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!generatedVideoUrl) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % PHARMACY_IMAGES.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [generatedVideoUrl]);

  return (
    <div className="relative h-screen landscape:h-auto landscape:min-h-screen w-full overflow-hidden flex items-center justify-center bg-slate-900">
      
      {/* Suspended Floating Logo - REDUCED SIZE AS REQUESTED */}
      <div 
        className="fixed z-[60] pointer-events-none transition-all duration-1000 ease-out will-change-transform landscape:hidden md:landscape:block"
        style={{
          top: scrollProgress > 0.1 ? '1.5rem' : '10%',
          left: '50%',
          transform: `translateX(-50%) scale(${1 - scrollProgress * 0.4})`,
          opacity: 1,
        }}
      >
        <div className="relative animate-float-slow">
          <div className="absolute inset-0 bg-pharmacy-500/20 blur-[25px] rounded-full scale-150 animate-pulse"></div>
          <img 
            src="https://drshamimnasab.ir/wp-content/uploads/2026/01/logoshamimnasab2_2048x725.png" 
            alt="suspended logo" 
            className="w-20 md:w-28 h-auto object-contain brightness-150 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] relative z-10"
          />
        </div>
      </div>

      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        {generatedVideoUrl ? (
          <video src={generatedVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="w-full h-full relative overflow-hidden">
             {PHARMACY_IMAGES.map((img, index) => (
               <div key={img} className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${index === currentImageIndex ? 'opacity-40' : 'opacity-0'}`}>
                 <img src={img} alt={`نمای داروخانه ${index + 1}`} className="w-full h-full object-cover" style={{ transform: index === currentImageIndex ? 'scale(1.1)' : 'scale(1)', transition: 'transform 10s linear' }} />
               </div>
             ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30"></div>
          </div>
        )}
      </div>

      {/* Hero Content - Higher position to clear the scroll indicator */}
      <div ref={containerRef} className="relative z-10 text-center px-8 max-w-4xl mx-auto pt-32 md:pt-40 pb-24">
        <div className="inline-block mb-6 md:mb-8 px-5 py-2 rounded-full border border-pharmacy-500/30 bg-pharmacy-950/40 backdrop-blur-2xl shadow-2xl">
             <span className="text-pharmacy-400 text-[10px] md:text-sm font-bold tracking-widest uppercase">داروخانه تخصصی دکتر شمیم نسب</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white mb-6 md:mb-8 leading-[1.2] md:leading-tight">
          مرکز تخصصی <span className="text-pharmacy-400 drop-shadow-[0_0_25px_rgba(20,184,166,0.6)]">سلامت و زیبایی</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-200 mb-10 md:mb-14 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          مشاوره دارویی و تخصصی با کادری مجرب در محیطی مدرن و حرفه‌ای
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-5 md:gap-8">
            <button 
              onClick={onExplore} 
              className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 md:py-6 bg-pharmacy-500 text-white rounded-[2.5rem] font-black text-xl md:text-2xl hover:bg-pharmacy-600 transition-all duration-500 shadow-[0_25px_50px_-15px_rgba(20,184,166,0.6)] hover:-translate-y-2 active:scale-95 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                ویترین محصولات
                <ArrowDown className="w-6 h-6 group-hover:translate-y-2 transition-transform" />
            </button>
            <button 
              onClick={onConsultation} 
              className="px-10 py-5 md:py-6 border-2 border-slate-600/50 bg-slate-900/30 backdrop-blur-xl text-white rounded-[2.5rem] font-bold text-lg md:text-xl hover:bg-slate-800 hover:border-pharmacy-500 transition-all active:scale-95"
            >
                درخواست مشاوره
            </button>
        </div>
      </div>
      
      {/* Scroll Indicator - Bottom space optimized */}
      <div className={`absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrollProgress > 0.1 ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-8 h-12 md:w-9 md:h-14 border-2 border-slate-500/30 rounded-full flex justify-center p-2 backdrop-blur-sm shadow-xl">
            <div className="w-2 h-3 bg-pharmacy-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
