import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { User, Address, Review, Product, Order, Ticket } from '../types';
import { User as UserIcon, MapPin, Plus, LogOut, Phone, IdCard, Edit, Trash2, X, Save, MessageSquare, Star, Package, Clock, ShoppingBag, ChevronLeft, AlertCircle, CheckCircle, Truck, Send, Ticket as TicketIcon, Loader2, CreditCard, CalendarClock, XCircle, RotateCcw } from 'lucide-react';

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        id
        firstName
        lastName
        billing {
          address1
          city
          phone
          postcode
        }
      }
    }
  }
`;

const GET_USER_ORDERS = gql`
  query GetMyOrders {
    customer {
      orders(first: 50) {
        nodes {
          databaseId
          orderNumber
          status
          date
          modified
          total
          subtotal
          shippingTotal
          paymentMethodTitle
          billing {
            address1
            city
            phone
          }
          lineItems {
            nodes {
              product {
                node {
                  name
                }
              }
              quantity
              total
            }
          }
        }
      }
    }
  }
`;

interface OrderLineItemDisplay {
  id: number;
  name: string;
  image: string;
  price: string;
  quantity: number;
  lineTotal?: string;
}

/** Display order shape - WooCommerce API + optional legacy fields */
interface DisplayOrder {
  id: string;
  orderNumber?: string;
  date: string;
  modified: string;
  status: string;
  totalPrice: number;
  totalFormatted?: string;
  subtotal?: string;
  subtotalNum: number;
  shippingTotal?: string;
  shippingNum: number;
  paymentMethodTitle?: string;
  items?: OrderLineItemDisplay[];
  address?: {
    fullAddress: string;
    postalCode: string;
    address1?: string;
    city?: string;
    phone?: string;
  };
  trackingCode?: string;
}

interface GetMyOrdersData {
  customer?: {
    orders?: { nodes: Record<string, unknown>[] };
  } | null;
}

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
  orders?: Order[];
  onCancelOrder?: (id: string) => void;
  onUpdateOrderStatus?: (id: string, status: any) => void;
  onOpenProduct: (product: Product) => void;
  tickets: Ticket[];
  onUpdateTicketMessage?: (ticketId: string, messageIndex: number, newText: string) => void;
  /** وقتی true است، با ورود به پروفایل تب سفارش‌ها باز می‌شود */
  openToOrdersTab?: boolean;
  onProfileOrdersTabOpened?: () => void;
}

const toPersianDigits = (num: string | number) => {
    return num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

const wooStatusToPersian = (status: string): string => {
    const s = (status || '').toUpperCase();
    if (s === 'ON_HOLD' || s === 'ON-HOLD') return 'در انتظار بررسی';
    if (s === 'PROCESSING') return 'در حال آماده‌سازی';
    if (s === 'COMPLETED') return 'تکمیل شده';
    if (s === 'PENDING') return 'در انتظار پرداخت';
    if (s === 'CANCELLED') return 'لغو شده';
    if (s === 'REFUNDED') return 'استرداد شده';
    if (s === 'FAILED') return 'ناموفق';
    return 'نامشخص';
};

const parseAndFormatPrice = (priceStr: string): string => {
    if (!priceStr) return '۰';
    const p = '۰۱۲۳۴۵۶۷۸۹';
    const e = '0123456789';
    let clean = priceStr.replace(/ریال|تومان|\s/gi, '');
    for (let i = 0; i < 10; i++) clean = clean.split(p[i]).join(e[i]);
    const num = parseInt(clean.replace(/\D/g, ''), 10) || 0;
    return num.toLocaleString('fa-IR');
};

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const parseWooMoneyToNumber = (value: string | undefined | null): number => {
    if (value == null || value === '') return 0;
    const p = '۰۱۲۳۴۵۶۷۸۹';
    const e = '0123456789';
    let clean = String(value).replace(/ریال|تومان|\s/gi, '');
    for (let i = 0; i < 10; i++) clean = clean.split(p[i]).join(e[i]);
    return parseInt(clean.replace(/\D/g, ''), 10) || 0;
};

const getLineItemProductName = (li: any): string => {
    const n = li?.product?.node?.name ?? li?.product?.name;
    return (n && String(n).trim()) || 'محصول';
};

/** ترجمه عنوان روش پرداخت ووکامرس (انگلیسی) به فارسی */
const formatPaymentMethodTitle = (title: string): string => {
    if (!title || !title.trim()) return '';
    const t = title.trim();
    const upper = t.toUpperCase();
    if (upper.includes('DIRECT BANK') || upper.includes('BANK TRANSFER') || upper === 'BACS') return 'پرداخت کارت به کارت / واریز بانکی';
    if (upper.includes('CASH ON DELIVERY') || upper === 'COD') return 'پرداخت در محل';
    if (upper.includes('ZARINPAL') || upper.includes('ZARIN')) return 'درگاه زرین‌پال';
    if (upper.includes('SAMAN')) return 'درگاه سامان';
    if (upper.includes('MELLAT')) return 'درگاه ملت';
    if (upper.includes('TARA')) return 'پرداخت قسطی تارا';
    if (upper.includes('CARD') || upper.includes('GATEWAY') || upper.includes('ONLINE')) return 'درگاه پرداخت';
    return t;
};

type StatusIconType = React.ComponentType<{ className?: string }>;

const getOrderStatusPresentation = (status: string): { Icon: StatusIconType; spin?: boolean } => {
    const s = (status || '').toLowerCase();
    if (['pending', 'on_hold', 'on-hold'].includes(s)) return { Icon: Clock };
    if (s === 'processing') return { Icon: Loader2, spin: true };
    if (['shipped'].includes(s)) return { Icon: Truck };
    if (['delivered', 'completed'].includes(s)) return { Icon: CheckCircle };
    if (['cancelled', 'failed'].includes(s)) return { Icon: XCircle };
    if (s === 'refunded') return { Icon: RotateCcw };
    return { Icon: Package };
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
    orders: _ordersProp,
    onCancelOrder,
    onUpdateOrderStatus,
    onOpenProduct,
    tickets,
    onUpdateTicketMessage,
    openToOrdersTab,
    onProfileOrdersTabOpened
}) => {
  const { data, loading, error, refetch } = useQuery<GetMyOrdersData>(GET_USER_ORDERS, {
    fetchPolicy: 'cache-and-network'
  });

  const wooNodes = data?.customer?.orders?.nodes ?? [];
  const ordersDisplay: DisplayOrder[] = wooNodes.map((node: any) => {
    const totalStr = node.total ?? '';
    const totalNum = parseWooMoneyToNumber(totalStr);
    const subtotalStr = node.subtotal ?? '';
    const shippingStr = node.shippingTotal ?? '';
    const subtotalNum = parseWooMoneyToNumber(subtotalStr);
    const shippingNum = parseWooMoneyToNumber(shippingStr);
    const items = node.lineItems?.nodes ?? [];
    const mappedItems: OrderLineItemDisplay[] = items.map((li: any, idx: number) => {
      const lineTotal = li.total ?? '';
      const prod = li.product;
      return {
        id: prod?.node?.databaseId ?? prod?.databaseId ?? idx,
        name: getLineItemProductName(li),
        image: prod?.node?.image?.sourceUrl ?? prod?.image?.sourceUrl ?? '',
        price: lineTotal || '0',
        quantity: li.quantity ?? 1,
        lineTotal
      };
    });
    const billing = node.billing;
    return {
      id: String(node.databaseId ?? node.orderNumber ?? ''),
      orderNumber: node.orderNumber,
      date: node.date ?? '',
      modified: node.modified ?? '',
      status: node.status ?? 'PENDING',
      totalPrice: totalNum,
      totalFormatted: totalStr,
      subtotal: subtotalStr,
      subtotalNum,
      shippingTotal: shippingStr,
      shippingNum,
      paymentMethodTitle: node.paymentMethodTitle ?? '',
      items: mappedItems,
      address: billing
        ? {
            fullAddress: [billing.city, billing.address1].filter(Boolean).join(' — ') || billing.address1 || '—',
            postalCode: billing.postcode ?? '',
            address1: billing.address1,
            city: billing.city,
            phone: billing.phone
          }
        : undefined,
      trackingCode: node.trackingCode
    };
  });

  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'reviews' | 'tickets'>('info');
  const [showWooCommerceEdit, setShowWooCommerceEdit] = useState(false);

  const [updateProfile, { loading: isUpdating, error: updateError }] = useMutation(UPDATE_USER_PROFILE);

  const firstAddr = user.addresses[0];
  const [editFirstName, setEditFirstName] = useState(user.firstName);
  const [editLastName, setEditLastName] = useState(user.lastName);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editCity, setEditCity] = useState(firstAddr?.city ?? '');
  const [editAddress, setEditAddress] = useState(firstAddr?.fullAddress ?? '');
  const [editPostcode, setEditPostcode] = useState(firstAddr?.postalCode ?? '');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);

  useEffect(() => {
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditPhone(user.phone);
    const addr = user.addresses[0];
    setEditCity(addr?.city ?? '');
    setEditAddress(addr?.fullAddress ?? '');
    setEditPostcode(addr?.postalCode ?? '');
  }, [user.firstName, user.lastName, user.phone, user.addresses]);

  useEffect(() => {
    if (openToOrdersTab) {
      setActiveTab('orders');
      onProfileOrdersTabOpened?.();
    }
  }, [openToOrdersTab, onProfileOrdersTabOpened]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Profile Form States
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [nationalId, setNationalId] = useState(user.nationalId);
  const [phone, setPhone] = useState(user.phone);

  // Ticket Editing
  const [editingMessage, setEditingMessage] = useState<{index: number, text: string} | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(firstName, lastName, nationalId, phone);
    setIsEditingProfile(false);
  };

  const canUpdateWooProfile = (() => {
    const dbId = user.databaseId ?? (user.id ? Number(user.id) : NaN);
    return !Number.isNaN(dbId) && dbId > 0;
  })();

  const handleWooProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateSuccess(false);
    const dbId = user.databaseId ?? (user.id ? Number(user.id) : NaN);
    const customerId = Number.isNaN(dbId) ? null : dbId;
    if (customerId == null || customerId <= 0) {
      return;
    }
    try {
      const result = await updateProfile({
        variables: {
          input: {
            id: customerId,
            firstName: editFirstName,
            lastName: editLastName,
            billing: {
              phone: editPhone,
              city: editCity,
              address1: editAddress,
              postcode: editPostcode
            }
          }
        }
      });
      const customer = result.data?.updateCustomer?.customer;
      if (customer) {
        onUpdateProfile(editFirstName, editLastName, user.nationalId, editPhone);
        setProfileUpdateSuccess(true);
        setTimeout(() => setProfileUpdateSuccess(false), 4000);
      }
    } catch (err) {
      console.error('WooCommerce profile update error:', err);
    }
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
      const s = (status || '').toLowerCase();
      if (['pending', 'on_hold', 'on-hold'].includes(s)) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      if (s === 'processing') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      if (['shipped', 'refunded'].includes(s)) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      if (['delivered', 'completed'].includes(s)) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      if (['cancelled', 'failed'].includes(s)) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      if (s === 'answered') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      if (s === 'closed') return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  const getStatusLabel = (status: string) => {
      const s = (status || '').toUpperCase();
      if (['PENDING', 'ON_HOLD', 'ON-HOLD'].includes(s)) return wooStatusToPersian(s);
      if (s === 'PROCESSING') return wooStatusToPersian(s);
      if (s === 'COMPLETED') return wooStatusToPersian(s);
      if (['CANCELLED', 'REFUNDED', 'FAILED'].includes(s)) return wooStatusToPersian(s);
      const lower = status?.toLowerCase() ?? '';
      if (lower === 'shipped') return 'ارسال شده';
      if (lower === 'delivered') return 'تحویل شده';
      if (lower === 'answered') return 'پاسخ داده شده';
      if (lower === 'closed') return 'بسته شده';
      return wooStatusToPersian(s) || 'نامشخص';
  };

  const TimelineStep = ({ title, date, active, completed, last }: any) => (
      <div className={`relative flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 flex-1 ${!last ? 'pb-8 md:pb-0' : ''}`}>
          {!last && (
            <>
                <div className={`absolute top-8 right-[15px] bottom-0 w-0.5 md:hidden ${completed ? 'bg-pharmacy-500' : 'bg-slate-700'}`}></div>
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

      {/* WooCommerce: ویرایش اطلاعات و آدرس صورتحساب */}
      {showWooCommerceEdit && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="text-right min-w-0 pr-2">
                <h3 className="text-lg font-display font-bold text-white">ویرایش اطلاعات و آدرس</h3>
                <p className="text-slate-500 text-xs mt-1">ذخیره در ووکامرس</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWooCommerceEdit(false)}
                className="shrink-0 p-2 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-5">
              {!canUpdateWooProfile && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed text-right">برای بروزرسانی، با حساب ووکامرس وارد شوید.</span>
                </div>
              )}
              {profileUpdateSuccess && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">اطلاعات با موفقیت بروزرسانی شد</span>
                </div>
              )}
              {updateError && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm text-right">{updateError.message}</span>
                </div>
              )}
              <form onSubmit={handleWooProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-2 text-right">نام</label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors text-right"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-2 text-right">نام خانوادگی</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors text-right"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-2 text-right">شماره همراه</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors text-left dir-ltr"
                    required
                  />
                </div>
                <div className="border-t border-slate-800 pt-5">
                  <h4 className="text-white font-bold text-sm mb-4 flex flex-row-reverse items-center gap-2">
                    <span>آدرس صورتحساب</span>
                    <MapPin className="w-4 h-4 text-pharmacy-500" />
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-2 text-right">شهر</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-2 text-right">آدرس کامل</label>
                      <textarea
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors resize-none text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-2 text-right">کد پستی</label>
                      <input
                        type="text"
                        value={editPostcode}
                        onChange={(e) => setEditPostcode(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors text-left dir-ltr"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isUpdating || !canUpdateWooProfile}
                  className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pharmacy-500/20 transition-all"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      ذخیره تغییرات
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-20">
                      <div>
                          <h3 className="text-lg md:text-xl font-display font-bold text-white mb-1">گفتگو: {selectedTicket.subject}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                              {getStatusLabel(selectedTicket.status)}
                          </span>
                      </div>
                      <button onClick={() => setSelectedTicket(null)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-all">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/50">
                      {selectedTicket.messages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl p-4 ${
                                  msg.sender === 'user' 
                                  ? 'bg-pharmacy-600 text-white rounded-tr-none' 
                                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                              }`}>
                                  {editingMessage && editingMessage.index === index && msg.sender === 'user' ? (
                                      <div className="min-w-[200px]">
                                          <textarea 
                                              value={editingMessage.text}
                                              onChange={(e) => setEditingMessage({...editingMessage, text: e.target.value})}
                                              className="w-full bg-slate-800 text-white rounded p-2 text-sm mb-2"
                                              rows={3}
                                          />
                                          <div className="flex gap-2 justify-end">
                                              <button 
                                                  onClick={() => setEditingMessage(null)}
                                                  className="text-xs text-slate-300 hover:text-white"
                                              >
                                                  انصراف
                                              </button>
                                              <button 
                                                  onClick={() => {
                                                      if (onUpdateTicketMessage) {
                                                          onUpdateTicketMessage(selectedTicket.id, index, editingMessage.text);
                                                          setEditingMessage(null);
                                                      }
                                                  }}
                                                  className="text-xs bg-white text-pharmacy-600 px-2 py-1 rounded font-bold"
                                              >
                                                  ذخیره
                                              </button>
                                          </div>
                                      </div>
                                  ) : (
                                      <>
                                          <p className="text-sm leading-relaxed mb-2 whitespace-pre-wrap">{msg.text}</p>
                                          <div className="flex items-center justify-between gap-4">
                                              <div className="text-[10px] opacity-70 flex justify-end gap-2 ml-auto">
                                                  <span>{toPersianDigits(msg.date)}</span>
                                                  <span>{toPersianDigits(msg.time)}</span>
                                              </div>
                                              {msg.sender === 'user' && selectedTicket.status === 'pending' && (
                                                  <button 
                                                      onClick={() => setEditingMessage({index, text: msg.text})}
                                                      className="text-white/50 hover:text-white transition-colors p-1"
                                                      title="ویرایش پیام"
                                                  >
                                                      <Edit className="w-3 h-3" />
                                                  </button>
                                              )}
                                          </div>
                                      </>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="p-4 border-t border-slate-800 bg-slate-900 text-center">
                      <p className="text-slate-500 text-xs">برای ارسال پیام جدید، لطفا تیکت جدید ثبت کنید.</p>
                  </div>
              </div>
          </div>
      )}

      {/* --- ADDED ORDER DETAIL MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-20">
                 <div>
                    <h3 className="text-xl font-bold text-white mb-1">جزئیات سفارش</h3>
                    <span className="text-sm text-slate-400">
                      شماره سفارش: {toPersianDigits(selectedOrder.orderNumber || selectedOrder.id)}
                    </span>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
                 {/* Status Timeline */}
                 <div className="flex flex-col md:flex-row justify-between relative px-2 md:px-10">
                    <TimelineStep title="ثبت سفارش" date={formatPersianDate(selectedOrder.date)} active={false} completed={true} />
                    <TimelineStep title="پردازش" date={null} active={['PROCESSING', 'processing'].includes(selectedOrder.status)} completed={['COMPLETED', 'completed', 'shipped', 'delivered'].includes(selectedOrder.status)} />
                    <TimelineStep title="ارسال شده" date={null} active={selectedOrder.status === 'shipped'} completed={['COMPLETED', 'completed', 'delivered'].includes(selectedOrder.status)} />
                    <TimelineStep title="تحویل شده" date={null} active={false} completed={['COMPLETED', 'completed', 'delivered'].includes(selectedOrder.status)} last={true} />
                 </div>

                 {/* Tracking Code */}
                 {selectedOrder.trackingCode && (
                    <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-700">
                       <span className="text-slate-400 text-sm">کد پیگیری پستی:</span>
                       <span className="text-white font-mono tracking-widest">{toPersianDigits(selectedOrder.trackingCode)}</span>
                    </div>
                 )}

                 {/* Address Info */}
                 {selectedOrder.address && (
                 <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                       <MapPin className="w-4 h-4 text-pharmacy-500" />
                       آدرس تحویل گیرنده
                    </h4>
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 text-sm text-slate-300 leading-relaxed">
                       {selectedOrder.address.fullAddress}
                       {selectedOrder.address.phone && (
                         <div className="mt-2 flex items-center gap-2 text-slate-400">
                           <Phone className="w-3.5 h-3.5 shrink-0" />
                           {toPersianDigits(selectedOrder.address.phone)}
                         </div>
                       )}
                       {selectedOrder.address.postalCode && <div className="mt-2 text-slate-500">کد پستی: {toPersianDigits(selectedOrder.address.postalCode)}</div>}
                    </div>
                 </div>
                 )}

                 {/* Items List */}
                 <div>
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                       <ShoppingBag className="w-4 h-4 text-pharmacy-500" />
                       اقلام سفارش
                    </h4>
                    <div className="space-y-3">
                       {(selectedOrder.items ?? []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                             <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-8 h-8 text-slate-400" />
                                )}
                             </div>
                             <div className="flex-grow min-w-0">
                                <h5 className="text-white font-bold text-sm line-clamp-2">{item.name}</h5>
                                <div className="flex justify-between mt-2 items-center gap-2">
                                   <span className="text-slate-500 text-xs">{toPersianDigits(item.quantity)} عدد</span>
                                   <span className="text-pharmacy-400 text-xs font-bold inline-flex items-center gap-1">
                                     {parseAndFormatPrice(item.lineTotal || item.price)}
                                     <img src="/toman-logo.png" alt="تومان" className="h-3 w-auto object-contain opacity-90" />
                                   </span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4 space-y-3">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-pharmacy-500" />
                      خلاصه مالی
                    </h4>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>جمع سبد خرید</span>
                      <span className="text-white tabular-nums">{selectedOrder.subtotalNum.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>هزینه ارسال</span>
                      <span className="text-white tabular-nums">{selectedOrder.shippingNum.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-700 pt-3">
                      <span className="text-white font-bold">مبلغ نهایی</span>
                      <span className="text-xl font-bold text-pharmacy-400 tabular-nums inline-flex items-center gap-1">
                        {selectedOrder.totalPrice.toLocaleString('fa-IR')}
                        <img src="/toman-logo.png" alt="تومان" className="h-4 w-auto object-contain opacity-90" />
                      </span>
                    </div>
                    {selectedOrder.paymentMethodTitle ? (
                      <p className="text-xs text-slate-500 pt-1">
                        روش پرداخت: {formatPaymentMethodTitle(selectedOrder.paymentMethodTitle)}
                      </p>
                    ) : null}
                 </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col md:flex-row gap-4">
                 {(selectedOrder.status || '').toUpperCase() === 'PENDING' && onCancelOrder && (
                    <button 
                      onClick={() => {
                          onCancelOrder(selectedOrder.id);
                          setSelectedOrder(null);
                          refetch();
                      }}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold py-3 rounded-xl transition-all"
                    >
                       لغو سفارش
                    </button>
                 )}
                 <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all">
                    دریافت فاکتور
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Main Profile Card */}
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

        {/* WooCommerce billing / profile — outside tab bar */}
        <div className="mb-6 rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900/80 to-slate-800/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-4 text-right min-w-0">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-pharmacy-500/15 border border-pharmacy-500/25 flex items-center justify-center">
              <IdCard className="w-6 h-6 text-pharmacy-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm sm:text-base">اطلاعات و آدرس صورتحساب</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                نام، تلفن و آدرس فاکتور در ووکامرس ذخیره می‌شود
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWooCommerceEdit(true)}
            className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pharmacy-500/15 hover:bg-pharmacy-500/25 border border-pharmacy-500/35 text-pharmacy-300 font-bold text-sm transition-all hover:text-white hover:border-pharmacy-500/50"
          >
            <Edit className="w-4 h-4" />
            ویرایش
          </button>
        </div>

        {/* Profile Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6 border-b border-slate-700/50 pb-1 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('info')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center whitespace-nowrap ${activeTab === 'info' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                اطلاعات
                {activeTab === 'info' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap ${activeTab === 'orders' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                سفارش‌ها
                <span className="bg-slate-700 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">{toPersianDigits(ordersDisplay.length)}</span>
                {activeTab === 'orders' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
            <button 
                onClick={() => setActiveTab('tickets')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap ${activeTab === 'tickets' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                مشاوره‌ها
                <span className="bg-slate-700 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">{toPersianDigits(tickets.length)}</span>
                {activeTab === 'tickets' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
            <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-1 text-[10px] md:text-sm font-bold transition-all relative flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap ${activeTab === 'reviews' ? 'text-pharmacy-500' : 'text-slate-400 hover:text-white'}`}
            >
                نظرات
                <span className="bg-slate-700 text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">{toPersianDigits(userReviews.length)}</span>
                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pharmacy-500 rounded-t-full"></span>}
            </button>
        </div>

        {/* INFO TAB */}
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

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-12 h-12 text-pharmacy-500 animate-spin" />
                        <p className="text-slate-400 text-sm">در حال بارگذاری سفارش‌ها...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 text-center border-2 border-dashed border-rose-500/50 rounded-3xl bg-rose-500/5">
                        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">خطا در بارگذاری سفارش‌ها</h3>
                        <p className="text-slate-400 text-sm mb-4">{error.message}</p>
                        <button onClick={() => refetch()} className="bg-pharmacy-500 hover:bg-pharmacy-600 text-white px-6 py-2 rounded-xl font-bold text-sm">
                            تلاش مجدد
                        </button>
                    </div>
                ) : ordersDisplay.length > 0 ? (
                    ordersDisplay.map((order) => (
                        <div
                            key={order.id}
                            className="bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden transition-all hover:border-slate-600 group"
                        >
                            <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-900/80">
                                <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className="bg-slate-800 p-3 rounded-xl shrink-0 border border-slate-700 shadow-inner">
                                            <Package className="w-6 h-6 text-pharmacy-500" />
                                        </div>
                                        <div className="text-right min-w-0 pt-0.5">
                                            <h4 className="font-bold text-white text-lg md:text-xl font-display mb-2">
                                                سفارش {toPersianDigits(order.orderNumber || order.id)}
                                            </h4>
                                            {order.paymentMethodTitle ? (
                                                <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap justify-end">
                                                    <CreditCard className="w-3.5 h-3.5 text-pharmacy-500 shrink-0" />
                                                    <span className="text-slate-300 leading-relaxed">
                                                        {formatPaymentMethodTitle(order.paymentMethodTitle)}
                                                    </span>
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    {(() => {
                                        const { Icon: StatusIcon, spin } = getOrderStatusPresentation(order.status);
                                        return (
                                            <div className="shrink-0 flex items-center justify-end w-full sm:w-auto">
                                                <div
                                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 backdrop-blur-sm shadow-lg ring-1 ring-white/5 w-full sm:min-w-[11rem] sm:max-w-[14rem] sm:w-auto ${getStatusColor(order.status)}`}
                                                >
                                                    <div className="rounded-xl bg-black/25 p-2 shrink-0 shadow-inner">
                                                        <StatusIcon className={`w-6 h-6 ${spin ? 'animate-spin' : ''}`} />
                                                    </div>
                                                    <div className="text-right min-w-0 flex-1">
                                                        <p className="text-[9px] font-extrabold text-current/70 uppercase tracking-widest mb-1">
                                                            وضعیت سفارش
                                                        </p>
                                                        <p className="text-sm font-bold leading-snug">
                                                            {getStatusLabel(order.status)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                                <div className="p-4 md:p-5 flex gap-3">
                                    <CalendarClock className="w-5 h-5 text-pharmacy-500 shrink-0 mt-0.5" />
                                    <div className="text-right min-w-0 flex-1">
                                        <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold mb-1">تاریخ ثبت سفارش</p>
                                        <p className="text-sm text-slate-200 leading-relaxed">{formatPersianDate(order.date) || '—'}</p>
                                    </div>
                                </div>
                                <div className="p-4 md:p-5 flex gap-3">
                                    <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                                    <div className="text-right min-w-0 flex-1">
                                        <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold mb-1">آخرین بروزرسانی / تایید</p>
                                        <p className="text-sm text-slate-200 leading-relaxed">{formatPersianDate(order.modified) || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {order.address && (order.address.city || order.address.address1 || order.address.phone) && (
                                <div className="p-4 md:p-5 border-b border-slate-800">
                                    <h5 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 justify-end">
                                        <MapPin className="w-4 h-4 text-pharmacy-500" />
                                        آدرس و تماس
                                    </h5>
                                    <p className="text-sm text-slate-300 leading-relaxed text-right">
                                        {[order.address.city, order.address.address1].filter(Boolean).join(' — ') || order.address.fullAddress}
                                    </p>
                                    {order.address.phone ? (
                                        <p className="text-sm text-slate-400 mt-2 flex items-center justify-end gap-2">
                                            <Phone className="w-4 h-4 shrink-0" />
                                            {toPersianDigits(order.address.phone)}
                                        </p>
                                    ) : null}
                                </div>
                            )}

                            <div className="p-4 md:p-5 border-b border-slate-800">
                                <h5 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 justify-end">
                                    <ShoppingBag className="w-4 h-4 text-pharmacy-500" />
                                    اقلام سفارش ({toPersianDigits(order.items?.length ?? 0)} قلم)
                                </h5>
                                <div className="space-y-2">
                                    {(order.items ?? []).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 px-3 rounded-xl bg-slate-800/40 border border-slate-700/60"
                                        >
                                            <span className="text-sm text-white font-medium text-right line-clamp-2">{item.name}</span>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs sm:text-sm">
                                                <span className="text-slate-500 whitespace-nowrap">{toPersianDigits(item.quantity)} عدد</span>
                                                <span className="text-pharmacy-400 font-bold inline-flex items-center gap-1 tabular-nums">
                                                    {parseAndFormatPrice(item.lineTotal || item.price)}
                                                    <img src="/toman-logo.png" alt="" className="h-3 w-auto opacity-90" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 md:p-5 bg-slate-950/40">
                                <div className="space-y-2.5 max-w-md mr-auto">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>جمع سبد خرید</span>
                                        <span className="text-slate-200 tabular-nums">{order.subtotalNum.toLocaleString('fa-IR')} تومان</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>هزینه ارسال</span>
                                        <span className="text-slate-200 tabular-nums">{order.shippingNum.toLocaleString('fa-IR')} تومان</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-700">
                                        <span className="text-base font-bold text-white">مبلغ نهایی</span>
                                        <span className="text-xl md:text-2xl font-bold text-pharmacy-400 tabular-nums inline-flex items-center gap-2">
                                            {order.totalPrice.toLocaleString('fa-IR')}
                                            <img src="/toman-logo.png" alt="تومان" className="h-4 w-auto object-contain opacity-90" />
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrder(order)}
                                        className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-pharmacy-500/10 active:scale-[0.99] text-sm"
                                    >
                                        مشاهده جزئیات و پیگیری
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">شما هنوز سفارشی ثبت نکرده‌اید.</h3>
                        <p className="text-slate-500 text-sm">لیست سفارشات شما در اینجا نمایش داده می‌شود.</p>
                    </div>
                )}
            </div>
        )}

        {/* TICKETS TAB (NEW) */}
        {activeTab === 'tickets' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                {tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <div key={ticket.id} className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 md:p-6 transition-all hover:border-slate-500">
                            {/* Header Section: Aligned like Orders */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right w-full md:w-auto">
                                    <div className="bg-slate-800 p-3 rounded-2xl shrink-0">
                                        <TicketIcon className="w-6 h-6 text-pharmacy-500" />
                                    </div>
                                    <div className="flex flex-col items-center md:items-start">
                                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1">
                                            <h4 className="font-bold text-white text-lg">{ticket.subject}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>کد پیگیری: {toPersianDigits(ticket.id.slice(-6))}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                            <span>{toPersianDigits(ticket.lastUpdate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Message Preview */}
                            <div className="bg-slate-800 rounded-xl p-4 mb-4 text-sm text-slate-300 line-clamp-2 leading-relaxed text-center md:text-right">
                                {ticket.messages[0].text}
                            </div>

                            {/* Action Button */}
                            <div className="flex gap-3 pt-4 border-t border-slate-800">
                                <button 
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700 hover:border-pharmacy-500 active:scale-95 text-sm flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    مشاهده گفتگو
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center border-2 border-dashed border-slate-700 rounded-3xl">
                        <TicketIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">تیکت مشاوره‌ای ندارید</h3>
                        <p className="text-slate-500 text-sm">شما می‌توانید از بخش "مشاوره تخصصی" سوالات خود را مطرح کنید.</p>
                    </div>
                )}
            </div>
        )}

        {/* REVIEWS TAB */}
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
