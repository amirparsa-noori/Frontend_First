
import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, ArrowRight, Activity, Sparkles, Dumbbell, Baby, Pill, ArrowLeft, MessageCircle, Edit, History } from 'lucide-react';
import { Ticket } from '../types';

interface Message {
  id: string; // Used to track message for editing (ticketId)
  text: string;
  sender: 'user' | 'bot';
  time: string;
  isEditable?: boolean; // Flag to check if it's the user's message
}

const TOPICS = [
  { id: 'skin', title: 'پوست و مو', icon: Sparkles, desc: 'مشاوره روتین پوستی، ریزش مو و محصولات آرایشی', color: 'bg-rose-500', whatsapp: '989120000000' },
  { id: 'supplements', title: 'مکمل‌های دارویی', icon: Pill, desc: 'تداخلات دارویی، ویتامین‌ها و تقویت سیستم ایمنی', color: 'bg-blue-500', whatsapp: '989120000001' },
  { id: 'sports', title: 'مکمل‌های ورزشی', icon: Dumbbell, desc: 'برنامه مصرف پروتئین، کراتین و افزایش حجم', color: 'bg-orange-500', whatsapp: '989120000002' },
  { id: 'ortho', title: 'ارتوپدی', icon: Activity, desc: 'مشاوره ساپورت‌های طبی و دردهای مفصلی', color: 'bg-emerald-500', whatsapp: '989120000003' },
  { id: 'baby', title: 'مادر و کودک', icon: Baby, desc: 'تغذیه نوزاد، شیرخشک و مراقبت‌های مادرانه', color: 'bg-purple-500', whatsapp: '989120000004' },
];

interface ConsultationProps {
    notify?: (title: string, body: string) => void;
    onCreateTicket: (subject: string, message: string) => void;
    tickets?: Ticket[];
    onUpdateTicketMessage?: (ticketId: string, messageIndex: number, newText: string) => void;
    onGoToProfile?: () => void;
}

const Consultation: React.FC<ConsultationProps> = ({ notify, onCreateTicket, tickets, onUpdateTicketMessage, onGoToProfile }) => {
  const [selectedTopic, setSelectedTopic] = useState<{id: string, title: string, color: string, whatsapp: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Edit State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, editingMessageId]);

  // Load History & Initial greeting when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      const initialBotMessage: Message = {
        id: 'welcome-bot',
        text: `سلام! به بخش مشاوره تخصصی ${selectedTopic.title} خوش آمدید. من هوش مصنوعی دستیار دکتر شمیم‌نسب در این بخش هستم. چطور می‌تونم کمکتون کنم؟`,
        sender: 'bot',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };

      // Filter and Map existing tickets to chat messages
      let historyMessages: Message[] = [];
      if (tickets) {
          const relevantTickets = tickets.filter(t => t.subject === selectedTopic.title);
          
          historyMessages = relevantTickets.flatMap(t => 
             t.messages.map((m, idx) => ({
                 id: t.id, // Using ticket ID as message ID for simplicity (assuming 1st msg is editable user msg)
                 text: m.text,
                 sender: m.sender === 'user' ? 'user' : 'bot',
                 time: m.time,
                 isEditable: m.sender === 'user' && t.status === 'pending' && idx === 0 // Only allow editing first message of pending ticket
             }))
          ).sort((a, b) => a.time.localeCompare(b.time)); // Simple sort, ideally use full date
      }

      setMessages([initialBotMessage, ...historyMessages]);
    }
  }, [selectedTopic, tickets]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedTopic) return;

    // Request permission on first user interaction if passed
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const tempId = Date.now().toString();
    const newUserMessage: Message = {
      id: tempId,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isEditable: true
    };

    // Create Ticket in Global State
    onCreateTicket(selectedTopic.title, inputText);

    setInputText('');
  };

  const startEditing = (msg: Message) => {
      setEditingMessageId(msg.id);
      setEditText(msg.text);
  };

  const saveEdit = () => {
      if (editingMessageId && onUpdateTicketMessage) {
          // Update global state (assuming index 0 for the single-message ticket model currently used in creation)
          onUpdateTicketMessage(editingMessageId, 0, editText);
          
          // Local update for immediate feedback (though props change will also trigger re-render)
          setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, text: editText } : m));
          setEditingMessageId(null);
          setEditText('');
      }
  };

  if (!selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen pt-24 pb-20 px-4">
        <div className="text-center mb-10">
           <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">مشاوره تخصصی آنلاین</h2>
           <p className="text-slate-400 text-lg">برای شروع گفتگو، لطفاً موضوع مشاوره خود را انتخاب کنید تا به متخصص مربوطه متصل شوید.</p>
        </div>

        {/* Reverted to standard grid gap and card size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <button 
                key={topic.id}
                onClick={() => setSelectedTopic({id: topic.id, title: topic.title, color: topic.color, whatsapp: topic.whatsapp})}
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
    // Expanded Chat Container: Wider max-w-5xl and adjusted height
    <div className="max-w-5xl mx-auto h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] pt-20 pb-4 md:pb-8 px-2 md:px-4 flex flex-col">
      <div className="bg-slate-800/50 border border-slate-800 rounded-[2.5rem] flex-grow flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl relative">
        
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-slate-700 bg-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 self-start md:self-center">
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
          
          <div className="flex items-center gap-2 w-full md:w-auto">
              <a 
                href={`https://wa.me/${selectedTopic.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex-grow md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-xl transition-all"
              >
                  <MessageCircle className="w-4 h-4" />
                  <span>مشاوره در واتساپ</span>
              </a>
              <button 
                onClick={() => setSelectedTopic(null)}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-sm bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 transition-colors"
              >
                تغییر موضوع
              </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div 
              key={`${msg.id}-${idx}`} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Message Bubble or Edit Form */}
                  {editingMessageId === msg.id ? (
                      <div className="bg-slate-700 p-2 rounded-2xl flex flex-col gap-2 min-w-[250px]">
                          <textarea 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-slate-800 text-white rounded-xl p-3 text-sm outline-none border border-slate-600 focus:border-pharmacy-500"
                              rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingMessageId(null)} className="text-xs text-slate-300 px-3 py-1 hover:text-white">لغو</button>
                              <button onClick={saveEdit} className="text-xs bg-pharmacy-500 text-white px-3 py-1 rounded-lg font-bold">ذخیره</button>
                          </div>
                      </div>
                  ) : (
                      <div className="relative group">
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                            msg.sender === 'user' 
                            ? 'bg-pharmacy-600 text-white rounded-tr-none' 
                            : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                        }`}>
                            {msg.text}
                        </div>
                        {/* Edit Button for User Messages */}
                        {msg.isEditable && (
                            <button 
                                onClick={() => startEditing(msg)}
                                className="absolute top-1/2 -translate-y-1/2 -left-8 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-800/50 rounded-full"
                                title="ویرایش پیام"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                      </div>
                  )}

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
        
        {/* Ticket History Button */}
        <div className="px-6 pb-2">
            <button 
                onClick={onGoToProfile}
                className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-pharmacy-500/50 text-slate-300 hover:text-white py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
                <History className="w-4 h-4" />
                مشاهده تاریخچه و وضعیت تیکت‌ها در پروفایل کاربری
            </button>
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
          <p className="text-[10px] text-slate-500 text-center mt-3">برای کسب اطلاعات بیشتر و مشاوره با مشاور این بخش می‌توانید از دکمه واتساپ بالا استفاده کنید.</p>
        </form>
      </div>
    </div>
  );
};

export default Consultation;
