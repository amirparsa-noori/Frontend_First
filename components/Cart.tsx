
import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onCheckout, onContinueShopping }) => {
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
    <div className="max-w-6xl mx-auto px-4 py-32">
      <h2 className="text-3xl font-display font-bold text-white mb-10 flex items-center gap-3">
        <ShoppingBag className="text-pharmacy-500" />
        سبد خرید شما
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-4 flex items-center gap-4 transition-all hover:border-slate-600">
              <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-white font-bold mb-1 line-clamp-1 text-right">{item.name}</h3>
                <p className="text-slate-500 text-xs mb-2 text-right">{item.category}</p>
                <div className="flex items-center justify-between flex-row-reverse">
                    <span className="text-pharmacy-400 font-bold">{item.price}</span>
                    
                    <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-1 border border-slate-700">
                        <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-bold min-w-[20px] text-center">{item.quantity}</span>
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
                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sticky top-28">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4 text-right font-display">خلاصه سفارش</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between flex-row-reverse text-slate-400">
                <span>تعداد اقلام:</span>
                <span>{items.reduce((a, b) => a + b.quantity, 0)} کالا</span>
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
                onClick={onCheckout}
                className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-pharmacy-500/20 transition-all flex items-center justify-center gap-3"
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
    </div>
  );
};

export default Cart;
