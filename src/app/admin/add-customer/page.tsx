'use client'
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { 
  UserPlus, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle, 
  Loader2, 
  Clipboard,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminAddCustomer() {
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !customerName) return alert("מלא שם ומזהה!");
    
    setIsUploading(true);
    setStatus('יוצר מוח לקוח ומנתח נתונים...');

    try {
      const clientId = customerId.trim().replace(/\s+/g, '_'); // מוודא מזהה נקי
      const brainRef = doc(db, 'customer_memory', clientId);
      
      // יצירת הזיכרון הראשוני של הלקוח
      await setDoc(brainRef, {
        clientId: clientId,
        name: customerName,
        profileImage: profileImage || "https://i.pravatar.cc/150?u=" + clientId,
        lastUpdate: new Date().toISOString(),
        accumulatedKnowledge: `לקוח חדש במערכת. המוח ילמד את העדפותיו מקבצי ההזמנות שיעלו.`,
        orderHistory: [],
        projects: [],
        rentals: { containers: [] }
      });

      const fullLink = `${window.location.origin}/client/${clientId}`;
      setGeneratedLink(fullLink);
      setStatus(`✅ לקוח ${customerName} נוצר בהצלחה!`);
    } catch (error) {
      console.error(error);
      setStatus('שגיאה ביצירת הלקוח');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("הלינק הועתק! שלח אותו עכשיו בוואטסאפ ללקוח.");
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-10 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* כותרת */}
        <div className="bg-[#075E54] text-white p-8 rounded-t-[30px] shadow-lg">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <UserPlus size={36} /> ניהול לקוחות ח. סבן
          </h1>
          <p className="text-green-200 mt-2">הוספת לקוח, הגדרת תמונה וטעינת זיכרון היסטורי</p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-b-[30px] shadow-xl space-y-10">
          
          <form onSubmit={createCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">שם הלקוח (עבור שחר שאול)</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#25D366] transition-all" 
                  placeholder="למשל: אבי לוי"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">מזהה מערכת (באנגלית/עברית - ללא רווחים)</label>
                <input 
                  type="text" 
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full mt-1 p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#25D366] transition-all" 
                  placeholder="avi_levi"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ImageIcon size={16} /> קישור לתמונת פרופיל (URL)
                </label>
                <input 
                  type="text" 
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full mt-1 p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#25D366] transition-all" 
                  placeholder="הדבק לינק לתמונה..."
                />
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full h-[60px] bg-[#25D366] hover:bg-[#1ebd5e] text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle size={24} />}
                צור מוח לקוח חדש
              </button>
            </div>
          </form>

          {/* הצגת הלינק שנוצר */}
          {generatedLink && (
            <div className="bg-green-50 p-6 rounded-[25px] border-2 border-dashed border-green-200 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-black text-[#075E54] mb-3 flex items-center gap-2">
                <LinkIcon size={20} /> הלינק האישי של {customerName}:
              </h3>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={generatedLink}
                  className="flex-1 bg-white p-3 rounded-xl border text-sm text-gray-500 font-mono"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-[#075E54] text-white px-4 rounded-xl hover:opacity-90 transition-all"
                >
                  <Clipboard size={20} />
                </button>
              </div>
            </div>
          )}

          {/* העלאת CSV */}
          <div className="border-t pt-10">
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="text-gray-400" /> העלאת היסטוריית הזמנות (CSV)
            </h2>
            <div className="relative border-4 border-dashed border-gray-100 rounded-[25px] p-12 text-center hover:bg-gray-50 transition-all cursor-pointer">
              <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-bold">גרור קובץ אקסל לכאן כדי ללמד את המוח</p>
              <p className="text-xs text-gray-400 mt-2 italic">גימיני יזהה מוצרים, מק"טים וכמויות באופן אוטומטי</p>
            </div>
          </div>

        </div>

        {/* חזון הודעה אוטומטית */}
        <div className="mt-8 flex items-center gap-3 bg-white/50 p-4 rounded-2xl border border-white">
          <MessageSquare className="text-[#075E54]" />
          <p className="text-sm text-gray-600 italic">
            "ברגע שתעלה קובץ, המערכת תשלח הודעה: <b>ההזמנה שלך עלתה למערכת, נעדכן בשלב ההעמסה</b>"
          </p>
        </div>
      </div>
    </div>
  );
}
