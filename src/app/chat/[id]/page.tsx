'use client'
import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Howl } from 'howler';
import { Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { id } = useParams();
  const clientId = decodeURIComponent(id as string);
  const [customer, setCustomer] = useState<any>(null);
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    // אתחול אודיו פעם אחת בלבד למניעת קריסת זיכרון
    if (!soundRef.current) {
      soundRef.current = new Howl({ src: ['/notification.mp3'], html5: true, volume: 0.5 });
    }

    if (!clientId) return;
    const unsub = onSnapshot(doc(db, 'customer_memory', clientId), (snap) => {
      if (snap.exists()) setCustomer(snap.data());
    });

    return () => {
      unsub();
      if (soundRef.current) soundRef.current.unload();
    };
  }, [clientId]);

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5]" dir="rtl">
      <div className="bg-[#075E54] text-white p-4 flex items-center gap-3 shadow-md">
        <Link href={`/client/${clientId}`}><ChevronLeft /></Link>
        <img src={customer?.profileImage} className="w-10 h-10 rounded-full border shadow-sm object-cover" />
        <div>
          <h2 className="font-bold text-sm">{customer?.name || 'טוען...'}</h2>
          <span className="text-[10px] text-green-200">מחובר למערכת ח. סבן</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-md max-w-[90%] border-r-4 border-[#25D366]">
          <p className="text-sm">
            שלום **{customer?.name}**, איזה כיף לראות אותך שוב! 🏗️<br/>
            כניסה אחרונה שלך הייתה ב-**{customer?.lastEntry || 'לאחרונה'}**.<br/>
            **מה תרצה להזמין היום?**
          </p>
        </div>
      </div>

      <div className="p-3 bg-[#F0F2F5] flex gap-2">
        <input className="flex-1 p-3 rounded-full text-sm outline-none shadow-sm" placeholder="כתוב הודעה..." />
        <button className="bg-[#128C7E] text-white p-3 rounded-full shadow-lg"><Send size={20}/></button>
      </div>
    </div>
  );
}
