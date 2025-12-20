import React, { useState } from 'react';
import { User, Address } from '../types';
import { User as UserIcon, MapPin, Plus, LogOut, Phone, IdCard, Edit, Trash2, X, Save } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onAddAddress: () => void;
  onEditAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onUpdateProfile: (firstName: string, lastName: string, nationalId: string, phone: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onAddAddress, onEditAddress, onDeleteAddress, onUpdateProfile }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [nationalId, setNationalId] = useState(user.nationalId);
  const [phone, setPhone] = useState(user.phone);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(firstName, lastName, nationalId, phone);
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-32">
      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display text-white">ویرایش مشخصات کاربری</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-500 hover:text-white">
                <X />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-2">نام</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white outline-none focus:border-pharmacy-500" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-2">نام خانوادگی</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white outline-none focus:border-pharmacy-500" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2">کد ملی</label>
                  <input 
                    type="text" 
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 text-left dir-ltr" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2">شماره همراه</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 text-left dir-ltr" 
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pharmacy-500/20 transition-all"
                >
                  <Save className="w-5 h-5" />
                  بروزرسانی پروفایل
                </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-slate-800">
          <div className="w-24 h-24 bg-pharmacy-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-pharmacy-600/20">
            {user.firstName[0]}
          </div>
          <div className="flex-grow text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <h2 className="text-3xl font-bold text-white">{user.firstName} {user.lastName}</h2>
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2 text-pharmacy-400 hover:text-white transition-colors bg-pharmacy-500/10 rounded-lg"
                  title="ویرایش پروفایل"
                >
                  <Edit className="w-4 h-4" />
                </button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {user.phone}</span>
              <span className="flex items-center gap-2"><IdCard className="w-4 h-4" /> کد ملی: {user.nationalId}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors bg-rose-500/10 px-4 py-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-pharmacy-500" />
              دفترچه آدرس‌ها
            </h3>
            <button 
              onClick={onAddAddress}
              className="flex items-center gap-2 text-pharmacy-400 hover:text-white transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              آدرس جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses.length > 0 ? (
              user.addresses.map(addr => (
                <div key={addr.id} className="p-6 bg-slate-900/50 border border-slate-700 rounded-2xl relative group hover:border-pharmacy-500/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-white">{addr.title}</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEditAddress(addr)}
                          className="p-1.5 text-slate-400 hover:text-pharmacy-500 bg-slate-800 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteAddress(addr.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-800 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{addr.fullAddress}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>کد پستی: {addr.postalCode}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                <p className="text-slate-500">هنوز آدرسی ثبت نکرده‌اید.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;