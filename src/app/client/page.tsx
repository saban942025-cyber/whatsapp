'use client'
import { ShoppingBag, MessageCircle, History, Package } from 'lucide-react';
import Link from 'next/link';

export default function ClientHome() {
  return (
    <div className="min-h-screen bg-[#E5DDD5] font-sans" dir="rtl">
      {/* Header WhatsApp Style */}
      <div className="bg-[#075E54] text-white p-6 pb-12 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-4">
          <img src="https://i.pravatar.cc/150?u=shahar" className="w-16 h-16 rounded-full border-2 border-white" alt="פרופיל" />
          <div>
            <h1 className="text-2xl font-black">שלום, שחר שאול</h1>
            <p className="text-green-200 text-sm">לקוח VIP - ח. סבן</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-8 space-y-4">
        {/* כפתור כניסה לצ'אט - בולט */}
        <Link href="/chat" className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-xl border-2 border-green-500 animate-pulse">
           <div className="flex items-center gap-4">
             <MessageCircle className="text-green-500" size={32} />
             <span className="text-xl font-black text-gray-800">התחל צ'אט עם המוח של סבן</span>
           </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-md text-center">
            <ShoppingBag className="mx-auto mb-2 text-blue-600" />
            <span className="font-bold">הזמנה חדשה</span>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-md text-center">
            <History className="mx-auto mb-2 text-orange-500" />
            <span className="font-bold">היסטוריה</span>
          </div>
        </div>

        {/* סטטוס מכולות */}
        <div className="bg-white p-6 rounded-3xl shadow-md border-r-8 border-red-500">
           <div className="flex justify-between items-center">
             <h3 className="font-black text-red-600">מכולה בחריגה!</h3>
             <Package className="text-red-500" />
           </div>
           <p className="text-sm mt-2">מכולה 8 קוב ברעננה חרגה מ-10 ימים.</p>
        </div>
      </div>
    </div>
  );
}
