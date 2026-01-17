'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';

// הגדרות Firebase שלך
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

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "products"));
      setAllProducts(snap.docs.map(d => d.data()));
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
  if (cart.length === 0 || !form.phone) return alert("בחר מוצרים ומלא טלפון");
  
  const payload = {
    customer: form.name,
    phone: form.phone,
    items: cart.map(i => `${i.name} (x${i.qty})`).join(", "),
    address: form.address
  };

  try {
    // הוספת mode: 'no-cors' עוזרת לעקוף חסימות דפדפן מסוימות
    fetch("https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors' // וודא שזה על cors
    });

    alert("הזמנה נשלחה! בדוק את ה-SharePoint בעוד רגע.");
    window.open(`https://wa.me/972508860896?text=${encodeURIComponent("הזמנה חדשה מסבן 94")}`, '_blank');
  } catch (e) {
    alert("תקלה בשליחה");
  }
};

      // 3. שליחה לווטסאפ
      const waMsg = `הזמנה חדשה מסבן 94:\nלקוח: ${form.name}\nפריטים: ${itemsSummary}\nכתובת: ${form.address}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(waMsg)}`, '_blank');
      
      setCart([]);
      alert("הזמנה נקלטה במערכות הארגוניות! 🚀");
    } catch (e) {
      alert("שגיאה בחיבור למערכת 365");
    }
  };

  return (
    <main dir="rtl" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', background: '#075E54', color: 'white', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
        <h1>סבן 94 - הזמנה חכמה</h1>
      </header>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <input type="text" placeholder="שם מלא" style={inputStyle} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={inputStyle} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת" style={inputStyle} onChange={e => setForm({...form, address: e.target.value})} />
        
        <div style={{ position: 'relative', marginTop: '15px' }}>
          <input type="text" placeholder="חפש מוצר או מקט..." style={{ ...inputStyle, border: '2px solid #075E54' }} value={search} onChange={e => setSearch(e.target.value)} />
          {filtered.length > 0 && (
            <div style={{ position: 'absolute', width: '100%', background: 'white', zIndex: 10, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {filtered.map(p => (
                <div key={p.sku} onClick={() => addToCart(p)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{p.name}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          {cart.map(item => (
            <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
              <span>{item.name}</span>
              <div>
                <button onClick={() => setCart(cart.map(c => c.sku === item.sku ? {...c, qty: Math.max(1, c.qty - 1)} : c))}>-</button>
                <span style={{ margin: '0 10px' }}>{item.qty}</span>
                <button onClick={() => setCart(cart.map(c => c.sku === item.sku ? {...c, qty: c.qty + 1} : c))}>+</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={sendOrder} style={{ width: '100%', padding: '15px', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}>שלח הזמנה</button>
      </div>
    </main>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
