
import React, { useState } from 'react';
import { User, Address, ShippingMethod, PaymentMethod, CartItem } from '../types';
import { Check, Truck, Zap, MapPin, CreditCard, ChevronLeft, ChevronRight, Package, Store, Clock } from 'lucide-react';

interface CheckoutWizardProps {
  items: CartItem[];
  user: User;
  onComplete: (data: any) => void;
  onCancel: () => void;
  onAddAddress: () => void;
}

const CheckoutWizard: React.FC<CheckoutWizardProps> = ({ items, user, onComplete, onCancel, onAddAddress }) => {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>(user.addresses[0]?.id || '');
  const [shipping, setShipping] = useState<ShippingMethod>(ShippingMethod.JET);
  const [payment, setPayment] = useState<PaymentMethod>(PaymentMethod.ZARINPAL);

  const subtotal = items.reduce((acc, item) => {
    const parsePersianPrice = (str: string) => {
      const p = '۰۱۲۳۴۵۶۷۸۹';
      const e = '0123456789';
      let res = str;
      for (let i = 0; i < 10; i++) res = res.split(p[i]).join(e[i]);
      return parseInt(res.replace(/\D/g, ''), 10) || 0;
    };
    return acc + parsePersianPrice(item.price) * item.quantity;
  }, 0);

  const shippingPrice = shipping === ShippingMethod.JET ? 70000 : (shipping === ShippingMethod.POST ? 45000 : 0);
  const total = subtotal + shippingPrice;

  const steps = [
    { id: 1, title: 'آدرس ارسال' },
    { id: 2, title: 'روش ارسال' },
    { id: 3, title: 'روش پرداخت' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-32">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                step >= s.id ? 'bg-pharmacy-500 border-pharmacy-500 text-white' : 'border-slate-700 text-slate-500'
              }`}>
                {step > s.id ? <Check className="w-5 h-5" /> : s.id}
              </div>
              <span className={`text-xs ${step >= s.id ? 'text-white' : 'text-slate-500'}`}>{s.title}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-pharmacy-500 transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl min-h-[500px] flex flex-col">
        {/* Step 1: Address */}
        {step === 1 && (
          <div className="flex-grow animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-pharmacy-500" />
              کجا برات بفرستیم؟
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-6 rounded-2xl cursor-pointer border-2 transition-all ${
                    selectedAddress === addr.id ? 'border-pharmacy-500 bg-pharmacy-500/10 shadow-lg' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-white">{addr.title}</span>
                    {selectedAddress === addr.id && <Check className="w-5 h-5 text-pharmacy-500" />}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-2">{addr.fullAddress}</p>
                  <span className="text-xs text-slate-500">{addr.postalCode}</span>
                </div>
              ))}
              <div 
                onClick={onAddAddress}
                className="p-6 rounded-2xl cursor-pointer border-2 border-dashed border-slate-700 hover:border-pharmacy-500 hover:bg-pharmacy-500/5 flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <MapPin className="w-8 h-8 text-slate-600 group-hover:text-pharmacy-500" />
                <span className="text-slate-500 group-hover:text-white">افزودن آدرس جدید</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === 2 && (
          <div className="flex-grow animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Truck className="text-pharmacy-500" />
              انتخاب روش ارسال
            </h3>
            <div className="space-y-4">
              {/* JET Delivery */}
              <div 
                onClick={() => setShipping(ShippingMethod.JET)}
                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-6 ${
                  shipping === ShippingMethod.JET ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-lg">جت (ارسال فوری داروخانه)</span>
                    <span className="text-pharmacy-400 font-bold">۷۰,۰۰۰ تومان</span>
                  </div>
                  <p className="text-sm text-slate-400">مخصوص شهر تهران - تحویل در کمتر از ۲ ساعت</p>
                </div>
                {shipping === ShippingMethod.JET && <Check className="w-6 h-6 text-pharmacy-500" />}
              </div>

              {/* POST Delivery */}
              <div 
                onClick={() => setShipping(ShippingMethod.POST)}
                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-6 ${
                  shipping === ShippingMethod.POST ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-lg">پست دارویی</span>
                    <span className="text-pharmacy-400 font-bold">۴۵,۰۰۰ تومان</span>
                  </div>
                  <p className="text-sm text-slate-400">ارسال به تمام نقاط کشور - تحویل ۲ تا ۴ روز کاری</p>
                </div>
                {shipping === ShippingMethod.POST && <Check className="w-6 h-6 text-pharmacy-500" />}
              </div>

              {/* PICKUP */}
              <div 
                onClick={() => setShipping(ShippingMethod.PICKUP)}
                className={`p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-6 ${
                  shipping === ShippingMethod.PICKUP ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <Store className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-lg">مراجعه حضوری</span>
                    <span className="text-green-500 font-bold">رایگان</span>
                  </div>
                  <p className="text-sm text-slate-400">دریافت مستقیم از پیشخوان داروخانه دکتر شمیم نسب</p>
                </div>
                {shipping === ShippingMethod.PICKUP && <Check className="w-6 h-6 text-pharmacy-500" />}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="flex-grow animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-pharmacy-500" />
              روش پرداخت
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: PaymentMethod.ZARINPAL, name: 'زرین پال', desc: 'امن و سریع', color: 'bg-yellow-600' },
                { id: PaymentMethod.SAMAN, name: 'بانک سامان', desc: 'درگاه مستقیم سامان', color: 'bg-blue-600' },
                { id: PaymentMethod.MELLAT, name: 'بانک ملت', desc: 'درگاه مستقیم بهسازان', color: 'bg-red-600' }
              ].map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setPayment(p.id as PaymentMethod)}
                  className={`p-6 rounded-3xl cursor-pointer border-2 transition-all text-center flex flex-col items-center gap-4 ${
                    payment === p.id ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 ${p.color} rounded-2xl shadow-xl flex items-center justify-center text-white font-black`}>
                    {p.name[0]}
                  </div>
                  <div>
                    <span className="block font-bold text-white">{p.name}</span>
                    <span className="text-xs text-slate-500">{p.desc}</span>
                  </div>
                  {payment === p.id && <div className="bg-pharmacy-500 text-white rounded-full p-1"><Check className="w-4 h-4" /></div>}
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-900/50 rounded-3xl border border-slate-700">
              <div className="flex justify-between items-center mb-4 text-slate-400">
                <span>جمع کل اقلام:</span>
                <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-slate-400">
                <span>هزینه ارسال ({shipping === ShippingMethod.JET ? 'جت' : 'پست'}):</span>
                <span>{shippingPrice.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700 pt-4">
                <span className="text-xl font-bold text-white">مبلغ نهایی:</span>
                <span className="text-3xl font-display text-pharmacy-400">{total.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-800 mt-8">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
              مرحله قبل
            </button>
          ) : (
            <button onClick={onCancel} className="text-slate-500 hover:text-red-500 transition-colors">لغو خرید</button>
          )}

          <button 
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onComplete({ selectedAddress, shipping, payment, total });
            }}
            disabled={step === 1 && !selectedAddress}
            className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-3 ${
              step === 3 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-pharmacy-500 hover:bg-pharmacy-400 text-white shadow-pharmacy-500/20'
            } disabled:opacity-50 disabled:grayscale`}
          >
            {step === 3 ? 'تکمیل و پرداخت نهایی' : 'ادامه فرآیند'}
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWizard;
