
import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import Cart from './components/Cart';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Profile from './components/Profile';
import AddressForm from './components/AddressForm';
import CheckoutWizard from './components/CheckoutWizard';
import Consultation from './components/Consultation';
import MobileNav from './components/MobileNav';
import { Product, CartItem, User, Address } from './types';
import { ArrowLeft, Search, X as CloseIcon, SlidersHorizontal } from 'lucide-react';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "کرم ضد آفتاب تخصصی لافارر SPF50",
    description: "محافظت کامل در برابر اشعه‌های UVA و UVB، مناسب پوست‌های چرب و مختلط، با بافت سبک و جذب سریع. این محصول حاوی عصاره‌های گیاهی موثر در کاهش لک‌های پوستی است.",
    price: "۴۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1556228720-19de77d64eae?q=80&w=2000&auto=format&fit=crop",
    category: "مراقبت پوست"
  },
  {
    id: 2,
    name: "سرم ویتامین سی پریم",
    description: "روشن کننده و جوان کننده پوست، حاوی ویتامین C پایدار و عصاره کاکادو. این سرم با تحریک کلاژن‌سازی، به کاهش علائم پیری و شفافیت پوست کمک شایانی می‌کند.",
    price: "۱,۲۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop",
    category: "مراقبت پوست"
  },
  {
    id: 3,
    name: "قرص کلاژن گلد (Collagen Gold)",
    description: "کمک به سلامت پوست، مو و ناخن، کاهش چین و چروک و افزایش خاصیت ارتجاعی پوست. کلاژن گلد مکملی ایده‌آل برای بازیابی طراوت و زیبایی طبیعی شماست.",
    price: "۹۸۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2000&auto=format&fit=crop",
    category: "مکمل دارویی"
  },
  {
    id: 4,
    name: "پودر پروتئین وی کاله (۲۲۷۰ گرم)",
    description: "خلوص بالا، طعم شکلاتی، مناسب برای ورزشکاران حرفه‌ای جهت عضله سازی و ریکاوری. این محصول با داشتن طیف کاملی از اسیدهای آمینه، بهترین انتخاب برای بعد از تمرین است.",
    price: "۳,۴۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=1887&auto=format&fit=crop",
    category: "مکمل ورزشی"
  },
  {
    id: 5,
    name: "شامپو ضد ریزش کافئین سریتا",
    description: "محرک رشد مو، افزایش خون‌رسانی به کف سر و تقویت ریشه موها. استفاده منظم از این شامپو باعث ضخیم شدن تارهای مو و کنترل ریزش می‌شود.",
    price: "۱۸۵,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=2070&auto=format&fit=crop",
    category: "مراقبت مو"
  },
  {
    id: 6,
    name: "شیر خشک آپتامیل ۱ نوتریشیا",
    description: "حاوی پره بیوتیک و پست بیوتیک، مناسب برای شیرخواران از بدو تولد تا ۶ ماهگی. فرمولاسیون این محصول بسیار نزدیک به شیر مادر است.",
    price: "۱۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1632053001869-7c8fa07137b0?q=80&w=2070&auto=format&fit=crop",
    category: "مادر و کودک"
  },
  {
    id: 7,
    name: "کپسول هیرتامین (Hairtamin)",
    description: "تقویت کننده قوی مو، جلوگیری از ریزش و افزایش ضخامت تارهای مو. هیرتامین مجموعه‌ای غنی از ویتامین‌ها و مواد معدنی ضروری برای زیبایی موهای شماست.",
    price: "۱,۶۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=1974&auto=format&fit=crop",
    category: "مکمل دارویی"
  },
  {
    id: 8,
    name: "مرطوب کننده و آبرسان قوی سیمپل",
    description: "بافت سبک بر پایه آب، بدون چربی، مناسب برای انواع پوست حتی پوست حساس. سیمپل برندی پیشرو در تولید محصولات وگان و ضد حساسیت است.",
    price: "۳۲۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1974&auto=format&fit=crop",
    category: "مراقبت پوست"
  },
  {
    id: 9,
    name: "سرم ضد جوش نیاسینامید اوردینری",
    description: "کنترل چربی پوست و کاهش منافذ باز، شفاف کننده و بهبود دهنده بافت پوست. این سرم غنی از نیاسینامید و زینک برای مبارزه با التهاب و آکنه است.",
    price: "۸۹۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=1887&auto=format&fit=crop",
    category: "مراقبت پوست"
  }
];

const CATEGORIES = ["همه محصولات", "مراقبت پوست", "مراقبت مو", "مکمل دارویی", "مکمل ورزشی", "مادر و کودک"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("همه محصولات");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pharmacy_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const productSectionRef = useRef<HTMLDivElement>(null);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pharmacy_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('pharmacy_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Ensure scroll to top on tab change or search trigger
  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  useEffect(() => {
    const isAnyModalOpen = !!selectedProduct || isAuthOpen || isAddressFormOpen;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
  }, [selectedProduct, isAuthOpen, isAddressFormOpen]);

  useEffect(() => {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pharmacy_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pharmacy_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pharmacy_user');
    }
  }, [currentUser]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity === 1 && delta === -1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleCheckoutStart = () => {
    if (!currentUser) setIsAuthOpen(true);
    else setActiveTab('checkout');
  };

  const saveAddress = (addr: Address) => {
    if (currentUser) {
      const exists = currentUser.addresses.find(a => a.id === addr.id);
      const newAddresses = exists 
        ? currentUser.addresses.map(a => a.id === addr.id ? addr : a)
        : [...currentUser.addresses, addr];
      setCurrentUser({ ...currentUser, addresses: newAddresses });
      setIsAddressFormOpen(false);
      setEditingAddress(null);
    }
  };

  const scrollToProducts = () => {
    setActiveTab('home'); 
    setTimeout(() => {
        productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "همه محصولات" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-pharmacy-500 selection:text-white pb-20 md:pb-0">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        currentUser={currentUser}
        onLoginClick={() => setIsAuthOpen(true)}
      />

      <Auth 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={setCurrentUser} 
        currentUser={currentUser} 
      />

      {isAddressFormOpen && (
        <AddressForm 
          initialAddress={editingAddress}
          onSave={saveAddress} 
          onCancel={() => {
              setIsAddressFormOpen(false);
              setEditingAddress(null);
          }} 
        />
      )}

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          isFavorite={favorites.includes(selectedProduct.id)}
          onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
          cartQuantity={cart.find(i => i.id === selectedProduct.id)?.quantity || 0}
          onUpdateQuantity={updateQuantity}
        />
      )}

      <main>
        {activeTab === 'home' && (
          <>
            <Hero 
              onExplore={scrollToProducts} 
              onConsultation={() => setActiveTab('consultation')} 
            />
            
            <div ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-pharmacy-500/5 rounded-full blur-3xl -z-10"></div>
              <div className="text-center mb-16 px-4">
                <span className="text-pharmacy-500 font-bold tracking-wider uppercase text-xs md:text-sm bg-pharmacy-900/30 px-3 py-1 rounded-full border border-pharmacy-500/20">پیشنهاد ویژه</span>
                {/* Changed font-bold to font-normal as requested */}
                <h2 className="text-3xl md:text-5xl font-display font-normal text-white mt-4 mb-4">ویترین محصولات</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">بهترین برندهای آرایشی و مکمل‌های دارویی با تاییدیه وزارت بهداشت.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
                {products.slice(0, 4).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    onAddToCart={addToCart}
                    onQuickView={(p) => setSelectedProduct(p)}
                    cartQuantity={cart.find(i => i.id === product.id)?.quantity || 0}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
              
              <div className="flex justify-center px-4">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="w-full md:w-auto group flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 md:py-4 rounded-3xl font-bold transition-all border border-slate-700 hover:border-pharmacy-500 shadow-xl"
                >
                  مشاهده همه محصولات
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 min-h-screen">
                <div className="flex flex-col gap-8 mb-16 border-b border-slate-800 pb-12">
                    <div className="text-center md:text-right">
                        <h2 className="text-3xl md:text-6xl font-display font-bold text-white mb-3">محصولات داروخانه</h2>
                        <p className="text-slate-400 text-sm md:text-lg">جستجو و فیلتر از بین ۱۲۰۰ کالای دارویی و آرایشی</p>
                    </div>

                    {/* Search and Filters Bar */}
                    <div className="flex flex-col gap-6">
                        <div className="relative group">
                            <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="نام محصول، برند یا دسته‌بندی..."
                              className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl md:rounded-[2.5rem] py-5 pr-14 pl-6 text-white outline-none focus:border-pharmacy-500 focus:bg-slate-800 transition-all text-lg shadow-2xl"
                            />
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6 group-focus-within:text-pharmacy-500 transition-colors" />
                            {searchQuery && (
                                <button 
                                  onClick={() => setSearchQuery("")}
                                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                            <div className="flex-shrink-0 bg-slate-800 p-3 rounded-2xl border border-slate-700">
                                <SlidersHorizontal className="w-6 h-6 text-pharmacy-500" />
                            </div>
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => setSelectedCategory(cat)} 
                                    className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm md:text-base font-bold transition-all border ${
                                        selectedCategory === cat 
                                        ? 'bg-pharmacy-500 border-pharmacy-500 text-white shadow-lg' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                        {filteredProducts.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                isFavorite={favorites.includes(product.id)}
                                onToggleFavorite={() => toggleFavorite(product.id)}
                                onAddToCart={addToCart}
                                onQuickView={(p) => setSelectedProduct(p)}
                                cartQuantity={cart.find(i => i.id === product.id)?.quantity || 0}
                                onUpdateQuantity={updateQuantity}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-slate-800/20 rounded-[3rem] border-2 border-slate-800 border-dashed">
                        <Search className="w-20 h-20 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">محصولی پیدا نشد!</h3>
                        <p className="text-slate-500 text-sm md:text-lg">لطفاً عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید.</p>
                        <button 
                            onClick={() => { setSearchQuery(""); setSelectedCategory("همه محصولات"); }}
                            className="mt-10 bg-slate-800 px-8 py-3 rounded-2xl text-pharmacy-500 font-bold hover:text-white transition-colors"
                        >
                            پاک کردن همه فیلترها
                        </button>
                    </div>
                )}
             </div>
        )}

        {activeTab === 'cart' && (
            <Cart 
                items={cart} 
                onUpdateQuantity={updateQuantity} 
                onRemove={removeFromCart} 
                onCheckout={handleCheckoutStart} 
                onContinueShopping={() => setActiveTab('products')}
            />
        )}

        {activeTab === 'consultation' && (
            <Consultation />
        )}

        {activeTab === 'profile' && currentUser && (
            <Profile 
              user={currentUser} 
              onLogout={() => { setCurrentUser(null); setActiveTab('home'); }} 
              onAddAddress={() => setIsAddressFormOpen(true)}
              onEditAddress={(addr) => {
                  setEditingAddress(addr);
                  setIsAddressFormOpen(true);
              }}
              onDeleteAddress={(id) => setCurrentUser({ ...currentUser, addresses: currentUser.addresses.filter(a => a.id !== id) })}
              onUpdateProfile={(f, l, n, p) => setCurrentUser({ ...currentUser, firstName: f, lastName: l, nationalId: n, phone: p })}
            />
        )}

        {activeTab === 'checkout' && currentUser && (
          <CheckoutWizard 
            items={cart} 
            user={currentUser} 
            onComplete={() => {
              alert('سفارش شما با موفقیت ثبت شد!');
              setCart([]);
              setActiveTab('home');
            }} 
            onCancel={() => setActiveTab('cart')}
            onAddAddress={() => setIsAddressFormOpen(true)}
          />
        )}
      </main>

      {activeTab !== 'consultation' && <Footer />}
      
      {/* Mobile Bottom Navigation Bar */}
      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />
    </div>
  );
};

export default App;
