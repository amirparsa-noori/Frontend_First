
import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

const Consultation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'سلام! من مشاور هوشمند داروخانه دکتر شمیم‌نسب هستم. چطور می‌تونم بهتون کمک کنم؟',
      sender: 'bot',
      time: '۱۰:۰۰'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        text: 'ممنون از پیام شما. متخصصین ما به زودی پاسخگوی سوالات شما خواهند بود. در حال حاضر می‌توانید سوالات خود را درباره تداخلات دارویی یا محصولات آرایشی بپرسید.',
        sender: 'bot',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] pt-24 pb-20 md:pb-8 px-4 flex flex-col">
      <div className="bg-slate-800/50 border border-slate-800 rounded-[2rem] flex-grow flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pharmacy-500 flex items-center justify-center shadow-lg shadow-pharmacy-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">مرکز مشاوره آنلاین</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-emerald-500">مشاور آنلاین است</span>
              </div>
            </div>
          </div>
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
                  msg.sender === 'user' ? 'bg-slate-800 border border-slate-700 text-slate-400' : 'bg-pharmacy-900 text-pharmacy-400'
                }`}>
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-6 bg-slate-900/30 border-t border-slate-800">
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
