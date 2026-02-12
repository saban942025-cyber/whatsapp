'use client'
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { MessageCircle, History, Package, ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const { id } = useParams();
  const clientId = decodeURIComponent(id as string);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    return onSnapshot(doc(db, 'customer_memory', clientId), (snap) => {
      if (snap.exists()) setCustomer(snap.data());
    });
  }, [clientId]);

  if (!customer) return <div className="p-20 text-center font-bold">טוען פרופיל VIP...</div>;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-right" dir="rtl">
      <div className="bg-[#075E54] p-8 pb-20 text-white rounded-b-[45px] shadow-2xl relative">
        <div className="flex items-center gap-5">
          <img src={customer.profileImage} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{customer.name}</h1>
              <Star className="text-yellow-400 fill-yellow-400" size={16} />
            </div>
            <p className="text-green-100 opacity-80 text-sm">לקוח אסטרטגי | {customer.project}</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-8 space-y-4">
        <Link href={`/chat/${clientId}`} className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-xl border-2 border-[#25D366]">
          <div className="flex items-center gap-4">
            <MessageCircle className="text-[#25D366]" size={32} />
            <div>
              <span className="text-xl font-black block">המוח של סבן</span>
              <span className="text-xs text-gray-400 font-medium">זמין כעת להזמנות ושאלות</span>
            </div>
          </div>
          <ChevronLeft className="text-gray-300" />
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link href={`/client/${clientId}/history`} className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-blue-500 text-center">
            <History className="mx-auto mb-2 text-blue-500" size={24} />
            <span className="font-bold text-sm">הזמנות אחרונות</span>
          </Link>
          <div className="bg-white p-6 rounded-3xl shadow-md border-b-4 border-orange-500 text-center">
            <Package className="mx-auto mb-2 text-orange-500" size={24} />
            <span className="font-bold text-sm">לקוח: {customer.accNum}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
