'use client'
import { db } from '@/src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('ממתין להפעלה...');

  const seedCustomerBrain = async () => {
    setStatus('מעדכן נתוני עומק, מכולות והיסטוריית נהגים עבור שחר שאול...');
    try {
      const clientId = 'שחר_שאול';
      const brainRef = doc(db, 'customer_memory', clientId);

      await setDoc(brainRef, {
        clientId: clientId,
        name: 'שחר שאול',
        phone: '0501234567',
        accumulatedKnowledge: 'לקוח אסטרטגי בתחום השלד. מעדיף אספקה ב-07:00 בבוקר בדיוק. רגיש מאוד לאיכות החול (מעדיף חול מחצבה נקי). דורש משאית מנוף קטנה בלבד לאתר ברעננה בגלל רחוב צר.',
        
        // היסטוריית פרויקטים וכתובות מדויקות
        projects: [
          { 
            name: 'וילה רעננה', 
            location: 'רחוב אחוזה 10, רעננה', 
            accessNotes: 'גישה צרה מאוד, חנייה מוגבלת. חובה מנוף קטן (עד 7 טון).',
            preferredDriver: 'חכמת' 
          },
          { 
            name: 'פרויקט הרצליה', 
            location: 'רחוב הנדיב 5, הרצליה', 
            accessNotes: 'אין הגבלת משקל, פריקה על המדרכה בתיאום מראש.',
            preferredDriver: 'עלי'
          }
        ],

        // היסטוריית הזמנות לטובת למידה של גימיני
        orderHistory: [
          { date: '2026-01-15', product: 'חול מחצבה', quantity: '20 שקיות', driver: 'חכמת', truck: 'מרצדס מנוף' },
          { date: '2026-01-10', product: 'בטון מוכן', quantity: '5 קוב', driver: 'עלי', truck: 'איסוזו פלטה' },
          { date: '2025-12-28', product: 'טיט מוכן', quantity: '10 שקים', driver: 'חכמת', truck: 'מרצדס מנוף' }
        ],

        // ניהול מכולות בשכירות - כולל חריגה של מעל 10 ימים
        rentals: {
          containers: [
            { 
              id: 'CONT-992', 
              size: '8 קוב', 
              startDate: '2026-01-20', // תאריך ישן שיוצר חריגה של מעל 10 ימים
              location: 'וילה רעננה',
              status: 'overdue',
              dailyLateFee: 50 // קנס יומי על חריגה
            },
            { 
              id: 'CONT-104', 
              size: '10 קוב', 
              startDate: '2026-02-08', 
              location: 'פרויקט הרצליה',
              status: 'active'
            }
          ]
        },

        preferences: {
          deliveryMethod: 'משאית מנוף קטנה',
          preferredHours: '07:00',
          autoNotificationOnOverdue: true // מאפשר שליחת OneSignal בחריגה
        },
        lastUpdate: new Date().toISOString()
      });

      setStatus('✅ הזיכרון המורחב עודכן בהצלחה! מכולות והיסטוריה בפנים.');
    } catch (error) {
      console.error(error);
      setStatus('❌ שגיאה בביצוע ה-Seed: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5DDD5] flex items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-white p-10 rounded-[30px] shadow-2xl max-w-lg w-full text-center border-t-8 border-[#075E54]">
        <h1 className="text-3xl font-black text-[#075E54] mb-6">ניהול זיכרון - ח. סבן</h1>
        
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-2xl mb-8">
          <p className="text-sm text-gray-500 mb-2 font-bold">סטטוס מערכת:</p>
          <p className="text-xl font-black text-gray-800">{status}</p>
        </div>

        <button 
          onClick={seedCustomerBrain}
          className="w-full bg-[#25D366] hover:bg-[#1ebd5e] text-white text-xl font-black py-5 rounded-2xl shadow-lg transform active:scale-95 transition-all duration-200"
        >
          עדכן נתונים, מכולות והיסטוריה 🚀
        </button>
        
        <p className="mt-6 text-gray-400 text-sm italic">
          * לחיצה על הכפתור תעדכן את הזיכרון של שחר שאול ב-Firebase
        </p>
      </div>
    </div>
  );
}
