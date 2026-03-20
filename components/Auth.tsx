import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { User, Address } from '../types';
import { X, User as UserIcon, LogIn, UserPlus, MapPin, Plus, Trash2, IdCard, CreditCard, Lock } from 'lucide-react';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      user {
        databaseId
        firstName
        lastName
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!, $email: String!, $firstName: String!, $lastName: String!) {
    registerUser(input: { username: $username, password: $password, email: $email, firstName: $firstName, lastName: $lastName }) {
      user {
        databaseId
      }
    }
  }
`;

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  currentUser: User | null;
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose, onAuthSuccess, currentUser }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, errors } = await loginMutation({
          variables: { username: phone, password }
        });

        if (errors?.length) {
          setErrorMsg(errors[0].message || 'خطا در ورود');
          setLoading(false);
          return;
        }

        if (!data?.login?.authToken) {
          setErrorMsg('خطا در دریافت توکن');
          setLoading(false);
          return;
        }

        localStorage.setItem('pharmacy_token', data.login.authToken);

        const wpUser = data.login.user;
        const mappedUser: User = {
          id: String(wpUser?.databaseId ?? ''),
          firstName: wpUser?.firstName || firstName || 'کاربر',
          lastName: wpUser?.lastName || lastName || 'گرامی',
          nationalId: nationalId || '',
          phone: phone,
          addresses: []
        };
        onAuthSuccess(mappedUser);
        onClose();
      } else {
        const { data: regData, errors: regErrors } = await registerMutation({
          variables: {
            username: phone,
            password,
            email: phone + '@drshamimnasab.ir',
            firstName,
            lastName
          }
        });

        if (regErrors?.length) {
          setErrorMsg(regErrors[0].message || 'خطا در ثبت نام');
          setLoading(false);
          return;
        }

        if (!regData?.registerUser?.user) {
          setErrorMsg('خطا در ایجاد حساب');
          setLoading(false);
          return;
        }

        const { data: loginData, errors: loginErrors } = await loginMutation({
          variables: { username: phone, password }
        });

        if (loginErrors?.length || !loginData?.login?.authToken) {
          setErrorMsg('ثبت نام موفق بود. لطفاً وارد شوید.');
          setLoading(false);
          setMode('login');
          return;
        }

        localStorage.setItem('pharmacy_token', loginData.login.authToken);

        const wpUser = loginData.login.user;
        const mappedUser: User = {
          id: String(wpUser?.databaseId ?? ''),
          firstName: wpUser?.firstName ?? firstName,
          lastName: wpUser?.lastName ?? lastName,
          nationalId: nationalId || '',
          phone: phone,
          addresses: []
        };
        onAuthSuccess(mappedUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'خطایی رخ داد. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
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

            <div>
              <label className="block text-slate-400 text-xs mb-2">رمز عبور</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-10 text-white outline-none focus:border-pharmacy-500 transition-all text-left dir-ltr" 
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
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

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-2xl px-4 py-3 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-pharmacy-500/20 flex items-center justify-center gap-2"
          >
            {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {loading ? 'در حال پردازش...' : (mode === 'login' ? 'ورود به داروخانه' : 'تکمیل ثبت نام')}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); }}
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
