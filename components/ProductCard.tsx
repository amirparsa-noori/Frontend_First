
import React from 'react';
import { Product } from '../types';
import { Star, Heart, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  cartQuantity: number;
  onUpdateQuantity: (id: number, delta: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onQuickView,
  cartQuantity,
  onUpdateQuantity
}) => {
  const getNumericPrice = (priceStr: string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    let cleanStr = priceStr;
    for (let i = 0; i < 10; i++) {
      cleanStr = cleanStr.split(persianDigits[i]).join(englishDigits[i]);
    }
    return parseInt(cleanStr.replace(/[^0-9]/g, ''), 10) || 0;
  };

  const numericPrice = getNumericPrice(product.price);
  const discountPercent = 15;
  const oldPrice = Math.round(numericPrice / (1 - discountPercent / 100));

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group relative bg-slate-800 rounded-3xl md:rounded-[2.5rem] overflow-hidden border border-slate-700 transition-all duration-300 ease-out hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.5)] md:hover:-translate-y-2 hover:border-pharmacy-500/40 flex flex-col h-full cursor-pointer"
    >
      
      {/* Image Container */}
      <div className="relative h-48 md:h-64 overflow-hidden bg-white">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain p-4 transition-transform duration-700 md:group-hover:scale-110"
        />
        
        {/* Favorite Button */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                }}
                className={`p-2.5 md:p-3 rounded-full transition-all duration-300 shadow-xl flex items-center justify-center ${
                    isFavorite 
                    ? 'bg-rose-500 text-white shadow-rose-500/40' 
                    : 'bg-slate-900/10 backdrop-blur-md text-slate-500 border border-slate-200/20 hover:bg-rose-500 hover:text-white'
                }`}
            >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
            </button>
        </div>

        {/* Discount Badge (Desktop only in this position) */}
        <div className="hidden md:block absolute top-4 right-4 z-20">
          <div className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-xl shadow-lg">
            {discountPercent.toLocaleString('fa-IR')}٪ تخفیف
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6 flex-grow flex flex-col justify-between bg-gradient-to-b from-slate-800 to-slate-900">
        <div>
            <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}`} />
                ))}
                <span className="text-[10px] md:text-xs text-slate-500 mr-2">(۱۲ نظر)</span>
            </div>
            
            {/* Changed font-bold to font-normal as requested */}
            <h3 className="text-base md:text-xl font-normal font-display text-white mb-2 line-clamp-1 group-hover:text-pharmacy-400 transition-colors">
              {product.name}
            </h3>
            
            {/* Description: Hidden on mobile per request */}
            <p className="hidden md:block text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed h-10">
              {product.description}
            </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-2">
            <div className="flex flex-col">
                <span className="text-[10px] md:text-xs text-slate-500 line-through decoration-red-500/50 decoration-1 mb-0.5 font-sans">
                    {oldPrice.toLocaleString('fa-IR')}
                </span>
                {/* font-sans used for price as requested for "lighter" feel */}
                <span className="text-lg md:text-xl font-bold text-pharmacy-400 font-sans leading-none tracking-tight">
                  {product.price}
                </span>
            </div>
            
            {/* Mobile Actions: Show Discount Badge in place of the buy button */}
            <div className="md:hidden">
                <div className="bg-red-600/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    {discountPercent.toLocaleString('fa-IR')}٪ تخفیف
                </div>
            </div>

            {/* Desktop Actions: Show buy button or quantity picker */}
            <div className="hidden md:block">
              {cartQuantity === 0 ? (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    className="text-sm font-bold text-white bg-pharmacy-600 hover:bg-pharmacy-500 px-5 py-2.5 rounded-xl transition-all active:scale-90 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>خرید</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-1.5 shadow-inner">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.id, -1); }} 
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Minus className="w-4 h-4"/>
                    </button>
                    {/* font-sans used for quantity as requested */}
                    <span className="text-white font-bold min-w-[20px] text-center font-sans">
                      {cartQuantity.toLocaleString('fa-IR')}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.id, 1); }} 
                      className="text-pharmacy-500 hover:text-white p-1"
                    >
                      <Plus className="w-4 h-4"/>
                    </button>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
