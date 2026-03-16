import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
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
import Magazine from './components/Magazine';
import { Product, CartItem, User, Address, Review, BlogPost, Order, OrderStatus, ShippingMethod, Ticket, TicketMessage } from './types';
import { ArrowDown, Search, X as CloseIcon, SlidersHorizontal, Baby, Dumbbell, Pill, Sparkles, Feather, LayoutGrid, Bone, Filter, SortAsc, SortDesc, Zap, ChevronLeft, ArrowLeft, Stethoscope, RotateCcw, Loader2 } from 'lucide-react';

// --- GraphQL Query ---
interface GetProductsData {
  products?: { nodes: any[] };
}

const GET_PRODUCTS = gql`
  query GetProducts {
    products(first: 100) {
      nodes {
        ... on SimpleProduct {
          databaseId
          name
          description
          regularPrice
          image {
            sourceUrl
          }
          productCategories {
            nodes {
              name
            }
          }
          acfdetails {
            brand
            usage
            warnings
            storage
            features
            properties
          }
        }
        ... on VariableProduct {
          databaseId
          name
          description
          regularPrice
          image {
            sourceUrl
          }
          productCategories {
            nodes {
              name
            }
          }
          acfdetails {
            brand
            usage
            warnings
            storage
            features
            properties
          }
        }
      }
    }
  }
`;

function mapWpProduct(wpNode: any): Product {
  const acf = wpNode?.acfdetails ?? {};
  const priceRaw = wpNode?.regularPrice ?? '';
  const priceStr = typeof priceRaw === 'string'
    ? priceRaw
    : String(priceRaw ?? '');
  const price = priceStr && !priceStr.includes('تومان')
    ? `${priceStr} تومان`
    : priceStr || '۰ تومان';

  const featuresRaw = acf?.features;
  const features: string[] = typeof featuresRaw === 'string'
    ? featuresRaw.split('|').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(featuresRaw)
      ? featuresRaw.map(String).filter(Boolean)
      : [];

  const propsRaw = acf?.properties;
  const properties: { label: string; value: string }[] = (() => {
    if (typeof propsRaw === 'string') {
      return propsRaw.split('|').map((part: string) => {
        const [label, value] = part.split(':').map((s: string) => s.trim());
        return { label: label || '', value: value ?? '' };
      }).filter(p => p.label || p.value);
    }
    if (Array.isArray(propsRaw)) {
      return propsRaw.map((p: any) =>
        typeof p === 'object' && p !== null
          ? { label: String(p.label ?? ''), value: String(p.value ?? '') }
          : { label: '', value: String(p ?? '') }
      ).filter(p => p.label || p.value);
    }
    return [];
  })();

  const categoryNode = wpNode?.productCategories?.nodes?.[0];
  const category = (categoryNode?.name && String(categoryNode.name)) || 'نامشخص';

  return {
    id: Number(wpNode?.databaseId) || 0,
    name: String(wpNode?.name ?? ''),
    description: String(wpNode?.description ?? '').replace(/<[^>]*>/g, ''),
    price,
    image: wpNode?.image?.sourceUrl ?? '',
    category,
    brand: String(acf?.brand ?? ''),
    details: {
      properties,
      features,
      usage: String(acf?.usage ?? ''),
      warnings: String(acf?.warnings ?? ''),
      storage: String(acf?.storage ?? '')
    }
  };
}

// --- Sample products for mock orders (used before real products load) ---
const SAMPLE_ORDER_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "کرم ضد آفتاب تخصصی لافارر SPF50",
    description: "محافظت کامل در برابر اشعه‌های UVA و UVB.",
    price: "۴۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1556228720-19de77d64eae?q=80&w=2000",
    category: "پوست و مو",
    brand: "Lafarrerr",
    details: { properties: [], features: [], usage: "", warnings: "", storage: "" }
  },
  {
    id: 2,
    name: "سرم ویتامین سی پریم",
    description: "روشن کننده و جوان کننده پوست.",
    price: "۱,۲۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887",
    category: "پوست و مو",
    brand: "Prime",
    details: { properties: [], features: [], usage: "", warnings: "", storage: "" }
  },
  {
    id: 3,
    name: "قرص کلاژن گلد",
    description: "کمک به سلامت پوست، مو و ناخن.",
    price: "۹۸۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2000",
    category: "مکمل های غذایی دارویی",
    brand: "Adian",
    details: { properties: [], features: [], usage: "", warnings: "", storage: "" }
  }
];

const MOCK_POSTS: BlogPost[] = [
    {
    id: '1',
    title: 'همه چیز درباره ضدآفتاب‌های SPF50 و تاثیر آنها بر پوست چرب',
    excerpt: 'انتخاب ضدآفتاب مناسب برای پوست‌های چرب همیشه چالش‌برانگیز است. در این مقاله به بررسی تاثیر SPF50 و ترکیبات موثر در کرم‌های لافارر می‌پردازیم.',
    content: `پوست چرب یکی از حساس‌ترین انواع پوست در برابر اشعه‌های مضر خورشید است. چربی اضافه می‌تواند باعث گرفتگی منافذ و ایجاد جوش شود، به همین دلیل انتخاب ضدآفتاب مناسب حیاتی است.
    
    ضدآفتاب‌های لافارر با فرمولاسیون فاقد چربی (Oil-Free) نه تنها از پوست محافظت می‌کنند، بلکه با داشتن عصاره‌های گیاهی مثل شیرین‌بیان و بیربری، به تنظیم ترشح چربی و روشن‌شدن لک‌های پوستی کمک می‌کنند.
    
    SPF50 به این معناست که پوست شما ۵۰ برابر بیشتر از حالت عادی در برابر سوختگی مقاومت دارد. این عدد برای شرایط آب و هوایی ایران بسیار مناسب است. نکته مهم در مصرف ضدآفتاب، تمدید آن هر ۲ ساعت یکبار است، به‌ویژه اگر در معرض نور مستقیم یا تعریق زیاد هستید.`,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=2070&auto=format&fit=crop',
    author: 'دکتر شمیم نسب',
    authorRole: 'دکترای داروسازی',
    date: '۱۴۰۲/۱۱/۱۰',
    readTime: '۵ دقیقه',
    category: 'پوست و مو',
    relatedProductIds: [1]
  },
  {
    id: '2',
    title: 'درمان ریزش مو با کافئین؛ حقیقت یا افسانه؟',
    excerpt: 'آیا شامپوهای حاوی کافئین واقعاً می‌توانند ریزش موی ارثی را درمان کنند؟ بررسی علمی تاثیر کافئین و مکمل هیرتامین بر فولیکول مو.',
    content: `ریزش موی آندروژنیک یا ارثی یکی از شایع‌ترین مشکلات در آقایان و خانم‌هاست. تحقیقات نشان داده‌اند که کافئین می‌تواند با مهار اثرات دی‌هیدروتستوسترون (DHT) بر فولیکول مو، فاز رشد مو را طولانی‌تر کند.
    
    شامپوهای کافئین‌دار سریتا با افزایش گردش خون مویرگی در پوست سر، مواد مغذی بیشتری را به ریشه مو می‌رسانند. اما شامپو به تنهایی کافی نیست. استفاده از مکمل‌های تخصصی مثل هیرتامین که حاوی بیوتین، زینک و آنتی‌اکسیدان‌های قوی است، درمان را تکمیل می‌کند.
    
    ترکیب درمان موضعی (شامپو) و خوراکی (مکمل) بهترین استراتژی برای مقابله با ریزش مو است.`,
    image: 'https://images.unsplash.com/photo-1632059368552-198160024513?q=80&w=2070',
    author: 'دکتر شمیم نسب',
    authorRole: 'دکترای داروسازی',
    date: '۱۴۰۲/۱۱/۱۲',
    readTime: '۶ دقیقه',
    category: 'پوست و مو',
    relatedProductIds: [5, 7]
  },
  {
    id: '3',
    title: 'روتین پوستی برای منافذ باز و جوش صورت',
    excerpt: 'اگر از پوست پرتقالی و جوش‌های زیرپوستی خسته شده‌اید، نیاسینامید و آبرسان‌های فاقد چربی بهترین دوستان شما هستند.',
    content: `منافذ باز پوست معمولاً نتیجه ترشح بیش از حد چربی و کاهش خاصیت ارتجاعی پوست هستند. سرم نیاسینامید اوردینری یکی از موثرترین ترکیبات برای تنظیم چربی و کوچک کردن ظاهر منافذ است.
    
    بسیاری از افراد با پوست چرب اشتباهاً فکر می‌کنند نیازی به آبرسان ندارند. اما دهیدراته شدن پوست باعث ترشح چربی بیشتر می‌شود! کرم آبرسان وچه با بافت سبک خود بدون ایجاد جوش، رطوبت لازم را تامین می‌کند.
    
    استفاده از تونر سی‌گل حاوی ویتامین C نیز می‌تواند به عنوان یک مرحله تکمیلی، باقیمانده آلودگی‌ها را از عمق منافذ پاک کرده و پوست را شفاف کند.`,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=2070',
    author: 'دکتر شمیم نسب',
    authorRole: 'دکترای داروسازی',
    date: '۱۴۰۲/۱۱/۱۵',
    readTime: '۴ دقیقه',
    category: 'پوست و مو',
    relatedProductIds: [9, 11, 12]
  },
  {
    id: '4',
    title: 'راهنمای تغذیه نوزاد؛ از شیر خشک تا شیشه شیر مناسب',
    excerpt: 'انتخاب شیر خشک مناسب و شیشه شیر ضد نفخ می‌تواند چالش‌های تغذیه نوزاد را به حداقل برساند. نکاتی که هر مادری باید بداند.',
    content: `شیر مادر بهترین غذا برای نوزاد است، اما در صورت نیاز به شیر خشک، انتخاب برندی که نزدیک‌ترین فرمولاسیون به شیر مادر را داشته باشد اهمیت دارد. شیر خشک آپتامیل با داشتن پره‌بیوتیک‌ها به سیستم ایمنی نوزاد کمک می‌کند.
    
    یکی از مشکلات رایج نوزادان، کولیک و نفخ است. استفاده از شیشه شیرهای استاندارد مثل اونت که سیستم آنتی‌کولیک دارند، از ورود هوا به معده نوزاد جلوگیری کرده و دل‌درد را کاهش می‌دهد.`,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070',
    author: 'دکتر متخصص اطفال',
    authorRole: 'مهمان',
    date: '۱۴۰۲/۱۱/۱۸',
    readTime: '۵ دقیقه',
    category: 'مادر و کودک',
    relatedProductIds: [6, 22]
  },
  {
    id: '5',
    title: 'تقویت سیستم ایمنی و مفاصل با مکمل‌های ضروری',
    excerpt: 'چرا باید امگا ۳ و ویتامین C مصرف کنیم؟ بررسی نقش این مکمل‌ها در سلامت قلب، مفاصل و پیشگیری از بیماری‌ها.',
    content: `در دنیای پر استرس امروز، بدن ما نیاز به حمایت بیشتری دارد. ویتامین C یوروویتال نه تنها سیستم ایمنی را تقویت می‌کند، بلکه برای ساخت کلاژن ضروری است.
    
    از طرف دیگر، اسیدهای چرب امگا ۳ که در کپسول‌های زهراوی یافت می‌شوند، خاصیت ضدالتهابی قوی دارند. این خاصیت برای کاهش دردهای مفصلی و همچنین حفظ سلامت قلب و عروق بسیار حیاتی است. مصرف منظم این مکمل‌ها کیفیت زندگی را به طور چشمگیری بهبود می‌بخشد.`,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=2070',
    author: 'دکتر شمیم نسب',
    authorRole: 'دکترای داروسازی',
    date: '۱۴۰۲/۱۱/۲۰',
    readTime: '۳ دقیقه',
    category: 'مکمل های غذایی دارویی',
    relatedProductIds: [17, 18]
  },
  {
    id: '6',
    title: 'پیشگیری و درمان دردهای ارتوپدی در منزل',
    excerpt: 'چگونه از مچ دست و زانو در برابر آسیب‌های روزمره محافظت کنیم؟ معرفی ساپورت‌های طبی استاندارد.',
    content: `کار با کامپیوتر و گوشی موبایل باعث شیوع سندرم تونل کارپال شده است. استفاده از مچ‌بندهای آتل‌دار پاک‌سمن در زمان استراحت می‌تواند فشار را از روی عصب مدیان برداشته و درد را کاهش دهد.
    
    همچنین زانو درد یکی از شکایات شایع در سنین مختلف است. زانوبندهای کشکک باز با تثبیت کشکک و گرم نگه داشتن مفصل، از آسیب‌های بیشتر جلوگیری می‌کنند.`,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080',
    author: 'فیزیوتراپ',
    authorRole: 'مهمان',
    date: '۱۴۰۲/۱۱/۲۲',
    readTime: '۴ دقیقه',
    category: 'محصولات ارتوپدی',
    relatedProductIds: [10, 23]
  },
  {
    id: '7',
    title: 'آرایش روزانه سبک و بادوام با محصولات فاقد سرب',
    excerpt: 'معرفی یک روتین آرایشی ساده با استفاده از ریمل اسنس، کرم پودر کالیستا و رژ لب این‌لی.',
    content: `برای یک آرایش روزانه، سلامت پوست در اولویت است. استفاده از محصولات فاقد سرب و پارابن مثل رژ لب‌های این‌لی از خشکی و تیرگی لب جلوگیری می‌کند.
    
    کرم پودر کالیستا با بافت مخملی خود پوششی یکدست ایجاد می‌کند اما منافذ را نمی‌بندد. در نهایت، یک ریمل خوب مثل اسنس می‌تواند گیرایی چشم‌ها را چند برابر کند بدون اینکه باعث ریزش مژه شود.`,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070',
    author: 'بیوتی بلاگر',
    authorRole: 'مهمان',
    date: '۱۴۰۲/۱۱/۲۵',
    readTime: '۵ دقیقه',
    category: 'محصولات آرایشی بهداشتی',
    relatedProductIds: [13, 14, 15]
  },
  {
    id: '8',
    title: 'افزایش حجم عضله یا کاهش وزن؟ کدام مکمل ورزشی مناسب شماست؟',
    excerpt: 'تفاوت پروتئین وی، گینر و کراتین چیست و کدام یک شما را سریع‌تر به هدف ورزشی‌تان می‌رساند؟',
    content: `انتخاب مکمل ورزشی کاملاً به تیپ بدنی و هدف شما بستگی دارد. اگر لاغر هستید و به سختی وزن می‌گیرید (اکتومورف)، گینر سریوس مس با کالری بالا بهترین انتخاب است.
    
    اما اگر هدف شما عضله‌سازی خشک و ریکاوری سریع است، پروتئین وی کاله گزینه ایده‌آلی است. کراتین نیز به عنوان یک مکمل قدرتی، توان شما را در تمرینات انفجاری افزایش می‌دهد و به حجم‌دهی سلول‌های عضلانی کمک می‌کند.`,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070',
    author: 'مربی بدنسازی',
    authorRole: 'مهمان',
    date: '۱۴۰۲/۱۱/۲۸',
    readTime: '۷ دقیقه',
    category: 'مکمل های ورزشی',
    relatedProductIds: [4, 19, 20]
  }
];

const CATEGORY_ITEMS = [
  { id: "همه محصولات", label: "همه", icon: LayoutGrid },
  { id: "محصولات ارتوپدی", label: "ارتوپدی", icon: Bone },
  { id: "محصولات آرایشی بهداشتی", label: "آرایشی بهداشتی", icon: Sparkles },
  { id: "پوست و مو", label: "پوست و مو", icon: Feather },
  { id: "مکمل های غذایی دارویی", label: "مکمل غذایی", icon: Pill },
  { id: "مکمل های ورزشی", label: "مکمل ورزشی", icon: Dumbbell },
  { id: "مادر و کودک", label: "مادر و کودک", icon: Baby },
];

const BRANDS = ["Lafarrerr", "Prime", "Cerita", "The Ordinary", "Simple", "Kalleh", "Aptamil", "My Baby", "Paksaman", "Cinere", "Seagull", "Callista", "Beurer", "Berry", "Xiaomi"];

const MOCK_REVIEWS: Review[] = [
  { id: '1', userId: 'user1', productId: 1, rating: 5, comment: 'عالی بود، پوستم خیلی شفاف شده.', date: '۱۴۰۲/۱۱/۱۲', userName: 'سارا' },
  { id: '2', userId: 'user2', productId: 1, rating: 4, comment: 'خوبه ولی حجمش کمه.', date: '۱۴۰۲/۱۱/۱۵', userName: 'مریم' },
];

const generateMockOrders = (): Order[] => {
    return [
        {
            id: 'ORD-982145',
            userId: 'user1',
            items: [
                { ...SAMPLE_ORDER_PRODUCTS[0], quantity: 1 },
                { ...SAMPLE_ORDER_PRODUCTS[2], quantity: 2 }
            ],
            totalPrice: 1520000,
            date: '۱۴۰۲/۱۰/۱۵',
            status: 'delivered',
            shippingMethod: ShippingMethod.POST,
            address: {
                id: 'addr1',
                title: 'منزل',
                city: 'تهران',
                province: 'تهران',
                fullAddress: 'تهران، خیابان شریعتی، بالاتر از پل صدر',
                postalCode: '193954678',
                lat: 35.7,
                lng: 51.4
            },
            trackingCode: '24685145987512345689'
        }
    ];
};

// --- FIX: Defined OUTSIDE App component to prevent re-renders ---
const CategoryShowcase = ({ 
    title, 
    products, 
    icon: Icon, 
    accentColor, 
    gradientFrom, 
    gradientTo, 
    filterId,
    onCategorySelect,
    favorites,
    onToggleFavorite,
    addToCart,
    setSelectedProduct,
    cart,
    updateQuantity,
    reviews
  }: { 
    title: string, 
    products: Product[], 
    icon: any, 
    accentColor: string, 
    gradientFrom: string, 
    gradientTo: string,
    filterId: string,
    onCategorySelect: (id: string) => void,
    favorites: number[],
    onToggleFavorite: (id: number) => void,
    addToCart: (product: Product) => void,
    setSelectedProduct: (product: Product) => void,
    cart: CartItem[],
    updateQuantity: (id: number, delta: number) => void,
    reviews: Review[]
  }) => (
      <section className="mb-20">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 overflow-hidden relative group">
              {/* Background Accents */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${gradientFrom} to-transparent rounded-full blur-[80px] opacity-30`}></div>
              <div className={`absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr ${gradientTo} to-transparent rounded-full blur-[80px] opacity-20`}></div>

              <div className="flex flex-col lg:flex-row">
                  {/* Header / Sidebar Area */}
                  <div className="w-full lg:w-1/4 p-8 lg:p-10 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-l border-slate-700/50">
                      <div>
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${accentColor} text-white`}>
                              <Icon className="w-8 h-8" />
                          </div>
                          <h3 className="text-3xl font-display font-bold text-white mb-3 leading-tight">
                              {title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-6">
                              بهترین محصولات {title} با ضمانت اصالت و کیفیت، انتخاب شده توسط متخصصین.
                          </p>
                      </div>
                      <button 
                          onClick={() => onCategorySelect(filterId)}
                          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95 bg-white/5 hover:bg-white/10 text-white border border-white/10`}
                      >
                          <span>مشاهده همه</span>
                          <ChevronLeft className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Products Horizontal List */}
                  <div className="w-full lg:w-3/4 p-6 lg:p-8">
                      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar snap-x">
                          {products.slice(0, 4).map((product) => (
                              <div key={product.id} className="min-w-[180px] md:min-w-[220px] snap-center">
                                  <ProductCard 
                                      product={product} 
                                      isFavorite={favorites.includes(product.id)}
                                      onToggleFavorite={() => onToggleFavorite(product.id)}
                                      onAddToCart={addToCart}
                                      onQuickView={(p) => setSelectedProduct(p)}
                                      cartQuantity={cart.find(i => i.id === product.id)?.quantity || 0}
                                      onUpdateQuantity={updateQuantity}
                                      reviewCount={reviews.filter(r => r.productId === product.id).length}
                                  />
                              </div>
                          ))}
                          <div className="min-w-[100px] flex items-center justify-center snap-center">
                              <button 
                                  onClick={() => onCategorySelect(filterId)}
                                  className="w-14 h-14 rounded-full bg-slate-700/50 hover:bg-pharmacy-500 hover:text-white text-slate-400 flex items-center justify-center transition-all border border-slate-600"
                              >
                                  <ArrowLeft className="w-6 h-6" />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
  );

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState<Product[]>([]);

  const { data, loading, error } = useQuery<GetProductsData>(GET_PRODUCTS);

  useEffect(() => {
    if (data?.products?.nodes) {
      const mapped = data.products.nodes
        .filter((node: any) => node?.databaseId)
        .map((node: any) => mapWpProduct(node))
        .filter((p: Product) => p.id && p.name);
      setProducts(mapped);
    }
  }, [data]);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("همه محصولات");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("همه برندها");
  const [sortOrder, setSortOrder] = useState<"default" | "asc" | "desc">("default");

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMagazinePost, setSelectedMagazinePost] = useState<BlogPost | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pharmacy_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('pharmacy_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
      return generateMockOrders();
  });

  // --- Ticket State ---
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('pharmacy_tickets');
    if (saved) return JSON.parse(saved);
    // Initialize with one sample answered ticket if empty
    return [{
        id: 'T-SAMPLE-1',
        userId: 'current-user-or-sample', // This will be filtered in profile by matching ID, so sample works if user logic matches or ignores it for demo
        subject: 'پوست و مو',
        status: 'answered',
        messages: [
            {
                text: 'سلام، پوستم خیلی چرب هست و جوش میزنم. چه روتینی پیشنهاد می‌کنید؟',
                sender: 'user',
                date: '۱۴۰۲/۱۱/۲۰',
                time: '۱۰:۳۰'
            },
            {
                text: 'سلام کاربر گرامی. برای پوست چرب و مستعد آکنه، پیشنهاد ما استفاده از ژل شستشوی دیپ سنس و سپس استفاده از سرم نیاسینامید اوردینری است. همچنین استفاده از ضدآفتاب فاقد چربی لافارر فراموش نشود.',
                sender: 'support',
                date: '۱۴۰۲/۱۱/۲۰',
                time: '۱۰:۴۵'
            }
        ],
        lastUpdate: '۱۴۰۲/۱۱/۲۰'
    }];
  });

  useEffect(() => {
    localStorage.setItem('pharmacy_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const productSectionRef = useRef<HTMLDivElement>(null);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pharmacy_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('pharmacy_favorites');
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem('pharmacy_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
      if ('Notification' in window && Notification.permission === 'default') {
          // Check perms
      }
  }, []);

  const sendPushNotification = (title: string, body: string) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://drshamimnasab.ir/wp-content/uploads/2026/01/logoshamimnasab2_2048x725.png',
        dir: 'rtl'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
             body,
             icon: 'https://drshamimnasab.ir/wp-content/uploads/2026/01/logoshamimnasab2_2048x725.png',
             dir: 'rtl'
          });
        }
      });
    }
  };

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

  // Review Handlers
  const handleAddReview = (review: Review) => {
    setReviews(prev => [review, ...prev]);
  };

  const handleUpdateReview = (updatedReview: Review) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const handleCancelOrder = (orderId: string) => {
      setOrders(prev => prev.map(order => 
          order.id === orderId 
          ? { ...order, status: 'cancelled' } 
          : order
      ));
      sendPushNotification('سفارش لغو شد', `سفارش شماره ${orderId} با موفقیت لغو گردید.`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
      setOrders(prev => prev.map(order => 
          order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      
      let message = "";
      if (newStatus === 'shipped') message = `سفارش شماره ${orderId} به پست تحویل داده شد.`;
      if (newStatus === 'delivered') message = `سفارش شماره ${orderId} تحویل داده شد.`;
      
      if (message) {
          sendPushNotification('وضعیت سفارش تغییر کرد', message);
      }
  };

  // --- Ticket Handler ---
  const handleCreateTicket = (subject: string, message: string) => {
    if (!currentUser) {
        setIsAuthOpen(true);
        return;
    }

    const newMessage: TicketMessage = {
        text: message,
        sender: 'user',
        date: new Date().toLocaleDateString('fa-IR'),
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    const autoReplyMessage: TicketMessage = {
        text: 'سوال شما ثبت شد. لطفاً منتظر پاسخ مشاور باشید.',
        sender: 'support',
        date: new Date().toLocaleDateString('fa-IR'),
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    const newTicket: Ticket = {
        id: Date.now().toString(),
        userId: currentUser.id,
        subject: subject,
        status: 'pending',
        messages: [newMessage, autoReplyMessage],
        lastUpdate: new Date().toLocaleDateString('fa-IR')
    };

    setTickets(prev => [newTicket, ...prev]);
    sendPushNotification('تیکت ثبت شد', `تیکت شما با موضوع "${subject}" با موفقیت ثبت شد.`);
  };

  const handleUpdateTicketMessage = (ticketId: string, messageIndex: number, newText: string) => {
      setTickets(prev => prev.map(ticket => {
          if (ticket.id === ticketId) {
              const updatedMessages = [...ticket.messages];
              if (updatedMessages[messageIndex]) {
                  updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], text: newText };
                  return { ...ticket, messages: updatedMessages };
              }
          }
          return ticket;
      }));
  };

  const scrollToProducts = () => {
    setActiveTab('products'); 
  };

  const resetFilters = () => {
      setSearchQuery("");
      setSelectedCategory("همه محصولات");
      setSelectedBrand("همه برندها");
      setSortOrder("default");
  };

  // --- Filtering Logic ---
  const parsePrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "همه محصولات" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === "همه برندها" || p.brand === selectedBrand;
    return matchesCategory && matchesSearch && matchesBrand;
  }).sort((a, b) => {
      if (sortOrder === "asc") return parsePrice(a.price) - parsePrice(b.price);
      if (sortOrder === "desc") return parsePrice(b.price) - parsePrice(a.price);
      return 0;
  });

  const medicalProducts = products.filter(p => p.category === "تجهیزات پزشکی");
  const cosmeticsProducts = products.filter(p => p.category === "محصولات آرایشی بهداشتی");
  const skinHairProducts = products.filter(p => p.category === "پوست و مو");
  const supplementProducts = products.filter(p => p.category.includes("مکمل"));
  const momBabyProducts = products.filter(p => p.category === "مادر و کودک");

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
          reviews={reviews.filter(r => r.productId === selectedProduct.id)}
          onAddReview={handleAddReview}
          currentUser={currentUser}
          onOpenLogin={() => {
            setIsAuthOpen(true);
            setSelectedProduct(null);
          }}
          relatedPost={MOCK_POSTS.find(post => post.relatedProductIds?.includes(selectedProduct.id))}
          onOpenArticle={(post) => {
              setSelectedProduct(null);
              setSelectedMagazinePost(post);
              setActiveTab('mag');
          }}
        />
      )}

      <main>
        {loading && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-24 px-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-pharmacy-500/30 border-t-pharmacy-500 animate-spin" />
              <Loader2 className="w-12 h-12 text-pharmacy-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" strokeWidth={2} />
            </div>
            <p className="text-slate-400 font-medium">در حال بارگذاری محصولات...</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl h-64 animate-pulse border border-slate-700/50" />
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="max-w-2xl mx-4 sm:mx-auto my-24 p-6 rounded-2xl bg-red-500/10 border-2 border-red-500/50 text-red-400">
            <h3 className="text-xl font-bold mb-2">خطا در دریافت محصولات</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
        {!loading && !error && (
        <>
        {activeTab === 'home' && (
          <>
            <Hero 
              onExplore={() => {
                   const element = document.getElementById('ai-search-box');
                   element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }} 
              onConsultation={() => setActiveTab('consultation')} 
            />
            
            <div ref={productSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-pharmacy-500/5 rounded-full blur-3xl -z-10"></div>
              
              {/* --- MODERN AI SEARCH SECTION --- */}
              <div id="ai-search-box" className="mb-24 relative z-20">
                  <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8">
                          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 flex items-center justify-center gap-2">
                             <Sparkles className="text-pharmacy-400 w-6 h-6 animate-pulse" />
                             دنبال چی میگردی؟
                          </h3>
                          <p className="text-slate-400 text-sm md:text-base">نام محصول، برند یا مشکل خود را بنویسید تا هوش مصنوعی بهترین‌ها را پیشنهاد دهد.</p>
                      </div>
                      
                      <div className="relative group">
                          {/* GLOW EFFECT RESTORED HERE */}
                          <div className="absolute inset-0 bg-gradient-to-r from-pharmacy-500 via-purple-500 to-pharmacy-500 rounded-[2rem] opacity-30 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10"></div>
                          
                          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1.5 md:p-2 flex items-center shadow-2xl transition-all group-hover:border-white/20 group-hover:bg-white/10">
                              <div className="p-3 md:p-4 hidden xs:block">
                                  <Search className="w-6 h-6 md:w-8 md:h-8 text-pharmacy-400" />
                              </div>
                              <input 
                                  type="text" 
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="مثلا: کرم ضد آفتاب..."
                                  className="w-full bg-transparent border-none outline-none text-white text-sm md:text-xl placeholder:text-slate-500 h-12 md:h-14 px-2"
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                          setActiveTab('products');
                                      }
                                  }}
                              />
                              <button 
                                  onClick={() => setActiveTab('products')}
                                  className="bg-pharmacy-500 hover:bg-pharmacy-400 text-white px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] font-bold text-xs md:text-base transition-all shadow-lg active:scale-95 whitespace-nowrap ml-1 flex items-center gap-2"
                              >
                                 <Search className="w-4 h-4 md:hidden" />
                                 <span>جستجو</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="text-center mb-16 px-4">
                <span className="text-pharmacy-500 font-bold tracking-wider uppercase text-xs md:text-sm bg-pharmacy-900/30 px-3 py-1 rounded-full border border-pharmacy-500/20">پیشنهاد ویژه</span>
                <h2 className="text-3xl md:text-5xl font-display font-normal text-white mt-4 mb-4">ویترین محصولات</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">دسته‌بندی‌های منتخب و پرطرفدار داروخانه دکتر شمیم‌نسب</p>
              </div>

              {/* --- NEW CATEGORY SHOWCASES (Using the external component) --- */}
              
              <CategoryShowcase 
                  title="آرایشی و زیبایی" 
                  products={cosmeticsProducts}
                  icon={Sparkles}
                  accentColor="bg-pink-500"
                  gradientFrom="from-pink-500/40"
                  gradientTo="to-purple-500/40"
                  filterId="محصولات آرایشی بهداشتی"
                  onCategorySelect={(id) => { setSelectedCategory(id); setActiveTab('products'); }}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  setSelectedProduct={setSelectedProduct}
                  cart={cart}
                  updateQuantity={updateQuantity}
                  reviews={reviews}
              />

              <CategoryShowcase 
                  title="مراقبت پوست و مو" 
                  products={skinHairProducts}
                  icon={Feather}
                  accentColor="bg-pharmacy-500"
                  gradientFrom="from-pharmacy-500/40"
                  gradientTo="to-teal-500/40"
                  filterId="پوست و مو"
                  onCategorySelect={(id) => { setSelectedCategory(id); setActiveTab('products'); }}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  setSelectedProduct={setSelectedProduct}
                  cart={cart}
                  updateQuantity={updateQuantity}
                  reviews={reviews}
              />

              <CategoryShowcase 
                  title="مکمل‌های ورزشی و دارویی" 
                  products={supplementProducts}
                  icon={Zap}
                  accentColor="bg-orange-500"
                  gradientFrom="from-orange-500/40"
                  gradientTo="to-amber-500/40"
                  filterId="مکمل های ورزشی" 
                  onCategorySelect={(id) => { setSelectedCategory(id); setActiveTab('products'); }}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  setSelectedProduct={setSelectedProduct}
                  cart={cart}
                  updateQuantity={updateQuantity}
                  reviews={reviews}
              />

              <CategoryShowcase 
                  title="مادر و کودک" 
                  products={momBabyProducts}
                  icon={Baby}
                  accentColor="bg-sky-500"
                  gradientFrom="from-sky-500/40"
                  gradientTo="to-indigo-500/40"
                  filterId="مادر و کودک"
                  onCategorySelect={(id) => { setSelectedCategory(id); setActiveTab('products'); }}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  setSelectedProduct={setSelectedProduct}
                  cart={cart}
                  updateQuantity={updateQuantity}
                  reviews={reviews}
              />
              
              <div className="flex justify-center mt-20 mb-32">
                 <button 
                    onClick={() => {
                        setSelectedCategory("همه محصولات");
                        setActiveTab('products');
                    }}
                    className="group relative px-8 py-4 bg-pharmacy-500 text-white rounded-full font-bold overflow-hidden shadow-lg hover:shadow-pharmacy-500/40 transition-all hover:-translate-y-1 active:scale-95"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                         <span className="text-lg">مشاهده همه محصولات</span>
                         <ArrowDown className="w-5 h-5 animate-bounce" />
                    </div>
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

                    {/* Search Bar */}
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
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Brand Filter */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select 
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-2xl px-10 py-3 text-white focus:border-pharmacy-500 outline-none cursor-pointer"
                            >
                                <option value="همه برندها">همه برندها</option>
                                {BRANDS.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Sort */}
                        <div className="relative flex-1 w-full">
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                            </div>
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                                className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-2xl px-10 py-3 text-white focus:border-pharmacy-500 outline-none cursor-pointer"
                            >
                                <option value="default">مرتب‌سازی پیش‌فرض</option>
                                <option value="asc">ارزان‌ترین به گران‌ترین</option>
                                <option value="desc">گران‌ترین به ارزان‌ترین</option>
                            </select>
                        </div>

                        {(searchQuery !== "" || selectedCategory !== "همه محصولات" || selectedBrand !== "همه برندها" || sortOrder !== "default") && (
                            <button 
                                onClick={resetFilters}
                                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-6 py-3 rounded-2xl transition-all border border-rose-500/20 w-full md:w-auto justify-center"
                                title="حذف تمام فیلترها"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span className="text-sm font-bold">حذف فیلترها</span>
                            </button>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-bold">
                           <SlidersHorizontal className="w-4 h-4" />
                           دسته‌بندی‌ها
                        </div>
                        
                        {/* Changed from flex/overflow-x-auto to Grid for full visibility */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                            {CATEGORY_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isSelected = selectedCategory === item.id;
                                return (
                                    <button 
                                        key={item.id} 
                                        onClick={() => setSelectedCategory(item.id)} 
                                        className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all group ${
                                            isSelected ? 'scale-105' : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                                            isSelected 
                                            ? 'bg-pharmacy-500 text-white shadow-pharmacy-500/30' 
                                            : 'bg-slate-800 border border-slate-700 text-slate-400 group-hover:border-slate-500'
                                        }`}>
                                            <Icon className="w-6 h-6 md:w-8 md:h-8" />
                                        </div>
                                        <span className={`text-xs font-bold text-center ${
                                            isSelected ? 'text-pharmacy-400' : 'text-slate-400'
                                        }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
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
                                reviewCount={reviews.filter(r => r.productId === product.id).length}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-slate-800/20 rounded-[3rem] border-2 border-slate-800 border-dashed">
                        <Search className="w-20 h-20 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">محصولی پیدا نشد!</h3>
                        <p className="text-slate-500 text-sm md:text-lg">لطفاً عبارت دیگری را جستجو کنید یا فیلترها را تغییر دهید.</p>
                        <button 
                            onClick={resetFilters}
                            className="mt-10 bg-slate-800 px-8 py-3 rounded-2xl text-pharmacy-500 font-bold hover:text-white transition-colors"
                        >
                            پاک کردن همه فیلترها
                        </button>
                    </div>
                )}
             </div>
        )}

        {activeTab === 'mag' && (
          <Magazine 
            posts={MOCK_POSTS}
            products={products}
            onOpenProduct={(p) => setSelectedProduct(p)}
            onAddToCart={addToCart}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            cart={cart}
            onUpdateQuantity={updateQuantity}
            initialPost={selectedMagazinePost}
            onClearInitialPost={() => setSelectedMagazinePost(null)}
          />
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
            <Consultation 
                notify={sendPushNotification}
                onCreateTicket={handleCreateTicket}
                tickets={tickets}
                onUpdateTicketMessage={handleUpdateTicketMessage}
                onGoToProfile={() => {
                    if (currentUser) {
                        setActiveTab('profile');
                    } else {
                        setIsAuthOpen(true);
                    }
                }}
            />
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
              userReviews={reviews.filter(r => r.userId === currentUser.id)}
              products={products}
              onUpdateReview={handleUpdateReview}
              onDeleteReview={handleDeleteReview}
              orders={orders}
              onCancelOrder={handleCancelOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenProduct={(p) => setSelectedProduct(p)}
              tickets={tickets.filter(t => t.userId === currentUser.id || t.id === 'T-SAMPLE-1')} // Allow sample ticket for demo
              onUpdateTicketMessage={handleUpdateTicketMessage}
            />
        )}

        {activeTab === 'checkout' && currentUser && (
          <CheckoutWizard 
            items={cart} 
            user={currentUser} 
            onComplete={(orderData: any) => {
                const newOrder: Order = {
                    id: `ORD-${Date.now().toString().slice(-6)}`,
                    userId: currentUser.id,
                    items: [...cart],
                    totalPrice: orderData.total,
                    date: new Date().toLocaleDateString('fa-IR'),
                    status: 'pending',
                    shippingMethod: orderData.shipping,
                    address: currentUser.addresses.find(a => a.id === orderData.selectedAddress)!,
                    trackingCode: undefined
                };
                
                setOrders(prev => [newOrder, ...prev]);
                setCart([]);
                setActiveTab('profile'); // Redirect to profile to see the new order
                sendPushNotification('سفارش ثبت شد', 'سفارش شما با موفقیت ثبت گردید و در حال پردازش است.');
                alert('سفارش شما با موفقیت ثبت شد!');
            }}
            onCancel={() => setActiveTab('cart')}
            onAddAddress={() => setIsAddressFormOpen(true)}
          />
        )}
        </>
        )}
      </main>

      {activeTab !== 'consultation' && <Footer />}
      
      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />
    </div>
  );
};

export default App;
