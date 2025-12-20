
import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Heart, Share2, Star, Check, ShieldCheck, Truck, Plus, Minus, Trash2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  cartQuantity: number;
  onUpdateQuantity: (id: number, delta: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  isFavorite, 
  onToggleFavorite,
  cartQuantity,
  onUpdateQuantity
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-8 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Modal Container: Fullscreen on mobile, centered on desktop */}
      <div className="bg-slate-900 border-none md:border md:border-slate-800 w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button - Responsive Position */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-[160] p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 backdrop-blur-md"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Left: Image Gallery - Adapts to Landscape */}
        <div className="w-full md:w-1/2 p-4 md:p-10 flex flex-col gap-4 bg-white overflow-hidden shrink-0 h-[40vh] md:h-auto landscape:h-[100vh] landscape:w-[40%] md:landscape:w-1/2">
          <div className="relative flex-grow flex items-center justify-center">
            <img 
              src={images[activeImageIndex]} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain transition-all duration-500 transform hover:scale-105"
            />
            <div className="absolute top-0 right-0 flex flex-col gap-1 md:gap-2">
              <span className="bg-pharmacy-500 text-white text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">جدید</span>
              <span className="bg-slate-900 text-white text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">{product.category}</span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex justify-center gap-2 md:gap-3 mt-auto overflow-x-auto py-1 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx ? 'border-pharmacy-500 shadow-md' : 'border-slate-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info - Scrollable on small heights */}
        <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto text-right flex flex-col landscape:w-[60%] md:landscape:w-1/2">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 md:w-4 md:h-4 ${s <= 4 ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}`} />
              ))}
            </div>
            <span className="text-slate-500 text-[10px] md:text-xs">(۴.۸ از ۱۲ نظر)</span>
          </div>

          <h2 className="text-xl md:text-4xl font-display font-bold text-white mb-4 md:mb-6 leading-tight">
            {product.name}
          </h2>

          <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
            <p className="text-slate-300 text-sm md:text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-pharmacy-500" />
                <span>ضمانت اصالت کالا</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-pharmacy-500" />
                <span>تاییدیه وزارت بهداشت</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                <Truck className="w-4 h-4 md:w-5 md:h-5 text-pharmacy-500" />
                <span>ارسال سریع</span>
              </div>
            </div>
          </div>

          {/* Price and Actions - Sticky on mobile bottom if needed */}
          <div className="border-t border-slate-800 pt-6 md:pt-8 mt-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-slate-500 text-sm md:text-lg line-through decoration-red-500/30">
                    {oldPrice.toLocaleString('fa-IR')}
                  </span>
                  <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-md">
                    {discountPercent.toLocaleString('fa-IR')}٪
                  </span>
                </div>
                <span className="text-2xl md:text-4xl font-display text-pharmacy-400 leading-none">
                  {product.price}
                </span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={onToggleFavorite}
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border ${
                    isFavorite 
                    ? 'bg-rose-500 border-rose-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
                  <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {cartQuantity === 0 ? (
              <button 
                onClick={() => onAddToCart(product)}
                className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 md:py-5 rounded-xl md:rounded-[1.5rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-pharmacy-500/20 active:scale-95 text-lg md:text-xl"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                افزودن به سبد خرید
              </button>
            ) : (
              <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl md:rounded-[1.5rem] p-1.5 md:p-2 gap-4">
                <button 
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  className="bg-pharmacy-500 hover:bg-pharmacy-600 text-white p-3 md:p-4 rounded-lg md:rounded-2xl transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-white text-lg md:text-2xl font-bold">{cartQuantity.toLocaleString('fa-IR')}</span>
                  <span className="text-slate-500 text-[10px]">در سبد</span>
                </div>
                <button 
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  className="bg-slate-700 hover:bg-slate-600 text-white p-3 md:p-4 rounded-lg md:rounded-2xl transition-all active:scale-95"
                >
                  {cartQuantity === 1 ? <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-rose-500" /> : <Minus className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
