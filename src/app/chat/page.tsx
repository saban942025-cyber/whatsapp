'use client'
import React, { useState, useEffect, useRef } from 'react';
import { getSabanResponse } from '../actions/gemini-brain';
import { Send, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: string, text: string, time: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // פונקציית צלצול
  const playSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => console.log("Sound blocked by browser"));
  };

  useEffect(() => {
    // הודעת פתיחה שקטה
    async function init() {
      const res = await getSabanResponse("שלום, תן לי סיכום קצר על הסטטוס שלי", "שחר_שאול");
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([{ role: 'assistant', text: res, time: now }]);
    }
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const formatText = (text: string) => {
    // הופכת **טקסט** ל-Bold ומנקה רווחים מיותרים
    return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-gray-900">{part.replace(/\*\*/g, '')}</strong>;
      }
      return part;
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const text = input;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { role: 'user', text, time }]);
    setInput('');
    setIsTyping(true);

    const res = await getSabanResponse(text, "שחר_שאול");
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', text: res, time }]);
    playSound(); // השמעת צלצול בהודעה חוזרת
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] font-sans relative overflow-hidden" dir="rtl">
      
      {/* CSS להזזת OneSignal */}
      <style jsx global>{`
        .onesignal-bell-launcher { left: 15px !important; right: auto !important; bottom: 100px !important; }
      `}</style>

      {/* Header WhatsApp Style */}
      <div className="bg-[#075E54] p-3 flex items-center gap-3 text-white shadow-lg z-10">
        <Link href="/client/שחר_שאול">
          <ChevronLeft size={28} />
        </Link>
        <div className="relative">
          <img 
            src="https://i.pravatar.cc/150?u=shahar" 
            className="w-10 h-10 rounded-full border border-gray-300" 
            alt="שחר שאול"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075E54] rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">ח. סבן - המוח</span>
          <span className="text-xs text-green-200">מחובר כעת</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative p-3 rounded-2xl shadow-sm max-w-[85%] ${
              m.role === 'user' 
                ? 'bg-[#DCF8C6] rounded-tr-none' 
                : 'bg-white rounded-tl-none'
            }`}>
              <div className="text-[15px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                {formatText(m.text)}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 text-left uppercase">
                {m.time}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-end">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-400 italic text-sm">
              סבן מקליד...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#F0F0F0] flex items-center gap-2">
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 outline-none text-gray-700 bg-transparent" 
            placeholder="הקלד הודעה..." 
          />
        </div>
        <button 
          onClick={sendMessage} 
          className="bg-[#128C7E] text-white p-3 rounded-full shadow-md active:scale-90 transition-transform"
        >
          <Send size={24} className="transform rotate-180" />
        </button>
      </div>
    </div>
  );
}
