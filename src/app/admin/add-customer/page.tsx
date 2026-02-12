'use client'
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getSabanResponse } from '@/app/actions/gemini-brain'; // נשתמש במוח הקיים
import { Upload, UserPlus, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import Papa from 'papaparse'; // ספרייה לקריאת CSV

export default function AdminAddCustomer() {
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !customerId) {
      alert("נא להזין מזהה לקוח (ID) לפני העלאת הקובץ!");
      return;
    }

    setIsProcessing(true);
    setStatus('קורא את הקובץ...');

    Papa.parse(file, {
      complete: async (results) => {
        const rawText = JSON.stringify(results.data);
        setStatus('גימיני מנתח מוצרים, מק"טים וכמויות...');

        try {
          // שליחת הטקסט הגולמי לגימיני לניתוח
          const prompt = `נתח את נתוני ה-CSV הבאים של הזמנת חומרי בניין. 
          חלץ רשימה של מוצרים הכוללת: שם מוצר, מק"ט, וכמות. 
          בנוסף, סכם ב-2 משפטים מה הלקוח נוהג להזמין.
          נתונים: ${rawText}`;

          const analysis = await getSabanResponse(prompt, customerId);

          // שמירה ל-Firebase
          const brainRef = doc(db, 'customer_memory', customerId);
          await setDoc(brainRef, {
            clientId: customerId,
            name: customerName,
            profileImage: profileImage || `https://i.pravatar.cc/150?u=${customerId}`,
            accumulatedKnowledge: analysis,
            lastUpdate: new Date().toISOString(),
            status: 'preparing' // "בהכנה במחסן"
          });

          setStatus(`✅ המוח של ${customerName} נוצר בהצלחה על בסיס זיהוי הקובץ!`);
        } catch (error) {
          setStatus('❌ שגיאה בניתוח הקובץ ע"י גימיני');
        } finally {
          setIsProcessing(false);
        }
      },
      error: () => setStatus('❌ שגיאה בקריאת קובץ ה-CSV')
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-8 rounded-[30px] shadow-lg">
          <h1 className="text-3xl font-black flex items-center gap-3"><UserPlus /> ניהול לקוח חכם</h1>
        </div>

        <div className="bg-white p-8 rounded-[30px] shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="שם לקוח (למשל: אבי לוי)" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              className="p-4 border-2 rounded-2xl outline-none focus:border-[#25D366]"
            />
            <input 
              placeholder="מזהה ID (למשל: avi_l)" 
              value={customerId} 
              onChange={e => setCustomerId(e.target.value)}
              className="p-4 border-2 rounded-2xl outline-none focus:border-[#25D366]"
            />
          </div>

          <div className="flex items-center gap-2">
            <ImageIcon className="text-gray-400" />
            <input 
              placeholder="לינק לתמונת פרופיל (URL)" 
              value={profileImage} 
              onChange={e => setProfileImage(e.target.value)}
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-[#25D366]"
            />
          </div>

          <div className="relative border-4 border-dashed border-gray-100 rounded-[25px] p-12 text-center hover:bg-green-50 transition-all cursor-pointer">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-[#25D366]" size={48} />
                <p className="font-bold text-[#075E54]">{status}</p>
              </div>
            ) : (
              <>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-bold">העלה קובץ CSV לזיהוי אוטומטי</p>
                {status && <p className="text-sm text-green-600 mt-2 font-bold">{status}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
