
import React, { useState } from 'react';
import { User, Address } from '../types';
import { X, User as UserIcon, LogIn, UserPlus, MapPin, Plus, Trash2, IdCard, CreditCard } from 'lucide-react';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  currentUser: User | null;
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose, onAuthSuccess, currentUser }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: firstName || 'کاربر',
      lastName: lastName || 'گرامی',
      nationalId: nationalId || '0000000000',
      phone: phone,
      addresses: []
    };
    onAuthSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-display text-white">
            {mode === 'login' ? 'ورود به حساب' : 'ایجاد حساب کاربری'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs mb-2">شماره همراه</label>
              <div className="relative">
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-10 text-white outline-none focus:border-pharmacy-500 transition-all text-left dir-ltr" 
                  placeholder="0912xxxxxxx"
                  required
                />
                <LogIn className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-2">نام</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-all" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-2">نام خانوادگی</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-all" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2">کد ملی</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-10 text-white outline-none focus:border-pharmacy-500 transition-all text-left dir-ltr" 
                      placeholder="0023456789"
                      required
                    />
                    <IdCard className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-pharmacy-500/20 flex items-center justify-center gap-2"
          >
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {mode === 'login' ? 'ورود به داروخانه' : 'تکمیل ثبت نام'}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-sm text-pharmacy-400 hover:text-white transition-colors"
            >
              {mode === 'login' ? 'هنوز ثبت نام نکرده‌اید؟ ایجاد حساب' : 'قبلاً ثبت نام کرده‌اید؟ ورود'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
