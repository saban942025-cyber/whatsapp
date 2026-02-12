'use client'
import React, { useState, useEffect, useRef } from 'react';
import { getSabanResponse } from '@/app/actions/gemini-brain';

export default function WhatsAppChatPage() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // הודעת פתיחה אוטומטית משחר שאול
  useEffect(() => {
    const welcome = async () => {
      setIsTyping(true);
      const res = await getSabanResponse("שלח ברכת בוקר טוב אישית ומזמינה", "שחר_שאול");
      setMessages([{ role: 'assistant', text: res }]);
      setIsTyping(false);
    };
    welcome();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    const aiRes = await getSabanResponse(userText, "שחר_שאול");
    setMessages(prev => [...prev, { role: 'assistant', text: aiRes }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] font-sans rtl" dir="rtl">
      <div className="bg-[#075E54] p-4 text-white flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>
        <div>
          <h1 className="font-bold text-lg">שחר שאול</h1>
          <p className="text-xs opacity-80">ח. סבן - עוזר אישי (אוטומטי)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] p-3 rounded-xl shadow-sm ${
            m.role === 'user' ? 'bg-[#DCF8C6] self-end mr-auto' : 'bg-white self-start'
          }`}>
            <p className="text-sm leading-relaxed">{m.text}</p>
          </div>
        ))}
        {isTyping && <div className="text-xs text-gray-500 animate-pulse">גימיני מקליד...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 bg-[#F0F0F0] flex gap-2 items-center">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="הקלד הודעה..."
          className="flex-1 p-3 rounded-full border-none outline-none focus:ring-2 ring-[#075E54] text-sm"
        />
        <button onClick={handleSend} className="bg-[#128C7E] text-white p-3 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
          ➔
        </button>
      </div>
    </div>
  );
}
