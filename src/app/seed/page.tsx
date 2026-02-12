'use client'
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('ממתין להפעלה...');

  const seedCustomerBrain = async () => {
    setStatus('מלמד את המוח נתוני אמת מקבצי האקסל...');
    try {
      const clientId = 'שחר_שאול';
      const brainRef = doc(db, 'customer_memory', clientId);

      await setDoc(brainRef, {
        clientId: clientId,
        name: 'שחר שאול',
        phone: '0501234567',
        // המוח לומד כאן את התובנות הכלליות מהקבצים
        accumulatedKnowledge: `לקוח רוכש קבוע של לוחות גבס (לבן 200/12.5), מוצרי בידוד וצמנט. 
        מרבה להזמין שקי סומסום וטיט. משתמש במכולות פסולת 8 קוב באופן קבוע. 
        הזמנות מבוצעות בדרך כלל בשעות הבוקר המוקדמות (07:00-08:00).`,
        
        // פרויקטים וכתובות כפי שהופיעו בקבצים
        projects: [
          { 
            name: 'וילה רעננה', 
            location: 'רעננה', 
            accessNotes: 'גישה מוגבלת, דורש מנוף קטן. הזמנות אחרונות: גבס וסומסום.',
            preferredDriver: 'חכמת' 
          },
          { 
            name: 'תל אביב - יפו', 
            location: 'תל אביב - יפו', 
            accessNotes: 'פריקה במרכז העיר, דורש תיאום מראש.',
            preferredDriver: 'עלי'
          }
        ],

        // היסטוריית הזמנות מבוססת על קבצי ה-Export שהעלית
        orderHistory: [
          { date: '2026-02-05', product: 'טיט מוכן/חול מחצבה', quantity: '4-20 יחידות', driver: 'חכמת', truck: 'מרצדס מנוף' },
          { date: '2026-01-29', product: 'לוחות גבס לבן + סומסום שק', quantity: '20-45 יחידות', driver: 'עלי', truck: 'איסוזו' },
          { date: '2026-01-20', product: 'טיט צמנט 710 / שפכטל 634', quantity: '30-50 שקים', driver: 'חכמת', truck: 'מרצדס מנוף' }
        ],

        // נתוני מכולות אמת מהקבצים (למשל מכולה 8 קוב)
        rentals: {
          containers: [
            { 
              id: 'CONT-82002', 
              size: '8 קוב', 
              startDate: '2026-01-20', // חרג מה-10 ימים לפי קובץ Export 3
              location: 'וילה רעננה',
              status: 'overdue' 
            }
          ]
        },

        preferences: {
          deliveryMethod: 'משאית מנוף קטנה',
          preferredHours: '07:20',
          autoNotificationOnOverdue: true
        },
        lastUpdate: new Date().toISOString()
      });

      setStatus('✅ המוח של שחר שאול הוכשר בהצלחה עם נתוני האקסל!');
    } catch (error) {
      console.error(error);
      setStatus('❌ שגיאה: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5DDD5] flex items-center justify-center p-6" dir="rtl">
      <div className="bg-white p-10 rounded-[30px] shadow-2xl max-w-lg w-full text-center">
        <h1 className="text-2xl font-black text-[#075E54] mb-6">הזרקת היסטוריית אקסל למוח</h1>
        <div className="bg-gray-50 p-4 rounded-2xl mb-6">
          <p className="text-gray-700">{status}</p>
        </div>
        <button 
          onClick={seedCustomerBrain}
          className="w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-[#1ebd5e] transition-all"
        >
          למד את המוח מהקבצים 🚀
        </button>
      </div>
    </div>
  );
}
