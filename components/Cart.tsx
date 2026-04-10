
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, AlertTriangle, Info, Thermometer, CheckCircle, ChevronLeft, ChevronRight as ChevronRightIcon, X } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onOpenProduct?: (product: CartItem) => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onCheckout, onContinueShopping, onOpenProduct }) => {
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
            const itemPrice = parsePersianPrice(item.price);
            const priceDisplay = itemPrice.toLocaleString('fa-IR');

            return (
              <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-4 flex items-center gap-4 transition-all hover:border-slate-600">
                <div
                  onClick={() => onOpenProduct?.(item)}
                  className={`w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 ${onOpenProduct ? 'cursor-pointer hover:ring-2 hover:ring-pharmacy-500/50 transition-all' : ''}`}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div
                    onClick={() => onOpenProduct?.(item)}
                    className={onOpenProduct ? 'cursor-pointer mb-4' : 'mb-4'}
                  >
                    <h3 className="text-white font-bold mb-1 line-clamp-1 text-right text-base md:text-lg hover:text-pharmacy-400 transition-colors">{item.name}</h3>
                    <p className="text-slate-500 text-xs text-right">{item.category}</p>
                  </div>
                  
                  <div className="flex items-end justify-between flex-row-reverse" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col items-end mr-4">
                          <span className="text-xl md:text-2xl text-pharmacy-400 font-bold leading-none inline-flex items-center gap-1.5">
                            {priceDisplay}
                            <img src="/toman-logo.png" alt="تومان" className="h-3.5 w-auto object-contain opacity-90" />
                          </span>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-1 border border-slate-700">
                          <button 
                              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, -1); }}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                              <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-bold min-w-[20px] text-center">{item.quantity.toLocaleString('fa-IR')}</span>
                          <button 
                              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, 1); }}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                              <Plus className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
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
                <span className="inline-flex items-center gap-1">
                  {subtotal.toLocaleString('fa-IR')}
                  <img src="/toman-logo.png" alt="تومان" className="h-3 w-auto object-contain opacity-80" />
                </span>
              </div>
              <div className="flex justify-between flex-row-reverse text-slate-400">
                <span>هزینه ارسال:</span>
                <span className="text-green-500">رایگان</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6 mb-8">
              <div className="flex flex-col gap-2">
                <span className="text-white font-bold text-xl">مبلغ قابل پرداخت:</span>
                <span className="text-pharmacy-400 font-bold text-xl flex items-center gap-2">
                  <span className="tabular-nums">{subtotal.toLocaleString('fa-IR')}</span>
                  <img src="/toman-logo.png" alt="تومان" className="h-3.5 w-auto object-contain opacity-90 shrink-0" />
                </span>
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

      {/* --- Safety Check Modal (clean layout) --- */}
      {showSafetyCheck && itemsNeedingCheck.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 p-3 sm:p-4">
          <div className="w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl shadow-black/40 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 border-b border-slate-800 shrink-0">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0 text-right">
                  <div className="shrink-0 w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">تایید هشدارهای ایمنی</h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      قبل از پرداخت، هر محصول را بخوانید و تایید کنید
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSafetyCheck(false)}
                  className="shrink-0 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>مرحله {currentSafetyIndex + 1} از {itemsNeedingCheck.length}</span>
                  <span>{Math.round(((currentSafetyIndex + 1) / itemsNeedingCheck.length) * 100)}٪</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-pharmacy-500 to-pharmacy-400 transition-all duration-500 ease-out"
                    style={{ width: `${((currentSafetyIndex + 1) / itemsNeedingCheck.length) * 100}%` }}
                  />
                </div>
                <div className="flex gap-1.5 justify-center flex-wrap pt-1">
                  {itemsNeedingCheck.map((it, idx) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setCurrentSafetyIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentSafetyIndex ? 'w-8 bg-pharmacy-500' : confirmedProductIds.includes(it.id) ? 'w-2 bg-emerald-600' : 'w-2 bg-slate-600'
                      }`}
                      aria-label={`محصول ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {(() => {
                const currentItem = itemsNeedingCheck[currentSafetyIndex];
                return (
                  <div
                    key={currentItem.id}
                    className="p-4 sm:p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {/* Product row */}
                    <div className="flex flex-row-reverse items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white rounded-2xl p-2 shadow-inner">
                        <img src={currentItem.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-xs text-pharmacy-400 font-medium mb-1">{currentItem.brand}</p>
                        <h4 className="text-base sm:text-lg font-bold text-white leading-snug">{currentItem.name}</h4>
                      </div>
                    </div>

                    {/* Info cards — full readable height */}
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-4 sm:p-5">
                        <h5 className="flex flex-row-reverse items-center gap-2 text-rose-300 font-bold text-sm mb-3">
                          <span>هشدار مصرف</span>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        </h5>
                        <p className="text-slate-300 text-sm leading-7 text-right">
                          {currentItem.details?.warnings || 'مورد خاصی ذکر نشده است.'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-sky-500/25 bg-sky-950/15 p-4 sm:p-5">
                        <h5 className="flex flex-row-reverse items-center gap-2 text-sky-300 font-bold text-sm mb-3">
                          <span>روش مصرف</span>
                          <Info className="w-4 h-4 shrink-0" />
                        </h5>
                        <p className="text-slate-300 text-sm leading-7 text-right">
                          {currentItem.details?.usage || 'طبق دستور پزشک یا داروساز مصرف شود.'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-4 sm:p-5">
                        <h5 className="flex flex-row-reverse items-center gap-2 text-amber-300 font-bold text-sm mb-3">
                          <span>شرایط نگهداری</span>
                          <Thermometer className="w-4 h-4 shrink-0" />
                        </h5>
                        <p className="text-slate-300 text-sm leading-7 text-right">
                          {currentItem.details?.storage || 'دور از نور مستقیم، رطوبت و دسترس اطفال نگهداری شود.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer actions */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 shrink-0 space-y-3">
              <button
                type="button"
                onClick={() => handleConfirmItem(itemsNeedingCheck[currentSafetyIndex].id)}
                disabled={confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id)}
                className={`w-full flex flex-row-reverse items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all ${
                  confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id)
                    ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-slate-800 text-white border border-slate-600 hover:border-pharmacy-500 hover:bg-slate-800/80'
                }`}
              >
                {confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id) ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>این مورد تایید شد</span>
                  </>
                ) : (
                  <>
                    <span>مطالعه کردم و تایید می‌کنم</span>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-500 shrink-0" />
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allConfirmed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSafetyCheck(false);
                      onCheckout();
                    }}
                    className="sm:col-span-2 w-full bg-pharmacy-500 hover:bg-pharmacy-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pharmacy-500/25 transition-all flex flex-row-reverse items-center justify-center gap-2"
                  >
                    <span>ادامه به تسویه حساب</span>
                    <CheckCircle className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentSafetyIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentSafetyIndex === 0}
                      className="w-full flex flex-row-reverse items-center justify-center gap-2 py-3 rounded-2xl border border-slate-600 text-slate-300 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                      قبلی
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSafetyIndex((prev) => Math.min(itemsNeedingCheck.length - 1, prev + 1))}
                      disabled={!confirmedProductIds.includes(itemsNeedingCheck[currentSafetyIndex].id)}
                      className="w-full flex flex-row-reverse items-center justify-center gap-2 py-3 rounded-2xl bg-slate-700 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                    >
                      بعدی
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </>
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
