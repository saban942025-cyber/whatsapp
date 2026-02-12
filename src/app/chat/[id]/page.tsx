'use client'
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { id } = useParams();
  const clientId = decodeURIComponent(id as string);
  const [customer, setCustomer] = useState<any>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'בוקר טוב' : h < 18 ? 'צהריים טובים' : 'ערב טוב');

    if (!clientId) return;
    const unsub = onSnapshot(doc(db, 'customer_memory', clientId), (snap) => {
      if (snap.exists()) setCustomer(snap.data());
    });

    // עדכון זמן כניסה לצורך ברכה
    updateDoc(doc(db, 'customer_memory', clientId), {
      lastEntry: new Date().toLocaleString('he-IL', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
    });

    return () => unsub();
  }, [clientId]);

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] text-right" dir="rtl">
      <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shadow-lg">
        <Link href={`/client/${clientId}`}><ChevronLeft /></Link>
        <img src={customer?.profileImage} className="w-10 h-10 rounded-full border object-cover" />
        <div>
          <h2 className="font-bold text-sm">{customer?.name || 'טוען...'}</h2>
          <span className="text-[9px] text-green-200 uppercase font-medium">מחובר כעת</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-md max-w-[90%] border-r-4 border-[#25D366]">
          <p className="text-sm">
            {greeting} **{customer?.name}**, איזה כיף לראות אותך! 🏗️<br/>
            כניסה אחרונה שלך: **{customer?.lastEntry || 'לאחרונה'}**.<br/>
            **מה תרצה להזמין היום?**
          </p>
        </div>
      </div>

      <div className="p-3 bg-[#F0F2F5] flex gap-2">
        <input className="flex-1 p-3 rounded-full text-sm outline-none shadow-sm" placeholder="כתוב למוח של סבן..." />
        <button className="bg-[#128C7E] text-white p-3 rounded-full shadow-lg"><Send size={20}/></button>
      </div>
    </div>
  );
}
