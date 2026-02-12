'use client'
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('ממתין להפעלה...');

  const seedCustomerBrain = async () => {
    setStatus('מבצע זריעה לנתוני שחר שאול...');
    try {
      const clientId = 'שחר_שאול';
      const brainRef = doc(db, 'customer_memory', clientId);

      await setDoc(brainRef, {
        clientId: clientId,
        name: 'שחר שאול',
        accumulatedKnowledge: 'לקוח ותיק בתחום השלד. מעדיף אספקה מוקדם בבוקר. רגיש לדיוק בסוג החול. יש לו אתר פעיל ברעננה עם מגבלת גישה למשאית גדולה.',
        projects: [
          { name: 'וילה רעננה', location: 'רחוב אחוזה 10, רעננה', lastProducts: ['בטון', 'חול מחצבה'] }
        ],
        preferences: {
          deliveryMethod: 'משאית מנוף קטנה',
          preferredHours: '07:00'
        },
        lastUpdate: new Date().toISOString()
      });

      setStatus('✅ הזיכרון של שחר שאול הופעל בהצלחה!');
    } catch (error) {
      console.error(error);
      setStatus('❌ שגיאה: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-20 text-center font-sans" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">אתחול מוח לקוח - ח. סבן</h1>
      <div className="bg-gray-100 p-6 rounded-xl mb-8 inline-block">
        <p className="text-lg">{status}</p>
      </div>
      <br />
      <button 
        onClick={seedCustomerBrain}
        className="bg-[#107c10] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-[#0b5a0b] active:scale-95 transition-all"
      >
        הפעל מוח שחר שאול
      </button>
    </div>
  );
}
