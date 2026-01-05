
import React, { useState } from 'react';
import { Product, Review, User, BlogPost } from '../types';
import { X, ShoppingCart, Heart, Share2, Star, Check, ShieldCheck, Truck, Plus, Minus, Trash2, MessageSquare, Send, BookOpen, ChevronLeft, FileText, AlertTriangle, Info, CheckCircle, Thermometer } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  cartQuantity: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  reviews: Review[];
  onAddReview: (review: Review) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  relatedPost?: BlogPost; // Added related post
  onOpenArticle: (post: BlogPost) => void; // Handler to open article
}

const toPersianDigits = (num: string | number) => {
    return num.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  isFavorite, 
  onToggleFavorite,
  cartQuantity,
  onUpdateQuantity,
  reviews,
  onAddReview,
  currentUser,
  onOpenLogin,
  relatedPost,
  onOpenArticle
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  if (!isOpen) return null;

  const getNumericPrice = (priceStr: string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    let cleanStr = priceStr;
    for (let i = 0; i < 10; i++) {
      cleanStr = cleanStr.split(persianDigits[i]).join(englishDigits[i]);
    }
    return parseInt(cleanStr.replace(/[^0-9]/g, ''), 10) || 0;
  };

  const numericPrice = getNumericPrice(product.price);
  const discountPercent = 15;
  const oldPrice = Math.round(numericPrice / (1 - discountPercent / 100));

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
    : 0;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const newReview: Review = {
        id: Date.now().toString(),
        userId: currentUser.id,
        productId: product.id,
        rating: newReviewRating,
        comment: newReviewComment,
        date: new Date().toLocaleDateString('fa-IR'),
        userName: currentUser.firstName
    };
    
    onAddReview(newReview);
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-8 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
        {/* Modal Container */}
        <div className="bg-slate-900 border-none md:border md:border-slate-800 w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 md:top-6 md:left-6 z-[160] p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full transition-all border border-slate-700 backdrop-blur-md"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 p-4 md:p-10 flex flex-col gap-4 bg-white overflow-hidden shrink-0 h-[40vh] md:h-auto landscape:h-[100vh] landscape:w-[40%] md:landscape:w-1/2">
            <div className="relative flex-grow flex items-center justify-center">
              <img 
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain transition-all duration-500 transform hover:scale-105"
              />
              <div className="absolute top-0 right-0 flex flex-col gap-1 md:gap-2">
                <span className="bg-pharmacy-500 text-white text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">جدید</span>
                <span className="bg-slate-900 text-white text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg">{product.category}</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex justify-center gap-2 md:gap-3 mt-auto overflow-x-auto py-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx ? 'border-pharmacy-500 shadow-md' : 'border-slate-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Reviews */}
          <div className="w-full md:w-1/2 overflow-y-auto text-right flex flex-col landscape:w-[60%] md:landscape:w-1/2 bg-slate-900">
             <div className="p-6 md:p-12">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                          key={s} 
                          className={`w-3 h-3 md:w-4 md:h-4 ${s <= Math.round(averageRating) ? 'text-gold-500 fill-gold-500' : 'text-slate-600'}`} 
                      />
                  ))}
                  </div>
                  <span className="text-slate-500 text-[10px] md:text-xs">
                      ({averageRating > 0 ? toPersianDigits(averageRating.toFixed(1)) : toPersianDigits(0)} از {toPersianDigits(reviews.length)} نظر)
                  </span>
              </div>

              <h2 className="text-xl md:text-4xl font-display font-bold text-white mb-4 md:mb-6 leading-tight">
                  {product.name}
              </h2>

              {/* Link to Magazine Article */}
              {relatedPost && (
                  <button 
                    onClick={() => onOpenArticle(relatedPost)}
                    className="mb-6 w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-pharmacy-500 p-4 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="bg-pharmacy-500/20 text-pharmacy-500 p-2 rounded-lg">
                          <BookOpen className="w-5 h-5" />
                       </div>
                       <div className="text-right">
                          <span className="block text-white font-bold text-sm mb-0.5">بررسی تخصصی این محصول</span>
                          <span className="block text-slate-400 text-xs truncate max-w-[200px]">{relatedPost.title}</span>
                       </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                  </button>
              )}

              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                  <p className="text-slate-300 text-sm md:text-lg leading-relaxed">
                  {product.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-pharmacy-500" />
                      <span>ضمانت اصالت کالا</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                      <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-pharmacy-500" />
                      <span>تاییدیه وزارت بهداشت</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
                      <Truck className="w-4 h-4 md:w-5 md:h-5 text-pharmacy-500" />
                      <span>ارسال سریع</span>
                  </div>
                  </div>
              </div>

              {/* Product Specifications Trigger */}
              {product.details && (
                <div className="mb-10">
                    <button 
                        onClick={() => setIsSpecsOpen(true)}
                        className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-5 py-4 transition-all group shadow-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pharmacy-500/20 rounded-lg text-pharmacy-400 group-hover:text-pharmacy-300">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-white text-sm md:text-base">مشخصات فنی و تخصصی دارو</span>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
                    </button>
                </div>
              )}

              {/* Price and Actions */}
              <div className="border-t border-slate-800 pt-6 md:pt-8 mb-10">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-500 text-sm md:text-lg line-through decoration-red-500/30">
                          {oldPrice.toLocaleString('fa-IR')}
                      </span>
                      <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-md">
                          {discountPercent.toLocaleString('fa-IR')}٪
                      </span>
                      </div>
                      <span className="text-2xl md:text-4xl font-display text-pharmacy-400 leading-none">
                      {product.price}
                      </span>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4">
                      <button 
                      onClick={onToggleFavorite}
                      className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border ${
                          isFavorite 
                          ? 'bg-rose-500 border-rose-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      >
                      <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
                      <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                  </div>
                  </div>

                  {cartQuantity === 0 ? (
                  <button 
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 md:py-5 rounded-xl md:rounded-[1.5rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-pharmacy-500/20 active:scale-95 text-lg md:text-xl"
                  >
                      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                      افزودن به سبد خرید
                  </button>
                  ) : (
                  <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl md:rounded-[1.5rem] p-1.5 md:p-2 gap-4">
                      <button 
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="bg-pharmacy-500 hover:bg-pharmacy-600 text-white p-3 md:p-4 rounded-lg md:rounded-2xl transition-all active:scale-95"
                      >
                      <Plus className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                      <div className="flex flex-col items-center">
                      <span className="text-white text-lg md:text-2xl font-bold">{cartQuantity.toLocaleString('fa-IR')}</span>
                      <span className="text-slate-500 text-[10px]">در سبد</span>
                      </div>
                      <button 
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="bg-slate-700 hover:bg-slate-600 text-white p-3 md:p-4 rounded-lg md:rounded-2xl transition-all active:scale-95"
                      >
                      {cartQuantity === 1 ? <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-rose-500" /> : <Minus className="w-5 h-5 md:w-6 md:h-6" />}
                      </button>
                  </div>
                  )}
              </div>

              {/* Reviews Section */}
              <div className="border-t border-slate-800 pt-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <MessageSquare className="text-pharmacy-500" />
                      نظرات کاربران
                  </h3>
                  
                  {/* Review Form */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 border border-slate-700">
                      {currentUser ? (
                          <form onSubmit={handleSubmitReview}>
                              <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-slate-300">امتیاز شما:</span>
                                  <div className="flex gap-1 flex-row-reverse">
                                      {[5, 4, 3, 2, 1].map((star) => (
                                          <Star 
                                              key={star}
                                              onClick={() => setNewReviewRating(star)}
                                              className={`w-5 h-5 cursor-pointer transition-colors ${
                                                  star <= newReviewRating ? 'text-gold-500 fill-gold-500' : 'text-slate-600'
                                              }`}
                                          />
                                      ))}
                                  </div>
                              </div>
                              <textarea 
                                  value={newReviewComment}
                                  onChange={(e) => setNewReviewComment(e.target.value)}
                                  placeholder="نظر خود را درباره این محصول بنویسید..."
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-pharmacy-500 min-h-[80px]"
                                  required
                              />
                              <button 
                                  type="submit"
                                  className="mt-3 bg-pharmacy-500 hover:bg-pharmacy-600 text-white text-sm font-bold py-2 px-4 rounded-xl flex items-center gap-2 mr-auto"
                              >
                                  <Send className="w-4 h-4" />
                                  ثبت نظر
                              </button>
                          </form>
                      ) : (
                          <div className="text-center py-4">
                              <p className="text-slate-400 text-sm mb-3">برای ثبت نظر ابتدا وارد حساب کاربری خود شوید.</p>
                              <button 
                                  onClick={onOpenLogin}
                                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 px-6 rounded-xl"
                              >
                                  ورود به حساب
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Review List */}
                  <div className="space-y-4">
                      {reviews.length > 0 ? (
                          reviews.map((review) => (
                              <div key={review.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50">
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                              {review.userName[0]}
                                          </div>
                                          <span className="text-sm font-bold text-white">{review.userName}</span>
                                      </div>
                                      <span className="text-xs text-slate-500">{toPersianDigits(review.date)}</span>
                                  </div>
                                  <div className="flex gap-0.5 mb-2">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-slate-700'}`} />
                                      ))}
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>
                              </div>
                          ))
                      ) : (
                          <p className="text-slate-500 text-center text-sm">هنوز نظری برای این محصول ثبت نشده است.</p>
                      )}
                  </div>
              </div>
             </div>
          </div>
        </div>
      </div>

      {/* Product Specifications Modal (Separate Overlay) */}
      {isSpecsOpen && product.details && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
               
               {/* Modal Header */}
               <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                     <FileText className="text-pharmacy-500 w-6 h-6" />
                     مشخصات دارو
                  </h3>
                  <button 
                     onClick={() => setIsSpecsOpen(false)}
                     className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                     <X className="w-6 h-6" />
                  </button>
               </div>

               {/* Modal Content - Scrollable */}
               <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Left Column: Properties Table (Desktop Right) */}
                      <div>
                          <div className="flex items-center gap-2 mb-4 text-pharmacy-400 font-bold text-lg">
                              <Info className="w-5 h-5" />
                              <span>مشخصات اختصاصی</span>
                          </div>
                          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden text-sm">
                              {product.details.properties.map((prop, index) => (
                                  <div key={index} className={`flex justify-between items-center p-4 ${index !== product.details!.properties.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                                      <span className="text-slate-400 font-medium">{prop.label}</span>
                                      <span className="text-white font-bold text-left">{prop.value}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Right Column: Features List (Desktop Left) */}
                      <div>
                          <div className="flex items-center gap-2 mb-4 text-pharmacy-400 font-bold text-lg">
                              <CheckCircle className="w-5 h-5" />
                              <span>مشخصه ها</span>
                          </div>
                          <div className="space-y-3">
                              {product.details.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:border-pharmacy-500/30 transition-colors">
                                      <div className="mt-1 w-2 h-2 rounded-full bg-pharmacy-500 shrink-0"></div>
                                      <p className="text-slate-300 text-sm leading-relaxed">{feature}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Bottom Section: Usage, Warning, Storage */}
                  <div className="space-y-6">
                      <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700">
                          <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                              <Info className="w-5 h-5 text-blue-500" />
                              روش مصرف
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed text-justify">{product.details.usage}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20">
                              <h4 className="flex items-center gap-2 text-rose-400 font-bold mb-3">
                                  <AlertTriangle className="w-5 h-5" />
                                  هشدار مصرف
                              </h4>
                              <p className="text-slate-300 text-sm leading-relaxed text-justify">{product.details.warnings}</p>
                          </div>
                          
                          <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20">
                              <h4 className="flex items-center gap-2 text-amber-400 font-bold mb-3">
                                  <Thermometer className="w-5 h-5" />
                                  شرایط نگهداری
                              </h4>
                              <p className="text-slate-300 text-sm leading-relaxed text-justify">{product.details.storage}</p>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};

export default ProductDetailModal;
