'use client'
import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Howl } from 'howler';
import { useParams } from 'next/navigation'; // חשוב: לשליפת ה-ID מהלינק
import { Send, ChevronLeft, MoreVertical, BellRing } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const clientId = params.id ? decodeURIComponent(params.id as string) : 'שחר_שאול';
  
  const [customer, setCustomer] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const soundRef = useRef<Howl | null>(null);

  // אתחול צלצול
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/notification.mp3'],
      html5: true,
      volume: 1.0
    });
  }, []);

  // האזנה לנתוני הלקוח הספציפי שנכנס
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'customer_memory', clientId), (docSnap) => {
      if (docSnap.exists()) {
        setCustomer(docSnap.data());
      }
    });
    return () => unsub();
  }, [clientId]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    // לוגיקת שליחה...
    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] font-sans" dir="rtl">
      {/* Header דינמי - מציג את אבי לוי אם זה הלינק שלו */}
      <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href={`/client/${clientId}`}>
            <ChevronLeft size={24} />
          </Link>
          <div className="relative">
            <img 
              src={customer?.profileImage || "https://i.pravatar.cc/150?u=" + clientId} 
              className="w-10 h-10 rounded-full border border-white/20" 
              alt="פרופיל" 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075E54] rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">
              {customer?.name || 'טוען...'}
            </h2>
            <span className="text-[10px] text-green-200 uppercase tracking-tighter font-medium">
              {customer?.project || 'מחובר למערכת'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 opacity-80">
          <BellRing size={20} className="cursor-pointer" onClick={() => soundRef.current?.play()} />
          <MoreVertical size={20} />
        </div>
      </div>

      {/* גוף הצאט */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] self-start animate-in fade-in slide-in-from-right-2">
          <p className="text-sm text-gray-800 font-medium">
            שלום **{customer?.name}**, כאן המוח של סבן.  
            הזיהוי בוצע בהצלחה לפרויקט: **{customer?.project || 'כללי'}**.  
            איך אוכל לעזור היום?
          </p>
          <span className="text-[9px] text-gray-400 block text-left mt-1">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-[#F0F2F5] flex items-center gap-2">
        <input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-3 rounded-full outline-none text-sm shadow-inner"
          placeholder="הקלד הודעה..."
        />
        <button onClick={handleSend} className="bg-[#128C7E] text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
