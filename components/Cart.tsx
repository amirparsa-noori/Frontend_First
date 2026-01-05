
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, AlertTriangle, Info, Thermometer, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onCheckout, onContinueShopping }) => {
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [confirmedProductIds, setConfirmedProductIds] = useState<number[]>([]);
  const [currentSafetyIndex, setCurrentSafetyIndex] = useState(0);

  // Filter items that actually have details to check
  const itemsNeedingCheck = items.filter(item => item.details);

  // --- Scroll Lock Effect ---
  useEffect(() => {
    if (showSafetyCheck) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSafetyCheck]);

  const handleCheckoutClick = () => {
    // If there are items with details that haven't been confirmed yet
    if (itemsNeedingCheck.length > 0 && itemsNeedingCheck.some(item => !confirmedProductIds.includes(item.id))) {
      setCurrentSafetyIndex(0); // Reset to start
      setShowSafetyCheck(true);
    } else {
      onCheckout();
    }
  };

  const handleConfirmItem = (id: number) => {
    if (!confirmedProductIds.includes(id)) {
      setConfirmedProductIds(prev => [...prev, id]);
    }
    // Auto advance if not last
    if (currentSafetyIndex < itemsNeedingCheck.length - 1) {
        setTimeout(() => setCurrentSafetyIndex(prev => prev + 1), 300);
    }
  };

  // Check if all needed items are confirmed
  const allConfirmed = itemsNeedingCheck.every(item => confirmedProductIds.includes(item.id));

  // Enhanced helper to convert Persian digits to English for correct parsing
  const parsePersianPrice = (priceStr: string) => {
    if (!priceStr) return 0;
    
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    
    let cleanStr = priceStr;
    // Replace Persian digits with English digits
    for (let i = 0; i < 10; i++) {
      cleanStr = cleanStr.split(persianDigits[i]).join(englishDigits[i]);
    }
    
    // Remove all non-digit characters except the resulting English numbers
    const numericOnly = cleanStr.replace(/[^0-9]/g, '');
    return parseInt(numericOnly, 10) || 0;
  };

  const subtotal = items.reduce((acc, item) => {
    const price = parsePersianPrice(item.price);
    return acc + price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <div className="bg-slate-800/50 rounded-3xl p-12 border border-slate-700 border-dashed">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">سبد خرید شما خالی است</h2>
            <p className="text-slate-400 mb-8">هنوز هیچ محصولی به سبد خرید خود اضافه نکرده‌اید.</p>
            <button 
                onClick={onContinueShopping} 
                className="bg-pharmacy-500 hover:bg-pharmacy-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-pharmacy-500/20 active:scale-95"
            >
                مشاهده محصولات
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-32 relative">
      <h2 className="text-3xl font-display font-bold text-white mb-10 flex items-center gap-3">
        <ShoppingBag className="text-pharmacy-500" />
        سبد خرید شما
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const priceParts = item.price.split(' ');
            const priceValue = priceParts[0];
            const priceCurrency = priceParts.length > 1 ? priceParts.slice(1).join(' ') : 'تومان';

            return (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-4 flex items-center gap-4 transition-all hover:border-slate-600">
                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-white font-bold mb-1 line-clamp-1 text-right text-base md:text-lg">{item.name}</h3>
                  <p className="text-slate-500 text-xs mb-4 text-right">{item.category}</p>
                  
                  <div className="flex items-end justify-between flex-row-reverse">
                      <div className="flex flex-col items-end mr-4">
                          <span className="text-xl md:text-2xl text-pharmacy-400 font-bold leading-none">{priceValue}</span>
                          <span className="text-xs text-slate-500 mt-1">{priceCurrency}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-1 border border-slate-700">
                          <button 
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                              <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-bold min-w-[20px] text-center">{item.quantity.toLocaleString('fa-IR')}</span>
                          <button 
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                              <Plus className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                </div>

                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors self-start mt-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sticky top-28">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4 text-right font-display">خلاصه سفارش</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between flex-row-reverse text-slate-400">
                <span>تعداد اقلام:</span>
                <span>{items.reduce((a, b) => a + b.quantity, 0).toLocaleString('fa-IR')} کالا</span>
              </div>
              <div className="flex justify-between flex-row-reverse text-slate-400">
                <span>جمع کل:</span>
                <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between flex-row-reverse text-slate-400">
                <span>هزینه ارسال:</span>
                <span className="text-green-500">رایگان</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mb-8">
              <div className="flex justify-between flex-row-reverse text-white font-bold text-xl">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-pharmacy-400">{subtotal.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>

            <button 
                onClick={handleCheckoutClick}
                className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pharmacy-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
                <CreditCard className="w-5 h-5" />
                تکمیل فرایند خرید
            </button>
            
            <p className="text-[10px] text-slate-500 text-center mt-4 leading-relaxed">
                با کلیک بر روی دکمه بالا، با قوانین و مقررات داروخانه موافقت می‌کنید.
            </p>
          </div>
        </div>
      </div>

      {/* --- Safety Check Slideshow Modal (Compact & Responsive) --- */}
      {showSafetyCheck && itemsNeedingCheck.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300 px-4">
          <div className="w-full max-w-5xl bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative flex flex-col overflow-hidden max-h-[85vh]">
            
            {/* Compact Header */}
            <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 sticky top-0 z-10 shrink-0">
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-pharmacy-500/10 p-1.5 md:p-2 rounded-xl text-pharmacy-500">
                     <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm md:text-lg font-bold text-white">بررسی ایمنی</h3>
                     <span className="text-slate-400 text-[10px] md:text-xs block">
                         محصول {currentSafetyIndex + 1} از {itemsNeedingCheck.length}
                     </span>
                  </div>
               </div>
               <button onClick={() => setShowSafetyCheck(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Compact Content Area with Animation Key */}
            <div className="flex-grow overflow-hidden relative">
            {(() => {
                 const currentItem = itemsNeedingCheck[currentSafetyIndex];
                 return (
                   <div 
                        key={currentItem.id} // CRITICAL FOR ANIMATION
                        className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-8 animate-in fade-in slide-in-from-right-8 duration-500"
                   >
                      {/* Left: Compact Product Info */}
                      <div className="w-full md:w-1/3 flex md:flex-col items-center md:items-start gap-4 shrink-0 bg-slate-800/30 p-4 rounded-2xl border border-slate-800 h-fit">
                          <div className="w-20 h-20 md:w-full md:h-48 bg-white rounded-xl md:rounded-2xl p-2 shadow-lg flex-shrink-0 mx-auto">
                              <img src={currentItem.image} alt={currentItem.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="text-right flex-grow w-full">
                              <h4 className="text-sm md:text-xl font-bold text-white mb-1 md:mb-2 leading-tight">{currentItem.name}</h4>
                              <span className="text-[10px] md:text-sm text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg inline-block">{currentItem.brand}</span>
                          </div>
                      </div>

                      {/* Right: Critical Details (Grid Layout for Compactness) */}
                      <div className="w-full md:w-2/3 grid grid-cols-1 gap-3 content-start">
                          
                          {/* Card 1: Warning */}
                          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-3 md:p-4 flex flex-col">
                              <h5 className="flex items-center gap-2 text-rose-400 font-bold text-xs md:text-sm mb-1.5">
                                  <AlertTriangle className="w-4 h-4" />
                                  هشدار مصرف
                              </h5>
                              <div className="max-h-20 md:max-h-none overflow-y-auto custom-scrollbar">
                                <p className="text-slate-300 text-xs md:text-sm leading-relaxed text-justify">
                                    {currentItem.details?.warnings || "مورد خاصی ذکر نشده است."}
                                </p>
                              </div>
                          </div>

                          {/* Card 2: Usage */}
                          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-3 md:p-4 flex flex-col">
                              <h5 className="flex items-center gap-2 text-blue-400 font-bold text-xs md:text-sm mb-1.5">
                                  <Info className="w-4 h-4" />
                                  روش مصرف
                              </h5>
                              <div className="max-h-20 md:max-h-none overflow-y-auto custom-scrollbar">
                                <p className="text-slate-300 text-xs md:text-sm leading-relaxed text-justify">
                                    {currentItem.details?.usage || "طبق دستور پزشک مصرف شود."}
                                </p>
                              </div>
                          </div>

                          {/* Card 3: Storage */}
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 md:p-4 flex flex-col">
                              <h5 className="flex items-center gap-2 text-amber-400 font-bold text-xs md:text-sm mb-1.5">
                                  <Thermometer className="w-4 h-4" />
                                  شرایط نگهداری
                              </h5>
                              <div className="max-h-20 md:max-h-none overflow-y-auto custom-scrollbar">
                                <p className="text-slate-300 text-xs md:text-sm leading-relaxed text-justify">
                                    {currentItem.details?.storage || "دور از نور و رطوبت نگهداری شود."}
                                </p>
                              </div>
                          </div>
                      </div>
                   </div>
                 );
            })()}
            </div>

            {/* Compact Footer / Controls */}
            <div className="px-4 py-3 md:px-6 md:py-4 border-t border-slate-800 bg-slate-900 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
               
               {/* Progress Dots (Desktop) */}
               <div className="hidden md:flex gap-1.5">
                    {itemsNeedingCheck.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSafetyIndex ? 'w-6 bg-pharmacy-500' : 'w-1.5 bg-slate-700'}`}></div>
                    ))}
               </div>

               <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                   {/* Confirmation Button */}
                   <button 
                      onClick={() => handleConfirmItem(itemsNeedingCheck[currentSafetyIndex].id)}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all w-full md:w-auto text-sm md:text-base ${
                          confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id)
                          ? 'bg-emerald-600/90 text-white shadow-lg cursor-default border border-transparent'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-pharmacy-500 hover:text-white'
                      }`}
                   >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id) ? 'border-white bg-white/20' : 'border-slate-500'
                      }`}>
                          {confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id) && <CheckCircle className="w-3 h-3" />}
                      </div>
                      <span className="font-bold">مطالعه کردم و تایید می‌کنم</span>
                   </button>

                   {/* Next/Finish Button */}
                   {allConfirmed ? (
                        <button 
                            onClick={onCheckout}
                            className="w-full md:w-auto bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-pharmacy-500/20 transition-all flex items-center justify-center gap-2 animate-pulse text-sm md:text-base"
                        >
                            تکمیل خرید
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentSafetyIndex(prev => Math.min(itemsNeedingCheck.length - 1, prev + 1))}
                            disabled={currentSafetyIndex === itemsNeedingCheck.length - 1 || !confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-700 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors text-sm md:text-base"
                        >
                            بعدی
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    )}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
