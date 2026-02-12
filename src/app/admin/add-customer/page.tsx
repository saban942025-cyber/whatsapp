'use client'
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Upload, UserPlus, FileText, CheckCircle } from 'lucide-react';

export default function AdminAddCustomer() {
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState(''); // למשל: "אבי_כהן"
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // פונקציה לניתוח CSV (סימולציה של הלוגיקה שביקשת)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !customerId) {
      alert("נא להזין מזהה לקוח לפני העלאת הקובץ");
      return;
    }
    
    setIsUploading(true);
    setStatus('גימיני מנתח את הקובץ ומחלץ מק"טים והיסטוריה...');

    // כאן בעתיד תבוא לוגיקת ה-PapaParse לקריאת ה-CSV
    // כרגע אנחנו מדמים יצירת "מוח" על בסיס המבנה שביקשת
    try {
      const brainRef = doc(db, 'customer_memory', customerId);
      
      await setDoc(brainRef, {
        clientId: customerId,
        name: customerName,
        lastUpdate: new Date().toISOString(),
        // המוח יתמלא בנתונים שה-AI יזהה מהקובץ
        accumulatedKnowledge: `לקוח חדש שהוקם על בסיס קובץ הזמנה. המערכת תזהה מק"טים מקטלוג סבן ותתאים אותם להזמנות עתידיות.`,
        orderHistory: [], // יתמלא מה-CSV
        projects: [],
        rentals: { containers: [] }
      });

      // עדכון סטטוס "בהכנה במחסן" כפי שביקשת
      const orderRef = collection(db, 'orders');
      await addDoc(orderRef, {
        customerId,
        status: 'preparing', // "בהכנה במחסן"
        timestamp: new Date().toISOString(),
        details: "הזמנה חדשה נקלטה מהמערכת וממתינה להעמסה"
      });

      setStatus(`✅ לקוח ${customerName} נוצר. הודעה נשלחה: "ההזמנה שלך עלתה למערכת, נעדכן בשלב ההעמסה".`);
    } catch (error) {
      setStatus('שגיאה ביצירת הלקוח');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#075E54] mb-8 flex items-center gap-3">
          <UserPlus size={36} /> ניהול לקוחות והזמנות - ח. סבן
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* טופס פרטי לקוח */}
          <div className="bg-white p-8 rounded-[30px] shadow-lg border-t-4 border-[#075E54]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="text-gray-400" /> פרטי לקוח חדש
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">שם הלקוח</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#25D366]" 
                  placeholder="למשל: אבי כהן"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">מזהה מערכת (באנגלית/עברית ללא רווחים)</label>
                <input 
                  type="text" 
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#25D366]" 
                  placeholder="למשל: avi_cohen"
                />
              </div>
            </div>
          </div>

          {/* העלאת קבצים וזיהוי מוח */}
          <div className="bg-white p-8 rounded-[30px] shadow-lg border-t-4 border-[#25D366]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="text-gray-400" /> העלאת קובץ הזמנה (CSV)
            </h2>
            
            <div className="border-4 border-dashed border-gray-100 rounded-2xl p-10 text-center hover:bg-gray-50 transition-all relative">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Upload className="mx-auto text-[#25D366] mb-4" size={48} />
              <p className="text-gray-500 font-medium">גרור קובץ אקסל או לחץ לבחירה</p>
              <p className="text-xs text-gray-400 mt-2">גימיני יזהה מוצרים, כמויות וכתובת באופן אוטומטי</p>
            </div>

            {status && (
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3 text-green-700 animate-fade-in">
                <CheckCircle size={20} />
                <p className="text-sm font-bold">{status}</p>
              </div>
            )}
          </div>
        </div>

        {/* תצוגה מקדימה לחזון שלך */}
        <div className="mt-10 bg-[#075E54] text-white p-6 rounded-[25px] shadow-inner">
          <h3 className="font-bold mb-2 uppercase text-xs opacity-70 tracking-widest">מנוע הזיהוי של גימיני (Vision)</h3>
          <p className="text-sm italic">
            "המערכת תסרוק את ה-CSV, תצמיד לכל שורה מק"ט מקטלוג סבן, ותעדכן את הלקוח בוואטסאפ ברגע שהמחסן מתחיל להעמיס."
          </p>
        </div>
      </div>
    </div>
  );
}
