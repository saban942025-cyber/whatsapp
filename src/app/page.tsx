'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
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

  const filtered = search.length > 1 
    ? allProducts.filter(p => p.name.includes(search) || (p.sku && p.sku.includes(search)))
    : [];

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.sku === product.sku);
    if (existing) {
      setCart(cart.map(c => c.sku === product.sku ? {...c, qty: c.qty + 1} : c));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setSearch('');
  };

  const sendOrder = async () => {
    if (cart.length === 0 || !form.phone || !form.name) {
      return alert("נא למלא שם, טלפון ולבחור מוצרים");
    }
    
    setLoading(true);
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(", ");
    
    // הלינק המדויק שלך ל-Power Automate
    const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

    const payload = {
      customer: form.name,
      phone: form.phone,
      items: itemsSummary,
      address: form.address
    };

    try {
      // 1. ניסיון שליחה ל-SharePoint (Power Automate)
      const flowResponse = await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 2. שמירה ב-Firebase כגיבוי בטוח
      await addDoc(collection(db, "orders"), { 
        ...payload, 
        timestamp: new Date(), 
        status: "חדש" 
      });

      if (flowResponse.ok) {
        alert("הזמנה נקלטה בהצלחה ב-365 ובמערכת! 🚀");
      } else {
        alert("הזמנה נשמרה בגיבוי, אך הייתה בעיה בסנכרון ל-365.");
      }

      // 3. פתיחת ווטסאפ כגיבוי נוסף
      const waMsg = `הזמנה חדשה - סבן 94:\nלקוח: ${form.name}\nפריטים: ${itemsSummary}\nכתובת: ${form.address}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(waMsg)}`, '_blank');
      
      setCart([]);
    } catch (e) {
      console.error("Critical Error", e);
      alert("תקלה כללית בשליחה. אנא וודא חיבור לאינטרנט.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', background: '#075E54', color: 'white', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>סבן 94 - הזמנה חכמה</h1>
      </header>

      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <input type="text" placeholder="שם מלא" style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={inputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת למשלוח" style={inputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        
        <div style={{ position: 'relative', marginTop: '15px' }}>
          <input 
            type="text" 
            placeholder="חפש מוצר או מקט..." 
            style={{ ...inputStyle, border: '2px solid #075E54', fontWeight: 'bold' }} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {filtered.length > 0 && (
            <div style={{ position: 'absolute', width: '100%', background: 'white', zIndex: 10, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.map(p => (
                <div key={p.sku} onClick={() => addToCart(p)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{p.name}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          {cart.length > 0 && <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>סל הזמנה:</h3>}
          {cart.map(item => (
            <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', marginBottom: '5px', borderRadius: '8px' }}>
              <span>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => setCart(cart.map(c => c.sku === item.sku ? {...c, qty: Math.max(1, c.qty - 1)} : c))} style={btnCircle}>-</button>
                <strong>{item.qty}</strong>
                <button onClick={() => setCart(cart.map(c => c.sku === item.sku ? {...c, qty: c.qty + 1} : c))} style={btnCircle}>+</button>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={sendOrder} 
          disabled={loading}
          style={{ 
            width: '100%', padding: '15px', background: loading ? '#ccc' : '#25D366', 
            color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', 
            marginTop: '20px', cursor: 'pointer', fontSize: '18px' 
          }}
        >
          {loading ? "שולח..." : "שלח הזמנה ל-365"}
        </button>
      </div>
    </main>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const btnCircle = { width: '25px', height: '25px', borderRadius: '50%', border: '1px solid #075E54', background: 'white', cursor: 'pointer' };
