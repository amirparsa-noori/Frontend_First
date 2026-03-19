
import React from 'react';
import { Product } from '../types';
import { Heart, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  cartQuantity: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  reviewCount?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onQuickView,
  cartQuantity,
  onUpdateQuantity,
  reviewCount = 12 // Default to 12 if not provided to keep UI consistent
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
  const priceDisplay = numericPrice.toLocaleString('fa-IR');
  const tomanLogo = '/toman-logo.png';

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group relative bg-slate-800 rounded-2xl md:rounded-3xl overflow-hidden border border-slate-700 transition-all duration-300 ease-out hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.5)] md:hover:-translate-y-2 hover:border-pharmacy-500/40 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 md:h-44 overflow-hidden bg-white shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain p-3 md:p-4 transition-transform duration-700 md:group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-2 rounded-full transition-all shadow-lg flex items-center justify-center ${
              isFavorite ? 'bg-rose-500 text-white' : 'bg-slate-900/20 backdrop-blur text-slate-500 border border-slate-200/20 hover:bg-rose-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="hidden sm:block absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
          <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-lg">
            {discountPercent.toLocaleString('fa-IR')}٪ تخفیف
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-3 bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Brand */}
        <div className="flex justify-end">
          <span className="text-xs sm:text-sm text-pharmacy-400 bg-pharmacy-900/40 px-3 py-1.5 rounded-lg min-h-[2rem] flex items-center justify-center max-w-[8rem] sm:max-w-[10rem] truncate">
            {product.brand}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-display text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-pharmacy-400 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/60">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm text-slate-500 line-through decoration-red-500/50">
              {Math.round(oldPrice).toLocaleString('fa-IR')}
            </span>
            <span className="text-lg sm:text-xl font-bold text-pharmacy-400 font-sans inline-flex items-center gap-1.5 mt-0.5">
              {priceDisplay}
              <img src={tomanLogo} alt="تومان" className="h-2.5 sm:h-3 w-auto object-contain opacity-90" />
            </span>
          </div>
          <div className="sm:hidden shrink-0">
            <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
              {discountPercent.toLocaleString('fa-IR')}٪
            </span>
          </div>
        </div>

        {/* Buy / Quantity */}
        {cartQuantity === 0 ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full text-sm font-bold text-white bg-pharmacy-600 hover:bg-pharmacy-500 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-pharmacy-600/20 mt-0.5"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>خرید</span>
          </button>
        ) : (
          <div className="w-full flex items-center justify-between bg-slate-700/50 border border-slate-600 rounded-2xl px-3 py-2">
            <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.id, -1); }} className="text-slate-400 hover:text-white p-1 transition-colors">
              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-white font-bold text-sm sm:text-base font-sans min-w-[1.5rem] text-center">
              {cartQuantity.toLocaleString('fa-IR')}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(product.id, 1); }} className="text-pharmacy-500 hover:text-white p-1 transition-colors">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
