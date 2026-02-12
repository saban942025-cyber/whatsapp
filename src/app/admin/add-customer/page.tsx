'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { getSabanResponse } from '@/app/actions/gemini-brain';
import { 
  UserPlus, Upload, CheckCircle, Loader2, 
  Image as ImageIcon, Clipboard, Share2, Users, FileText 
} from 'lucide-react';
import Papa from 'papaparse';

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  // 1. טעינת רשימת לקוחות קיימים מהמערכת
  useEffect(() => {
    const fetchCustomers = async () => {
      const querySnapshot = await getDocs(collection(db, 'customer_memory'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(docs);
    };
    fetchCustomers();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = selectedCustomerId || customerName.replace(/\s+/g, '_');

    if (!file || !targetId) {
      alert("נא לבחור לקוח קיים או להזין שם ללקוח חדש!");
      return;
    }

    setIsProcessing(true);
    setStatus('גימיני מנתח את ההזמנה ומקטלג לפי תאריך...');

    Papa.parse(file, {
      complete: async (results) => {
        try {
          const rawText = JSON.stringify(results.data.slice(0, 20));
          // הנחיה לגימיני לחלץ תאריך ומוצרים
          const prompt = `נתח את ה-CSV הזה. 
          1. חלץ את התאריך המופיע במסמך (למשל 05/02/2026).
          2. חלץ רשימת מוצרים (שם, מק"ט, כמות).
          3. חלץ שם פרויקט וכתובת.
          תחזיר JSON: {"date": "...", "project": "...", "products": [...], "summary": "..."}`;
          
          const analysisStr = await getSabanResponse(prompt, targetId);
          const cleanJson = JSON.parse(analysisStr.replace(/```json|```/g, ''));

          const brainRef = doc(db, 'customer_memory', targetId);
          const docSnap = await getDoc(brainRef);

          const orderData = {
            orderDate: cleanJson.date,
            items: cleanJson.products,
            uploadedAt: new Date().toISOString()
          };

          if (docSnap.exists()) {
            // עדכון לקוח קיים - הוספת הזמנה להיסטוריה (מקוטלג לפי תאריך)
            await updateDoc(brainRef, {
              orderHistory: arrayUnion(orderData),
              lastUpdate: new Date().toISOString(),
              status: 'preparing'
            });
            setStatus(`✅ הזמנה מתאריך ${cleanJson.date} נוספה לזיכרון של ${docSnap.data().name}`);
          } else {
            // יצירת לקוח חדש במידה ולא נבחר מהרשימה
            await setDoc(brainRef, {
              clientId: targetId,
              name: customerName,
              profileImage: profileImage || `https://i.pravatar.cc/150?u=${targetId}`,
              orderHistory: [orderData],
              project: cleanJson.project,
              lastUpdate: new Date().toISOString(),
              status: 'preparing'
            });
            setStatus(`✅ לקוח חדש ${customerName} נוצר עם הזמנה ראשונה.`);
          }

          setGeneratedLink(`${window.location.origin}/client/${targetId}`);
        } catch (error) {
          setStatus('❌ שגיאה בניתוח הקובץ');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 font-sans text-right" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-[#075E54] text-white p-8 rounded-[30px] shadow-lg">
          <h1 className="text-2xl font-black flex items-center gap-3"><Users size={32} /> מרכז ניהול הזמנות - ח. סבן</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* בחירת לקוח קיים */}
          <div className="bg-white p-6 rounded-[30px] shadow-md border-t-4 border-blue-500">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-blue-600"><FileText size={20} /> בחר לקוח קיים</h2>
            <select 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setCustomerName(''); // מאפס יצירת חדש אם נבחר קיים
              }}
              value={selectedCustomerId}
            >
              <option value="">-- בחר לקוח מהרשימה --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
              ))}
            </select>
          </div>

          {/* הוספת לקוח חדש */}
          <div className="bg-white p-6 rounded-[30px] shadow-md border-t-4 border-green-500">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-green-600"><UserPlus size={20} /> או צור לקוח חדש</h2>
            <input 
              placeholder="שם לקוח חדש" 
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSelectedCustomerId(''); // מאפס בחירה אם מקלידים חדש
              }}
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-green-500"
            />
          </div>
        </div>

        {/* העלאת קובץ וזיהוי */}
        <div className="bg-white p-8 rounded-[30px] shadow-xl text-center">
          <h2 className="text-xl font-black mb-6">טען הזמנה חדשה (CSV)</h2>
          
          {!selectedCustomerId && !customerName && (
            <p className="text-red-500 text-sm mb-4 font-bold animate-pulse">חובה לבחור לקוח או להזין שם לפני העלאת קובץ</p>
          )}

          <div className="relative border-4 border-dashed border-gray-100 rounded-[30px] p-12 hover:bg-green-50 transition-all cursor-pointer">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-[#25D366]" size={48} />
                <p className="font-bold text-[#075E54]">{status}</p>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                <Upload className="mx-auto text-gray-300 mb-4" size={50} />
                <p className="font-black text-gray-500 text-lg">גרור לכאן את קובץ האקסל</p>
                <p className="text-sm text-gray-400">גימיני יקטלג את המוצרים לפי התאריך שבקובץ</p>
              </label>
            )}
          </div>

          {generatedLink && (
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  const text = `שלום, ההזמנה שלך עודכנה במערכת ח. סבן! 🏗️\nלצפייה בפרטים:\n${generatedLink}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 bg-[#25D366] text-white p-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2"
              >
                <Share2 size={20} /> שלח עדכון בוואטסאפ
              </button>
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(generatedLink);
                   alert("הלינק הועתק!");
                }}
                className="bg-gray-100 p-4 rounded-2xl font-bold"
              >
                <Clipboard size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
