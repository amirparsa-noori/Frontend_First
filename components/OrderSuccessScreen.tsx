import React from 'react';
import { CheckCircle2, Package, Headphones } from 'lucide-react';

const PHARMACY_SUPPORT_TEL = '02191010000';
const PHARMACY_SUPPORT_TEL_DISPLAY = '۰۲۱-۹۱۰۱۰۰۰۰';

interface OrderSuccessScreenProps {
  onTrackOrder: () => void;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({ onTrackOrder }) => {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-pharmacy-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="relative z-10 w-full max-w-lg text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mx-auto mb-8 w-28 h-28 md:w-32 md:h-32">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping opacity-40" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/40 border-4 border-emerald-300/30">
            <CheckCircle2 className="w-14 h-14 md:w-16 md:h-16 text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 leading-relaxed">
          سفارش شما با موفقیت ثبت شد
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10 px-2">
          از اعتماد شما سپاسگزاریم. تیم داروخانه در اسرع وقت سفارش را بررسی و پردازش می‌کند.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={onTrackOrder}
            className="flex items-center justify-center gap-2 w-full sm:flex-1 bg-pharmacy-500 hover:bg-pharmacy-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-pharmacy-500/25 transition-all active:scale-[0.98] border border-pharmacy-400/30"
          >
            <Package className="w-5 h-5" />
            پیگیری سفارش
          </button>
          <a
            href={`tel:${PHARMACY_SUPPORT_TEL}`}
            className="flex items-center justify-center gap-2 w-full sm:flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl border border-slate-600 transition-all active:scale-[0.98]"
          >
            <Headphones className="w-5 h-5 text-pharmacy-400" />
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-normal text-slate-400">ارتباط با پشتیبانی</span>
              <span dir="ltr" className="text-sm tracking-wide">
                {PHARMACY_SUPPORT_TEL_DISPLAY}
              </span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;
export { PHARMACY_SUPPORT_TEL, PHARMACY_SUPPORT_TEL_DISPLAY };
