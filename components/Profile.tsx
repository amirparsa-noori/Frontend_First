
import React, { useState } from 'react';
import { User, Address, Review, Product, Order } from '../types';
import { User as UserIcon, MapPin, Plus, LogOut, Phone, IdCard, Edit, Trash2, X, Save, MessageSquare, Star, Package, Clock, ShoppingBag, ChevronLeft, AlertCircle, CheckCircle, Truck } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onAddAddress: () => void;
  onEditAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onUpdateProfile: (firstName: string, lastName: string, nationalId: string, phone: string) => void;
  userReviews: Review[];
  products: Product[];
  onUpdateReview: (review: Review) => void;
  onDeleteReview: (id: string) => void;
  orders: Order[];
  onCancelOrder: (id: string) => void;
  onOpenProduct: (product: Product) => void;
}

const toPersianDigits = (num: string | number) => {
    return num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

const Profile: React.FC<ProfileProps> = ({ 
    user, 
    onLogout, 
    onAddAddress, 
    onEditAddress, 
    onDeleteAddress, 
    onUpdateProfile,
    userReviews,
    products,
    onUpdateReview,
    onDeleteReview,
    orders,
    onCancelOrder,
    onOpenProduct
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'reviews'>('info');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Profile Form States
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [nationalId, setNationalId] = useState(user.nationalId);
  const [phone, setPhone] = useState(user.phone);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(firstName, lastName, nationalId, phone);
    setIsEditingProfile(false);
  };

  const handleUpdateReviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingReview) {
          onUpdateReview({
              ...editingReview,
              date: new Date().toLocaleDateString('fa-IR') + ' (ویرایش شده)'
          });
          setEditingReview(null);
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
          case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
          default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'pending': return 'در انتظار پرداخت';
          case 'processing': return 'در حال پردازش';
          case 'shipped': return 'ارسال شده';
          case 'delivered': return 'تحویل شده';
          case 'cancelled': return 'لغو شده';
          default: return 'نامشخص';
      }
  };

  const TimelineStep = ({ title, date, active, completed, last }: any) => (
      <div className={`relative flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 flex-1 ${!last ? 'pb-8 md:pb-0' : ''}`}>
          {/* Connecting Line */}
          {!last && (
            <>
                {/* Mobile Line: positioned relative to the icon (right side in RTL) */}
                <div className={`absolute top-8 right-[15px] bottom-0 w-0.5 md:hidden ${completed ? 'bg-pharmacy-500' : 'bg-slate-700'}`}></div>
                {/* Desktop Line */}
                <div className={`hidden md:block absolute top-[15px] right-[50%] left-[-50%] h-0.5 ${completed ? 'bg-pharmacy-500' : 'bg-slate-700'}`}></div>
            </>
          )}

          <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
              completed || active ? 'bg-pharmacy-500 border-pharmacy-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-500'
          }`}>
              {completed ? <CheckCircle className="w-5 h-5" /> : <div className={`w-3 h-3 rounded-full ${active ? 'bg-white animate-pulse' : 'bg-slate-600'}`}></div>}
          </div>
          <div className="md:mt-2 md:text-center">
              <span className={`block text-sm font-bold ${completed || active ? 'text-white' : 'text-slate-500'}`}>{title}</span>
              {date && <span className="text-xs text-slate-400 mt-1 block">{toPersianDigits(date)}</span>}
          </div>
      </div>
  );

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

      {/* Review Edit Modal */}
      {editingReview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-display text-white">ویرایش نظر</h3>
                <button onClick={() => setEditingReview(null)} className="text-slate-500 hover:text-white">
                    <X />
                </button>
                </div>
                <form onSubmit={handleUpdateReviewSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs mb-2">امتیاز</label>
                        <div className="flex gap-1 flex-row-reverse justify-end">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <Star 
                                    key={star}
                                    onClick={() => setEditingReview({...editingReview, rating: star})}
                                    className={`w-6 h-6 cursor-pointer transition-colors ${
                                        star <= editingReview.rating ? 'text-gold-500 fill-gold-500' : 'text-slate-600'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs mb-2">نظر شما</label>
                        <textarea 
                            value={editingReview.comment}
                            onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-pharmacy-500"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        ثبت تغییرات
                    </button>
                </form>
            </div>
          </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrder && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-20">
                      <div>
                          <h3 className="text-xl font-display font-bold text-white mb-1">پیگیری سفارش</h3>
                          <span className="text-slate-400 text-sm">کد سفارش: {toPersianDigits(selectedOrder.id)}</span>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-all">
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                      {/* Tracking Timeline */}
                      <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 mb-8 border border-slate-700/50">
                           <div className="flex flex-col md:flex-row justify-between relative">
                                <TimelineStep 
                                    title="ثبت سفارش" 
                                    date={selectedOrder.date} 
                                    completed={true} 
                                />
                                <TimelineStep 
                                    title="در حال پردازش" 
                                    date={selectedOrder.status !== 'pending' ? '1402/12/11' : ''} 
                                    active={selectedOrder.status === 'processing'} 
                                    completed={['shipped', 'delivered'].includes(selectedOrder.status)} 
                                />
                                <TimelineStep 
                                    title="تحویل به پست" 
                                    date={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? '1402/12/12' : ''}
                                    active={selectedOrder.status === 'shipped'} 
                                    completed={selectedOrder.status === 'delivered'} 
                                />
                                <TimelineStep 
                                    title="تحویل مشتری" 
                                    date={selectedOrder.status === 'delivered' ? '1402/12/14' : ''}
                                    active={false} 
                                    completed={selectedOrder.status === 'delivered'} 
                                    last={true}
                                />
                           </div>
                           {selectedOrder.status === 'cancelled' && (
                               <div className="mt-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
                                   <AlertCircle className="w-5 h-5" />
                                   <span>این سفارش لغو شده است.</span>
                               </div>
                           )}
                      </div>

                      {/* Order Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                              <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                                  <MapPin className="w-4 h-4 text-pharmacy-500" />
                                  آدرس تحویل
                              </h4>
                              <p className="text-slate-300 text-sm leading-relaxed mb-2">{selectedOrder.address.fullAddress}</p>
                              <span className="text-slate-500 text-xs block">کد پستی: {toPersianDigits(selectedOrder.address.postalCode)}</span>
                          </div>
                          
                          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
                               <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                                  <Truck className="w-4 h-4 text-pharmacy-500" />
                                  اطلاعات ارسال
                              </h4>
                              <div className="flex justify-between items-center mb-3 text-sm">
                                  <span className="text-slate-400">روش ارسال:</span>
                                  <span className="text-white font-bold">
                                      {selectedOrder.shippingMethod === 'jet' ? 'پیک فوری (Jet)' : selectedOrder.shippingMethod === 'post' ? 'پست پیشتاز' : 'تحویل حضوری'}
                                  </span>
                              </div>
                              {selectedOrder.trackingCode && (
                                  <div className="flex justify-between items-center text-sm bg-slate-900 p-2 rounded-lg border border-slate-700">
                                      <span className="text-slate-400">کد رهگیری:</span>
                                      <span className="text-pharmacy-400 font-mono tracking-wider">{toPersianDigits(selectedOrder.trackingCode)}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Items List */}
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-pharmacy-500" />
                          اقلام سفارش
                      </h4>
                      <div className="space-y-3">
                          {selectedOrder.items.map((item, idx) => {
                              const product = products.find(p => p.id === item.id);
                              return (
                              <div 
                                key={idx} 
                                onClick={() => product && onOpenProduct(product)}
                                className="flex items-center gap-4 bg-slate-800 p-3 rounded-2xl border border-slate-700/50 cursor-pointer hover:border-pharmacy-500 transition-colors group"
                              >
                                  <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0">
                                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="flex-grow">
                                      <h5 className="text-white font-bold text-sm mb-1 line-clamp-1 group-hover:text-pharmacy-400 transition-colors">{item.name}</h5>
                                      <span className="text-slate-500 text-xs">{toPersianDigits(item.quantity)} عدد</span>
                                  </div>
                                  <div className="text-left">
                                      <span className="text-pharmacy-400 font-bold text-sm block">{item.price}</span>
                                  </div>
                              </div>
                              );
                          })}
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2 text-white font-bold">
                          <span>مبلغ کل پرداختی:</span>
                          <span className="text-xl text-pharmacy-400">{toPersianDigits(selectedOrder.totalPrice.toLocaleString())} تومان</span>
                      </div>
                      
                      {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                          <button 
                            onClick={() => {
                                if (window.confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
                                    onCancelOrder(selectedOrder.id);
                                    setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
                                }
                            }}
                            className="w-full md:w-auto px-6 py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all font-bold flex items-center justify-center gap-2"
                          >
                              <Trash2 className="w-5 h-5" />
                              لغو سفارش
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      <div className="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-800">
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
              <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {toPersianDigits(user.phone)}</span>
              <span className="flex items-center gap-2"><IdCard className="w-4 h-4" /> کد ملی: {toPersianDigits(user.nationalId)}</span>
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

        {/* Profile Tabs - Optimized for Mobile Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 border-b border-slate-700/50 pb-1">
            <button 
                onClick={() => setActiveTab('info')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center ${activeTab === 'info' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                اطلاعات
                {activeTab === 'info' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center gap-1 md:gap-2 ${activeTab === 'orders' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                سفارش‌ها
                <span className="bg-slate-700 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">{toPersianDigits(orders.length)}</span>
                {activeTab === 'orders' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
            <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center gap-1 md:gap-2 ${activeTab === 'reviews' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                نظرات
                <span className="bg-slate-700 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">{toPersianDigits(userReviews.length)}</span>
                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
        </div>

        {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
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
                        <span>کد پستی: {toPersianDigits(addr.postalCode)}</span>
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
        )}

        {/* --- ORDERS TAB CONTENT --- */}
        {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order.id} className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 md:p-6 transition-all hover:border-slate-600 group">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right w-full md:w-auto">
                                    <div className="bg-slate-800 p-3 rounded-2xl shrink-0">
                                        <Package className="w-6 h-6 text-pharmacy-500" />
                                    </div>
                                    <div className="flex flex-col items-center md:items-start">
                                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1">
                                            <h4 className="font-bold text-white text-lg">سفارش {toPersianDigits(order.id)}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {toPersianDigits(order.date)}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                            <span>{toPersianDigits(order.items.length)} قلم کالا</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row justify-between w-full md:w-auto md:block text-left border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                                    <span className="block text-xs text-slate-500 mb-1 md:hidden">مبلغ کل:</span>
                                    <div>
                                        <span className="hidden md:block text-xs text-slate-500 mb-1">مبلغ کل</span>
                                        <span className="block text-xl font-bold text-white">{toPersianDigits(order.totalPrice.toLocaleString())} <span className="text-xs text-slate-500 font-normal">تومان</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-4 justify-center md:justify-start">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-1 shrink-0 border border-slate-700">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-800">
                                <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex-1 bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-pharmacy-500/10 active:scale-95 text-sm"
                                >
                                    مشاهده جزئیات و پیگیری
                                </button>
                                {(order.status === 'pending' || order.status === 'processing') && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
                                                onCancelOrder(order.id);
                                            }
                                        }}
                                        className="px-4 py-3 rounded-xl bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white border border-slate-700 hover:border-rose-500 transition-all"
                                        title="لغو سفارش"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">هنوز سفارشی ثبت نکرده‌اید</h3>
                        <p className="text-slate-500 text-sm">لیست سفارشات شما در اینجا نمایش داده می‌شود.</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'reviews' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                 {userReviews.length > 0 ? (
                     userReviews.map(review => {
                         const product = products.find(p => p.id === review.productId);
                         return (
                            <div key={review.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                                {product && (
                                    <div className="w-16 h-16 bg-white rounded-xl flex-shrink-0 p-1">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex-grow w-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-white font-bold text-sm md:text-base line-clamp-1">{product?.name || 'محصول نامشخص'}</h4>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setEditingReview(review)}
                                                className="text-slate-400 hover:text-pharmacy-500 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => onDeleteReview(review.id)}
                                                className="text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-slate-700'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500">{toPersianDigits(review.date)}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                         );
                     })
                 ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500">شما هنوز دیدگاهی ثبت نکرده‌اید.</p>
                    </div>
                 )}
             </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
