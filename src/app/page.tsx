'use client';
import { initializeApp, getApps } from "firebase/app";
import { 
  initializeFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  memoryLocalCache 
} from "firebase/firestore";
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
};

// אתחול Firebase עם זיכרון RAM בלבד - זה פותר את שגיאת ה-IndexedDB!
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = initializeFirestore(app, {
  localCache: memoryLocalCache() 
});

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => d.data()));
      } catch (e) { console.error("Firebase Load Error", e); }
    };
    load();
  }, []);

  const sendOrder = async () => {
    if (cart.length === 0 || !form.phone) return alert("נא למלא טלפון ולבחור מוצרים");
    
    setLoading(true);
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(", ");
    
    // הלינק של ה-Flow שלך
    const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

    const payload = {
      customer: form.name || "לקוח ללא שם",
      phone: form.phone,
      items: itemsSummary,
      address: form.address || "ללא כתובת"
    };

    try {
      // שליחה ל-365
      const flowResponse = await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // שמירה ב-Firebase
      await addDoc(collection(db, "orders"), { ...payload, timestamp: new Date(), status: "חדש" });

      if (flowResponse.ok) {
        alert("הזמנה נקלטה ב-365 בהצלחה! ✅");
        setCart([]);
      } else {
        alert("הזמנה נשמרה, אך בדוק את ה-Flow ב-365.");
      }

      // פתיחת ווטסאפ
      const waMsg = `הזמנה חדשה - סבן 94:\nלקוח: ${form.name}\nפריטים: ${itemsSummary}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(waMsg)}`, '_blank');
      
    } catch (error) {
      console.error("Critical Send Error", error);
      alert("שגיאה בשליחה. נסה מדפדפן אחר או נקה זיכרון.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = search.length > 1 ? allProducts.filter(p => p.name.includes(search)) : [];

  return (
    <main dir="rtl" style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#075E54', textAlign: 'center' }}>סבן 94 - הזמנה חכמה</h2>
        <input type="text" placeholder="שם מלא" style={sInput} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={sInput} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת" style={sInput} onChange={e => setForm({...form, address: e.target.value})} />
        
        <input type="text" placeholder="חיפוש מוצר..." style={{...sInput, borderColor: '#075E54'}} value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.map(p => (
          <div key={p.sku} onClick={() => {setCart([...cart, {...p, qty: 1}]); setSearch('');}} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>{p.name}</div>
        ))}

        <div style={{ marginTop: '20px' }}>
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '5px' }}>
              <span>{item.name}</span>
              <strong>x{item.qty}</strong>
            </div>
          ))}
        </div>

        <button onClick={sendOrder} disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>
          {loading ? "שולח נתונים..." : "שלח הזמנה ל-365"}
        </button>
      </div>
    </main>
  );
}

const sInput = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
