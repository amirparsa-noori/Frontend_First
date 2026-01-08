
import React, { useState } from 'react';
import { User, Address, ShippingMethod, PaymentMethod, CartItem } from '../types';
import { Check, Truck, Zap, MapPin, CreditCard, ChevronLeft, ChevronRight, Package, Wallet, Calendar } from 'lucide-react';

interface CheckoutWizardProps {
  items: CartItem[];
  user: User;
  onComplete: (data: any) => void;
  onCancel: () => void;
  onAddAddress: () => void;
}

const toPersianDigits = (num: string | number) => {
  return num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

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
    { id: 1, title: 'آدرس', icon: MapPin },
    { id: 2, title: 'ارسال', icon: Truck },
    { id: 3, title: 'پرداخت', icon: CreditCard }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-20 md:py-32 min-h-[calc(100vh-80px)] flex flex-col">
      {/* Progress Bar - With Icons */}
      <div className="mb-8 md:mb-12 shrink-0 relative z-10">
        <div className="flex items-start justify-between mb-2 relative">
           {/* Dotted Line Background (Updated Alignment) */}
           <div className="absolute top-5 md:top-7 left-0 right-0 border-t-2 border-dotted border-slate-700 -z-20 transform -translate-y-1/2 h-0"></div>
           
           {/* Progress Line (Solid - Updated Alignment) */}
           <div 
            className="absolute top-5 md:top-7 right-0 h-1 bg-pharmacy-500 rounded-full -z-10 transform -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.id;
            const isCompleted = step > s.id;
            
            return (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold border-4 transition-all bg-slate-900 ${
                isActive ? 'border-pharmacy-500 text-pharmacy-500 shadow-lg shadow-pharmacy-500/20' : 'border-slate-700 text-slate-500'
              } ${isCompleted ? 'bg-pharmacy-500 !text-white !border-pharmacy-500' : ''}`}>
                {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <span className={`text-[10px] md:text-sm font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{s.title}</span>
            </div>
          )})}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-800 rounded-[2rem] p-4 md:p-8 backdrop-blur-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
        {/* Step 1: Address */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2 text-white">
              <MapPin className="text-pharmacy-500 w-6 h-6" />
              کجا برات بفرستیم؟
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-5 rounded-3xl cursor-pointer border-2 transition-all relative overflow-hidden ${
                    selectedAddress === addr.id ? 'border-pharmacy-500 bg-pharmacy-500/10 shadow-lg' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className="font-bold text-white text-base md:text-lg">{addr.title}</span>
                    {selectedAddress === addr.id && <div className="bg-pharmacy-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2 mb-2 leading-relaxed">{addr.fullAddress}</p>
                  <span className="text-xs text-slate-500 font-mono tracking-widest">{toPersianDigits(addr.postalCode)}</span>
                </div>
              ))}
              <div 
                onClick={onAddAddress}
                className="p-5 rounded-3xl cursor-pointer border-2 border-dashed border-slate-700 hover:border-pharmacy-500 hover:bg-pharmacy-500/5 flex flex-col items-center justify-center gap-3 group transition-all min-h-[140px]"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-pharmacy-500 group-hover:text-white transition-colors">
                    <MapPin className="w-6 h-6 text-slate-500 group-hover:text-white" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-white font-bold">افزودن آدرس جدید</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shipping */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2 text-white">
              <Truck className="text-pharmacy-500 w-6 h-6" />
              روش ارسال
            </h3>
            <div className="space-y-4">
              {/* JET Delivery */}
              <div 
                onClick={() => setShipping(ShippingMethod.JET)}
                className={`p-4 md:p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-4 relative overflow-hidden ${
                  shipping === ShippingMethod.JET ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                }`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-md">
                   <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-base md:text-lg">جت (فوری)</span>
                    <span className="text-pharmacy-400 font-bold text-sm md:text-lg">{toPersianDigits('70,000')} تومان</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 truncate">مخصوص شهر تهران - زیر ۲ ساعت</p>
                </div>
                {shipping === ShippingMethod.JET && <div className="bg-pharmacy-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>}
              </div>

              {/* POST Delivery */}
              <div 
                onClick={() => setShipping(ShippingMethod.POST)}
                className={`p-4 md:p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-4 relative overflow-hidden ${
                  shipping === ShippingMethod.POST ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                }`}
              >
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-md">
                   <Package className="w-8 h-8 text-blue-600 fill-blue-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-base md:text-lg">پست پیشتاز</span>
                    <span className="text-pharmacy-400 font-bold text-sm md:text-lg">{toPersianDigits('45,000')} تومان</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 truncate">سراسر کشور - ۲ تا ۴ روز کاری</p>
                </div>
                {shipping === ShippingMethod.POST && <div className="bg-pharmacy-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>}
              </div>

              {/* PICKUP */}
              <div 
                onClick={() => setShipping(ShippingMethod.PICKUP)}
                className={`p-4 md:p-6 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-4 relative overflow-hidden ${
                  shipping === ShippingMethod.PICKUP ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                }`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 p-1 border border-slate-200 shadow-md">
                  <img src="https://s34.picofile.com/file/8488723676/logoshamimnasab2_2048x725.png" alt="Pharmacy Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-base md:text-lg">تحویل حضوری</span>
                    <span className="text-green-500 font-bold text-sm md:text-lg">رایگان</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 truncate">دریافت از داروخانه دکتر شمیم نسب</p>
                </div>
                {shipping === ShippingMethod.PICKUP && <div className="bg-pharmacy-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2 text-white">
              <CreditCard className="text-pharmacy-500 w-6 h-6" />
              روش پرداخت
            </h3>
            
            <div className="space-y-3">
                {/* Bank Gateways */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { id: PaymentMethod.ZARINPAL, name: 'زرین پال', desc: 'پرداخت امن', color: 'bg-yellow-600' },
                    { id: PaymentMethod.SAMAN, name: 'سامان', desc: 'درگاه بانکی', color: 'bg-blue-600' },
                    { id: PaymentMethod.MELLAT, name: 'ملت', desc: 'درگاه بانکی', color: 'bg-red-600' }
                ].map((p) => (
                    <div 
                    key={p.id}
                    onClick={() => setPayment(p.id as PaymentMethod)}
                    className={`p-4 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-4 ${
                        payment === p.id ? 'border-pharmacy-500 bg-pharmacy-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }`}
                    >
                    <div className={`w-12 h-12 ${p.color} rounded-2xl shadow-lg flex items-center justify-center text-white font-black shrink-0 text-lg`}>
                        {p.name[0]}
                    </div>
                    <div className="flex-grow">
                        <span className="block font-bold text-white text-sm">{p.name}</span>
                        <span className="text-xs text-slate-500">{p.desc}</span>
                    </div>
                    {payment === p.id && <div className="bg-pharmacy-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                ))}
                </div>

                {/* Tara Installment */}
                <div 
                    onClick={() => setPayment(PaymentMethod.TARA)}
                    className={`p-4 rounded-3xl cursor-pointer border-2 transition-all flex items-center gap-4 ${
                    payment === PaymentMethod.TARA ? 'border-[#b92b6a] bg-[#b92b6a]/10' : 'border-slate-700 hover:border-[#b92b6a]/50 bg-slate-900/50'
                    }`}
                >
                    <div className="w-12 h-12 bg-[#b92b6a] rounded-2xl shadow-lg flex items-center justify-center text-white shrink-0">
                         {/* Simple Wallet Icon for Tara */}
                         <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                             <span className="block font-bold text-white text-base">پرداخت قسطی تارا</span>
                             <span className="bg-[#b92b6a] text-white text-[10px] px-2 py-0.5 rounded-full">جدید</span>
                        </div>
                        <span className="text-xs text-slate-400">بدون کارمزد، در ۴ قسط</span>
                    </div>
                     {payment === PaymentMethod.TARA && <div className="bg-[#b92b6a] rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                </div>
            </div>

            <div className="mt-6 p-6 bg-slate-900 rounded-3xl border border-slate-700">
              <div className="flex justify-between items-center mb-3 text-slate-400 text-sm">
                <span>جمع کل:</span>
                <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-slate-400 text-sm">
                <span>هزینه ارسال:</span>
                <span>{shippingPrice === 0 ? 'رایگان' : `${shippingPrice.toLocaleString('fa-IR')} تومان`}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700 pt-4">
                <span className="text-lg font-bold text-white">مبلغ نهایی:</span>
                <span className="text-2xl md:text-3xl font-display text-pharmacy-400 font-bold">{total.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-700 mt-auto">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
            >
              <ChevronRight className="w-5 h-5" />
              مرحله قبل
            </button>
          ) : (
            <button onClick={onCancel} className="text-slate-500 hover:text-red-500 transition-colors text-sm font-bold">لغو خرید</button>
          )}

          <button 
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onComplete({ selectedAddress, shipping, payment, total });
            }}
            disabled={step === 1 && !selectedAddress}
            className={`px-8 md:px-12 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 text-base ${
              step === 3 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-pharmacy-500 hover:bg-pharmacy-400 text-white shadow-pharmacy-500/20'
            } disabled:opacity-50 disabled:grayscale`}
          >
            {step === 3 ? 'پرداخت نهایی' : 'ادامه'}
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWizard;
