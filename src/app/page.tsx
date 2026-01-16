'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
};

// אתחול בטוח של Firebase כדי למנוע שגיאות ב-Re-render
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const CATALOG = [
  { id: 'sand', name: 'חול מחצבה (בלה)', icon: '🏗️' },
  { id: 'aggregate', name: 'סומסום (בלה)', icon: '🏔️' },
  { id: 'cement', name: 'מלט (שק)', icon: '🧱' },
  { id: 'cont8', name: 'מכולה 8 קוב', icon: '🗑️' },
  { id: 'cont10', name: 'מכולה 10 קוב', icon: '🚛' },
];

export default function Home() {
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({ customerName: '', address: '' });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // פונקציית זיהוי חכמה
  const identifyCustomer = async (val: string) => {
    setPhone(val);
    if (val.length >= 10) {
      try {
        const q = query(collection(db, "orders"), where("phone", "==", val), orderBy("timestamp", "desc"), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setFormData({ customerName: data.customerName, address: data.address });
        }
      } catch (err) { console.error("Customer identification error", err); }
    }
  };

  const toggleItem = (name: string) => {
    setSelectedItems(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  const sendOrder = async () => {
    if (!phone || selectedItems.length === 0) return alert("אחי, בחר לפחות פריט אחד ומלא טלפון");
    setLoading(true);
    try {
      const orderSummary = selectedItems.join(", ");
      const docRef = await addDoc(collection(db, "orders"), {
        ...formData, phone, items: orderSummary, status: "חדש", timestamp: new Date()
      });
      const msg = `*הזמנה חדשה - סבן 94*\nלקוח: ${formData.customerName}\nפריטים: ${orderSummary}\nכתובת: ${formData.address}\nמעקב: ${docRef.id}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(msg)}`, '_blank');
      setSelectedItems([]);
    } catch (e) { alert("תקלה בשמירה ב-Firebase"); }
    setLoading(false);
  };

  return (
    <main dir="rtl" style={{ fontFamily: 'sans-serif', backgroundColor: '#E5DDD5', minHeight: '100vh', paddingBottom: '100px' }}>
      <div style={{ backgroundColor: '#075E54', color: 'white', padding: '15px', textAlign: 'center' }}>
        <h2>סבן 94 - הזמנה חכמה</h2>
      </div>
      <div style={{ padding: '15px' }}>
        <input type="tel" placeholder="מספר טלפון לזיהוי" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }} onChange={(e) => identifyCustomer(e.target.value)} />
        <input type="text" placeholder="שם מלא" value={formData.customerName} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px' }} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
        <input type="text" placeholder="כתובת למשלוח" value={formData.address} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '20px' }} onChange={(e) => setFormData({...formData, address: e.target.value})} />
        <h3>בחר מה לשלוח לך:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {CATALOG.map(item => (
            <div key={item.id} onClick={() => toggleItem(item.name)} style={{ 
              padding: '15px', background: selectedItems.includes(item.name) ? '#DCF8C6' : 'white',
              borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: selectedItems.includes(item.name) ? '2px solid #25D366' : '1px solid #ddd'
            }}>
              <div style={{ fontSize: '24px' }}>{item.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 0, width: '100%', background: 'white', padding: '15px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
        <button onClick={sendOrder} disabled={loading} style={{ width: '100%', padding: '15px', background: '#25D366', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '18px' }}>
          {loading ? 'מעבד...' : `שלח הזמנה (${selectedItems.length} פריטים)`}
        </button>
      </div>
    </main>
  );
}
