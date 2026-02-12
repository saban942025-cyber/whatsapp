'use client'
import React, { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  MessageCircle, 
  Package, 
  Truck, 
  MapPin, 
  AlertTriangle, 
  ChevronLeft,
  Clock,
  History
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ClientDashboard() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      if (!id) return;
      // פענוח השם מה-URL (למשל "שחר_שאול")
      const clientId = decodeURIComponent(id as string);
      const docRef = doc(db, 'customer_memory', clientId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setCustomer(snap.data());
        // בדיקת חריגת מכולות להשמעת צלצול
        checkOverdueContainers(snap.data());
      }
      setLoading(false);
    }
    fetchCustomer();
  }, [id]);

  const checkOverdueContainers = (data: any) => {
    const hasOverdue = data.rentals?.containers?.some((c: any) => c.status === 'overdue');
    if (hasOverdue) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => console.log("צלצול חריגה נחסם ע''י הדפדפן"));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#E5DDD5] flex items-center justify-center font-sans" dir="rtl">
      <div className="text-[#075E54] font-black animate-bounce text-xl">טוען נתונים מהמוח של סבן...</div>
    </div>
  );

  if (!customer) return <div className="p-10 text-center font-bold">לקוח לא נמצא במערכת.</div>;

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-10" dir="rtl">
      {/* Header - WhatsApp Style */}
      <div className="bg-[#075E54] text-white p-6 pb-20 rounded-b-[40px] shadow-lg relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="https://i.pravatar.cc/150?u=shahar" 
                className="w-16 h-16 rounded-full border-2 border-white shadow-md" 
                alt="פרופיל"
              />
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#075E54] rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black">שלום, {customer.name}</h1>
              <p className="text-green-100 text-sm opacity-80">לקוח VIP אסטרטגי</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-12 space-y-4 relative z-10">
        
        {/* כפתור כניסה לצ'אט - בולט ומרכזי */}
        <Link href="/chat" className="flex items-center justify-between bg-white p-6 rounded-[25px] shadow-xl border-2 border-[#25D366] active:scale-95 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-[#25D366] p-3 rounded-full">
              <MessageCircle className="text-white" size={28} />
            </div>
            <div>
              <span className="text-xl font-black text-gray-800 block">המוח של סבן</span>
              <span className="text-xs text-gray-500 italic">זמין כעת להזמנות ושאלות</span>
            </div>
          </div>
          <ChevronLeft className="text-gray-300" />
        </Link>

        {/* התראת מכולה במידה ויש חריגה */}
        {customer.rentals?.containers?.map((c: any) => c.status === 'overdue' && (
          <div key={c.id} className="bg-white p-5 rounded-[25px] shadow-md border-r-8 border-red-500 flex items-start gap-4 animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="font-black text-red-600">שים לב! חריגת שכירות</h3>
              <p className="text-sm text-gray-600">מכולה {c.size} ב{c.location} חרגה מ-10 ימים.</p>
            </div>
          </div>
        ))}

        {/* פרויקטים פעילים */}
        <div className="bg-white rounded-[25px] p-5 shadow-sm">
          <h3 className="text-gray-400 text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
            <MapPin size={14} /> פרויקטים פעילים
          </h3>
          <div className="space-y-4">
            {customer.projects?.map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                <div>
                  <p className="font-black text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.location}</p>
                </div>
                <div className="text-left">
                   <p className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">נהג מועדף: {p.preferredDriver}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* היסטוריית הזמנות אחרונה */}
        <div className="bg-white rounded-[25px] p-5 shadow-sm">
          <h3 className="text-gray-400 text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
            <History size={14} /> הזמנות אחרונות
          </h3>
          <div className="space-y-3">
            {customer.orderHistory?.slice(0, 2).map((o: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                <Package className="text-gray-400" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-bold">{o.product} - {o.quantity}</p>
                  <p className="text-[10px] text-gray-500">{o.date} | סופק ע"י {o.driver}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
