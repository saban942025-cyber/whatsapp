'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, initializeFirestore, memoryLocalCache } from "firebase/firestore";
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
const db = initializeFirestore(app, { localCache: memoryLocalCache() });

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "products"));
      setAllProducts(snap.docs.map(d => d.data()));
    };
    load();
  }, []);

  const sendOrder = async () => {
    if (cart.length === 0 || !form.phone) return alert("בחר מוצרים ומלא טלפון");
    setLoading(true);

    const payload = {
      customer: form.name || "לקוח ללא שם",
      phone: form.phone,
      items: cart.map(i => `${i.name} (x${i.qty})`).join(", "),
      address: form.address || "ללא כתובת"
    };

    try {
      // שליחה ישירה למיקרוסופט
      await fetch("https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // גיבוי ב-Firebase
      await addDoc(collection(db, "orders"), { ...payload, timestamp: new Date() });

      alert("הזמנה נשלחה בהצלחה! ✅");
      setCart([]);
    } catch (e) {
      alert("שגיאה בשליחה. בדוק חיבור אינטרנט.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54' }}>סבן 94 - הזמנה</h2>
        <input type="text" placeholder="שם מלא" style={sInput} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={sInput} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת" style={sInput} onChange={e => setForm({...form, address: e.target.value})} />
        <input type="text" placeholder="חפש מוצר..." style={sInput} value={search} onChange={e => setSearch(e.target.value)} />
        {allProducts.filter(p => p.name.includes(search) && search.length > 1).map(p => (
          <div key={p.sku} onClick={() => {setCart([...cart, {...p, qty: 1}]); setSearch('');}} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>{p.name}</div>
        ))}
        <div style={{ marginTop: '15px' }}>
          {cart.map((item, i) => <div key={i}>{item.name} x {item.qty}</div>)}
        </div>
        <button onClick={sendOrder} disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#25D366', color: '#fff', border: 'none', borderRadius: '10px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? "מעבד..." : "שלח הזמנה"}
        </button>
      </div>
    </main>
  );
}

const sInput = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
