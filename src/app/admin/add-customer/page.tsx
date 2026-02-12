'use client'
import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getSabanResponse } from '@/app/actions/gemini-brain';
import { 
  UserPlus, Upload, CheckCircle, Loader2, 
  Image as ImageIcon, Clipboard, Share2, AlertCircle 
} from 'lucide-react';
import Papa from 'papaparse';

export default function AdminAddCustomer() {
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [customerDetails, setCustomerDetails] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !customerId) {
      alert("נא להזין מזהה לקוח לפני העלאת הקובץ!");
      return;
    }

    setIsProcessing(true);
    setStatus('גימיני מנתח נתונים ומזהה פרויקט וכתובת...');

    Papa.parse(file, {
      complete: async (results) => {
        try {
          // 1. מניעת כפילויות
          const brainRef = doc(db, 'customer_memory', customerId);
          const docSnap = await getDoc(brainRef);
          
          if (docSnap.exists()) {
            setStatus('⚠️ שגיאה: מזהה לקוח כבר קיים במערכת!');
            setIsProcessing(false);
            return;
          }

          // 2. שליחה לגימיני לזיהוי מזהים (מספר לקוח, פרויקט, כתובת)
          const rawText = JSON.stringify(results.data.slice(0, 10)); // לוקחים את ההתחלה לזיהוי
          const prompt = `נתח את ה-CSV וחלץ: מספר לקוח, שם פרויקט, וכתובת אספקה. 
          תחזיר רק אובייקט JSON בפורמט: {"accNum": "...", "project": "...", "address": "..."}`;
          
          const analysisStr = await getSabanResponse(prompt, customerId);
          const cleanJson = JSON.parse(analysisStr.replace(/```json|```/g, ''));

          // 3. שמירה ל-Firebase
          const newCustomerData = {
            clientId: customerId,
            name: customerName,
            profileImage: profileImage || `https://i.pravatar.cc/150?u=${customerId}`,
            accNum: cleanJson.accNum,
            project: cleanJson.project,
            address: cleanJson.address,
            lastUpdate: new Date().toISOString(),
            status: 'preparing'
          };

          await setDoc(brainRef, newCustomerData);
          setCustomerDetails(newCustomerData);
          
          const link = `${window.location.origin}/client/${customerId}`;
          setGeneratedLink(link);
          setStatus('✅ הלקוח והמוח נוצרו בהצלחה!');
        } catch (error) {
          setStatus('❌ שגיאה בעיבוד הנתונים');
          console.error(error);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("הלינק הועתק לזיכרון!");
  };

  const shareToWhatsApp = () => {
    const text = `שלום ${customerName}, ברוך הבא למערכת ניהול ההזמנות החכמה של ח. סבן 🏗️\nמעכשיו תוכל לעקוב אחרי המכולות וההזמנות שלך כאן:\n${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 font-sans text-right" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-8 rounded-[30px] shadow-lg flex justify-between items-center">
          <h1 className="text-3xl font-black flex items-center gap-3"><UserPlus /> ניהול לקוח חכם</h1>
        </div>

        <div className="bg-white p-8 rounded-[30px] shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="שם הלקוח" value={customerName} onChange={e => setCustomerName(e.target.value)} className="p-4 border-2 rounded-2xl outline-none focus:border-[#25D366]" />
            <input placeholder="מזהה ID (ללא כפילויות)" value={customerId} onChange={e => setCustomerId(e.target.value)} className="p-4 border-2 rounded-2xl outline-none focus:border-[#25D366]" />
          </div>
          
          <input placeholder="לינק לתמונת פרופיל" value={profileImage} onChange={e => setProfileImage(e.target.value)} className="w-full p-4 border-2 rounded-2xl outline-none focus:border-[#25D366]" />

          <div className="relative border-4 border-dashed border-gray-100 rounded-[25px] p-10 text-center">
            {isProcessing ? (
              <Loader2 className="animate-spin mx-auto text-[#25D366]" size={40} />
            ) : (
              <label className="cursor-pointer">
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                <Upload className="mx-auto text-gray-300 mb-2" size={40} />
                <p className="font-bold text-gray-500">העלה CSV לזיהוי פרויקט וכתובת</p>
              </label>
            )}
            <p className="mt-2 text-sm text-blue-500 font-bold">{status}</p>
          </div>

          {generatedLink && (
            <div className="bg-gray-50 p-6 rounded-[25px] border-2 border-green-100 space-y-4">
              <div className="flex items-center gap-4">
                <img src={customerDetails?.profileImage} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <h3 className="font-black text-lg">{customerDetails?.name}</h3>
                  <p className="text-xs text-gray-500">פרויקט: {customerDetails?.project} | כתובת: {customerDetails?.address}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="flex-1 bg-gray-200 p-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Clipboard size={18} /> העתק לינק
                </button>
                <button onClick={shareToWhatsApp} className="flex-1 bg-[#25D366] text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                  <Share2 size={18} /> שלח לוואטסאפ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
