
import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, ArrowRight, Activity, Sparkles, Dumbbell, Baby, Pill, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

const TOPICS = [
  { id: 'skin', title: 'پوست و مو', icon: Sparkles, desc: 'مشاوره روتین پوستی، ریزش مو و محصولات آرایشی', color: 'bg-rose-500' },
  { id: 'supplements', title: 'مکمل‌های دارویی', icon: Pill, desc: 'تداخلات دارویی، ویتامین‌ها و تقویت سیستم ایمنی', color: 'bg-blue-500' },
  { id: 'sports', title: 'مکمل‌های ورزشی', icon: Dumbbell, desc: 'برنامه مصرف پروتئین، کراتین و افزایش حجم', color: 'bg-orange-500' },
  { id: 'ortho', title: 'ارتوپدی', icon: Activity, desc: 'مشاوره ساپورت‌های طبی و دردهای مفصلی', color: 'bg-emerald-500' },
  { id: 'baby', title: 'مادر و کودک', icon: Baby, desc: 'تغذیه نوزاد، شیرخشک و مراقبت‌های مادرانه', color: 'bg-purple-500' },
];

const Consultation: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<{id: string, title: string, color: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      setMessages([
        {
          id: '1',
          text: `سلام! به بخش مشاوره تخصصی ${selectedTopic.title} خوش آمدید. من هوش مصنوعی دستیار دکتر شمیم‌نسب در این بخش هستم. چطور می‌تونم کمکتون کنم؟`,
          sender: 'bot',
          time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedTopic]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    // Simulated Bot Response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `درخواست شما در زمینه ${selectedTopic?.title} ثبت شد. دکتر متخصص ما به زودی پاسخ دقیق‌تری برای شما ارسال خواهد کرد.`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  if (!selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen pt-24 pb-20 px-4">
        <div className="text-center mb-10">
           <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">مشاوره تخصصی آنلاین</h2>
           <p className="text-slate-400 text-lg">برای شروع گفتگو، لطفاً موضوع مشاوره خود را انتخاب کنید تا به متخصص مربوطه متصل شوید.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <button 
                key={topic.id}
                onClick={() => setSelectedTopic({id: topic.id, title: topic.title, color: topic.color})}
                className="group relative bg-slate-800 border border-slate-700 hover:border-pharmacy-500 rounded-3xl p-6 text-right transition-all hover:bg-slate-800/80 hover:-translate-y-1 shadow-lg overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-24 h-24 ${topic.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                <div className={`w-14 h-14 ${topic.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{topic.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{topic.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-pharmacy-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                  شروع مشاوره <ArrowLeft className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] pt-24 pb-20 md:pb-8 px-4 flex flex-col">
      <div className="bg-slate-800/50 border border-slate-800 rounded-[2rem] flex-grow flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl relative">
        
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-slate-700 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${selectedTopic.color} flex items-center justify-center shadow-lg shadow-pharmacy-500/20`}>
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">مشاور {selectedTopic.title}</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-500">پاسخگویی آنلاین</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSelectedTopic(null)}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            تغییر موضوع
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user' 
                    ? 'bg-pharmacy-600 text-white rounded-tr-none' 
                    : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-2">{msg.time}</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  msg.sender === 'user' ? 'bg-slate-800 border border-slate-700 text-slate-400' : `bg-slate-800 text-white border border-slate-700`
                }`}>
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-4 md:p-6 bg-slate-900/30 border-t border-slate-800">
          <div className="relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="سوال خود را اینجا بنویسید..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl py-4 pr-12 pl-14 outline-none focus:border-pharmacy-500 transition-all shadow-inner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Bot className="w-5 h-5" />
            </div>
            <button 
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-pharmacy-500 hover:bg-pharmacy-600 text-white p-2.5 rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Send className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-3">در صورت فوریت پزشکی لطفاً با شماره‌های اضطراری تماس بگیرید.</p>
        </form>
      </div>
    </div>
  );
};

export default Consultation;
