
import React, { useState, useEffect } from 'react';
import { BlogPost, Product } from '../types';
import { Clock, User, Calendar, ArrowLeft, Share2, Bookmark, ChevronRight, Star, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import ProductCard from './ProductCard';

interface MagazineProps {
  posts: BlogPost[];
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  cart: any[];
  onUpdateQuantity: (id: number, delta: number) => void;
  initialPost?: BlogPost | null;
  onClearInitialPost?: () => void;
}

const Magazine: React.FC<MagazineProps> = ({ 
  posts, 
  products, 
  onOpenProduct, 
  onAddToCart,
  favorites,
  onToggleFavorite,
  cart,
  onUpdateQuantity,
  initialPost,
  onClearInitialPost
}) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(initialPost || null);

  // Sync initialPost if it changes (rare, but good for robust deep linking)
  useEffect(() => {
    if (initialPost) {
        setSelectedPost(initialPost);
    }
  }, [initialPost]);

  const handleCloseArticle = () => {
      setSelectedPost(null);
      if (onClearInitialPost) onClearInitialPost();
  };

  if (selectedPost) {
    const relatedProduct = selectedPost.relatedProductId 
      ? products.find(p => p.id === selectedPost.relatedProductId) 
      : null;

    const getNumericPrice = (priceStr: string) => {
        const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
        const englishDigits = '0123456789';
        let cleanStr = priceStr;
        for (let i = 0; i < 10; i++) {
          cleanStr = cleanStr.split(persianDigits[i]).join(englishDigits[i]);
        }
        return parseInt(cleanStr.replace(/[^0-9]/g, ''), 10) || 0;
    };

    let oldPrice = 0;
    let quantity = 0;

    if (relatedProduct) {
        const numericPrice = getNumericPrice(relatedProduct.price);
        oldPrice = Math.round(numericPrice / (1 - 15 / 100));
        
        const cartItem = cart.find((item: any) => item.id === relatedProduct.id);
        quantity = cartItem ? cartItem.quantity : 0;
    }

    return (
      <div className="min-h-screen bg-slate-900 pt-24 pb-20">
        {/* Article Header Image */}
        <div className="relative h-[40vh] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10"></div>
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
          
          <button 
            onClick={handleCloseArticle}
            className="absolute top-4 right-4 z-20 bg-slate-900/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-slate-800 transition-colors border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            {/* Meta Data */}
            <div className="flex flex-wrap gap-4 items-center text-sm text-slate-400 mb-6 border-b border-slate-700 pb-6">
              <span className="bg-pharmacy-500/10 text-pharmacy-400 px-3 py-1 rounded-full text-xs font-bold border border-pharmacy-500/20">
                {selectedPost.category}
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{selectedPost.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>زمان مطالعه: {selectedPost.readTime}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-8 leading-tight">
              {selectedPost.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-4 mb-10 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-white border-2 border-slate-600">
                {selectedPost.author[0]}
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">{selectedPost.author}</h4>
                <p className="text-pharmacy-400 text-xs">{selectedPost.authorRole}</p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none mb-12">
               {selectedPost.content.split('\n').map((paragraph, idx) => (
                 <p key={idx} className="text-slate-300 leading-relaxed mb-6 text-justify">
                   {paragraph}
                 </p>
               ))}
            </div>

            {/* Related Product Card */}
            {relatedProduct && (
              <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bookmark className="text-pharmacy-500" />
                    محصول مرتبط با این مقاله
                  </h3>
                  
                  <div 
                    onClick={() => onOpenProduct(relatedProduct)}
                    className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 hover:border-pharmacy-500 transition-all cursor-pointer flex flex-col md:flex-row shadow-xl group"
                  >
                    {/* Image Section */}
                    <div className="w-full md:w-1/3 bg-white p-6 relative flex items-center justify-center shrink-0 min-h-[250px] md:min-h-0">
                         <img 
                            src={relatedProduct.image} 
                            alt={relatedProduct.name} 
                            className="w-full h-full object-contain max-h-[200px] transition-transform duration-500 group-hover:scale-105" 
                         />
                         <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                            ۱۵٪ تخفیف
                         </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 md:p-8 flex flex-col justify-center w-full">
                        <div className="flex items-center gap-1 mb-2">
                             {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}`} />
                            ))}
                            <span className="text-xs text-slate-500 mr-2">(۱۲ نظر)</span>
                        </div>
                        
                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-pharmacy-400 transition-colors">
                            {relatedProduct.name}
                        </h4>
                        
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                            {relatedProduct.description}
                        </p>

                        <div className="flex items-end justify-between mt-auto">
                            <div className="flex flex-col">
                                <span className="text-slate-500 text-sm line-through decoration-red-500/50 mb-1">
                                    {oldPrice.toLocaleString('fa-IR')}
                                </span>
                                <span className="text-2xl font-bold text-white">
                                    {relatedProduct.price}
                                </span>
                            </div>

                            {quantity === 0 ? (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToCart(relatedProduct);
                                    }}
                                    className="bg-pharmacy-500 hover:bg-pharmacy-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-pharmacy-500/20 active:scale-95 flex items-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>افزودن به سبد</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 shadow-inner" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => onUpdateQuantity(relatedProduct.id, 1)}
                                        className="p-2 bg-pharmacy-500 hover:bg-pharmacy-600 text-white rounded-lg transition-colors shadow-lg shadow-pharmacy-500/20"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <span className="text-white font-bold text-lg min-w-[24px] text-center font-sans">
                                        {quantity.toLocaleString('fa-IR')}
                                    </span>
                                    <button 
                                        onClick={() => onUpdateQuantity(relatedProduct.id, -1)}
                                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                    >
                                        {quantity === 1 ? <Trash2 className="w-5 h-5 text-rose-500" /> : <Minus className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Article List View
  return (
    <div className="min-h-screen bg-slate-900 pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-pharmacy-500 font-bold tracking-wider uppercase text-xs md:text-sm bg-pharmacy-900/30 px-3 py-1 rounded-full border border-pharmacy-500/20">وبلاگ تخصصی</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mt-4 mb-4">مجله سلامت دکتر شمیم‌نسب</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">جدیدترین مقالات علمی، راهنمای مصرف داروها و رازهای زیبایی</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id} 
              onClick={() => setSelectedPost(post)}
              className="group bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-700 cursor-pointer hover:border-pharmacy-500/50 hover:-translate-y-2 transition-all duration-300 shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                  <User className="w-3 h-3 text-pharmacy-500" />
                  <span>{post.author}</span>
                  <span className="mx-1">•</span>
                  <Clock className="w-3 h-3 text-pharmacy-500" />
                  <span>{post.readTime}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-pharmacy-400 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
                  <span className="text-pharmacy-500 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    ادامه مطلب <ArrowLeft className="w-4 h-4" />
                  </span>
                  <span className="text-xs text-slate-500">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Magazine;
