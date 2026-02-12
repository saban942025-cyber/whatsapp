'use client'
import React, { useState, useEffect } from 'react';
import { getSabanResponse } from '../actions/gemini-brain';

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // הודעת פתיחה
    async function init() {
      const res = await getSabanResponse("שלום, אני שחר", "שחר_שאול");
      setMessages([{ role: 'assistant', text: res }]);
    }
    init();
  }, []);

  const sendMessage = async () => {
    const text = input;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    const res = await getSabanResponse(text, "שחר_שאול");
    setMessages(prev => [...prev, { role: 'assistant', text: res }]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5]" dir="rtl">
      <div className="bg-[#075E54] p-4 text-white font-bold shadow-md">
        ח. סבן - שחר שאול
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-[#DCF8C6] self-end mr-auto' : 'bg-white self-start'}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-100 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-2 rounded-full border" placeholder="הקלד הודעה..." />
        <button onClick={sendMessage} className="bg-[#128C7E] text-white px-4 py-2 rounded-full">שלח</button>
      </div>
    </div>
  );
}
