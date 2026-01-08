
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
    // Find all related products based on IDs
    const relatedProducts = selectedPost.relatedProductIds 
        ? products.filter(p => selectedPost.relatedProductIds?.includes(p.id))
        : [];

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

            {/* Related Products Grid */}
            {relatedProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bookmark className="text-pharmacy-500" />
                    محصولات مرتبط
                  </h3>
                  
                  {/* Using standard ProductCards in a responsive grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {relatedProducts.map(product => (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            isFavorite={favorites.includes(product.id)}
                            onToggleFavorite={() => onToggleFavorite(product.id)}
                            onAddToCart={onAddToCart}
                            onQuickView={onOpenProduct}
                            cartQuantity={cart.find(i => i.id === product.id)?.quantity || 0}
                            onUpdateQuantity={onUpdateQuantity}
                            reviewCount={12} // Default or passed if available
                        />
                    ))}
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
