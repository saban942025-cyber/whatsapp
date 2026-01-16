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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const CATALOG = [
  { id: '1', name: 'חול מחצבה (בלה)', icon: '🏗️' },
  { id: '2', name: 'סומסום (בלה)', icon: '🏔️' },
  { id: '3', name: 'מכולה 8 קוב', icon: '🗑️' },
  { id: '4', name: 'מכולה 10 קוב', icon: '🚛' },
];

export default function OrderPage() {
  const [phone, setPhone] = useState('');
  const [form, setForm] = useState({ name: '', address: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const toggle = (item: string) => {
    setSelected(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const autoFill = async (num: string) => {
    setPhone(num);
    if (num.length >= 10) {
      const q = query(collection(db, "orders"), where("phone", "==", num), orderBy("timestamp", "desc"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setForm({ name: data.customerName || '', address: data.address || '' });
      }
    }
  };

  const executeOrder = async () => {
    if (!phone || selected.length === 0) return alert("אחי, תבחר פריטים ותמלא טלפון");
    setIsSending(true);
    const itemsStr = selected.join(", ");

    try {
      // 1. SharePoint Webhook
      await fetch('YOUR_SHAREPOINT_WEBHOOK_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form.name, phone, items: itemsStr, address: form.address }),
      });

      // 2. Firebase
      const docRef = await addDoc(collection(db, "orders"), {
        customerName: form.name, phone, items: itemsStr, address: form.address, status: "חדש", timestamp: new Date()
      });

      // 3. WhatsApp
      const waMsg = `*הזמנה מסבן 94*\nלקוח: ${form.name}\nפריטים: ${itemsStr}\nכתובת: ${form.address}\nמספר מעקב: ${docRef.id}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(waMsg)}`, '_blank');
      
      setSelected([]);
      alert("הזמנה נקלטה!");
    } catch (e) { alert("שגיאה בשליחה"); }
    setIsSending(false);
  };

  return (
    <main dir="rtl" style={{ backgroundColor: '#f5f5f7', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <header style={{ background: '#075E54', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '0 0 20px 20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>SABAN 94</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>הזמנה מהירה וחכמה</p>
      </header>

      <section style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <input type="tel" placeholder="טלפון לזיהוי" style={inputStyle} onChange={(e) => autoFill(e.target.value)} />
          <input type="text" placeholder="שם הלקוח" value={form.name} style={inputStyle} onChange={(e) => setForm({...form, name: e.target.value})} />
          <input type="text" placeholder="כתובת למשלוח" value={form.address} style={inputStyle} onChange={(e) => setForm({...form, address: e.target.value})} />
        </div>

        <h3 style={{ marginTop: '25px' }}>מה לשלוח לך?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {CATALOG.map(item => (
            <div key={item.id} onClick={() => toggle(item.name)} style={{
              padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: '0.2s',
              background: selected.includes(item.name) ? '#DCF8C6' : 'white',
              border: selected.includes(item.name) ? '2px solid #25D366' : '1px solid #eee'
            }}>
              <div style={{ fontSize: '32px' }}>{item.icon}</div>
              <div style={{ fontWeight: '600' }}>{item.name}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ position: 'fixed', bottom: 0, width: '100%', padding: '20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxSizing: 'border-box' }}>
        <button onClick={executeOrder} disabled={isSending} style={{
          width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#25D366', color: 'white', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
        }}>
          {isSending ? 'מעבד...' : `שלח הזמנה (${selected.length})`}
        </button>
      </footer>
    </main>
  );
}

const inputStyle = { width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #eee', fontSize: '16px', boxSizing: 'border-box' as 'border-box' };
