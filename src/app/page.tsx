'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, terminate, clearIndexedDbPersistence } from "firebase/firestore";
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

// הוספת מנגנון הגנה: אם ה-IndexedDB דפוק, ננקה אותו
if (typeof window !== "undefined") {
  clearIndexedDbPersistence(db).catch((err) => {
    console.error("Could not clear IndexedDB", err);
  });
}

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
    console.log("--- תחילת תהליך שליחה ---");

    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(", ");
    const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

    const payload = {
      customer: form.name || "לקוח ללא שם",
      phone: form.phone,
      items: itemsSummary,
      address: form.address || "ללא כתובת"
    };

    try {
      console.log("שולח נתונים ל-Power Automate:", payload);

      // שיפור: הוספת Timeout ידני כדי לבדוק אם השרת מגיב
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000); // 10 שניות המתנה

      const response = await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(id);
      console.log("תגובת שרת 365:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`שרת 365 החזיר שגיאה: ${response.status}`);
      }

      // שמירה ב-Firebase רק אם השליחה ל-365 הצליחה או כגיבוי
      await addDoc(collection(db, "orders"), { ...payload, timestamp: new Date(), status: "חדש" });

      alert("ההזמנה נקלטה ב-365 בהצלחה! ✅");
      setCart([]);
      
    } catch (error: any) {
      console.error("כשל בשליחה:", error);
      if (error.name === 'AbortError') {
        alert("השרת של מיקרוסופט לא הגיב בזמן (Timeout). בדוק את האוטומציה.");
      } else {
        alert(`כשל טכני: ${error.message}. בדוק את ה-Console בדפדפן.`);
      }
    } finally {
      setLoading(false);
      console.log("--- סיום תהליך ---");
    }
  };

  const addToCart = (p: any) => {
    setCart([...cart, { ...p, qty: 1 }]);
    setSearch('');
  };

  const filtered = search.length > 1 ? allProducts.filter(p => p.name.includes(search)) : [];

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>הזמנה לסבן 94</h2>
        <input type="text" placeholder="שם" style={iStyle} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={iStyle} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת" style={iStyle} onChange={e => setForm({...form, address: e.target.value})} />
        
        <input type="text" placeholder="חפש מוצר..." style={iStyle} value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.map(p => (
          <div key={p.sku} onClick={() => addToCart(p)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{p.name}</div>
        ))}

        <div style={{ marginTop: '20px' }}>
          {cart.map((item, idx) => <div key={idx}>{item.name} x {item.qty}</div>)}
        </div>

        <button 
          onClick={sendOrder} 
          disabled={loading}
          style={{ width: '100%', padding: '15px', marginTop: '20px', background: loading ? '#ccc' : '#25D366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? "בודק חיבור..." : "שלח הזמנה לרשימה"}
        </button>
      </div>
    </main>
  );
}

const iStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' };
