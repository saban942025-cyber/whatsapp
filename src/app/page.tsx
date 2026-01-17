'use client';
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    name: '', address: '', phone: '', 
    driverNotes: '', requestedDate: '', requestedTime: '',
    deliveryType: 'פריקה ידנית' 
  });
  const [loading, setLoading] = useState(false);
  const [pendingContainer, setPendingContainer] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const addToCart = (product: any, action?: string) => {
    const finalName = action ? `${product.name} (${action})` : product.name;
    const itemToAdd = { 
      ...product, 
      name: finalName, 
      deliveryDetails: `${form.deliveryType} | שעה: ${form.requestedTime}`,
      qty: 1 
    };
    setCart([...cart, itemToAdd]);
    setPendingContainer(null);
    setSearch('');
  };

  const sendOrder = async () => {
    if (!form.phone || cart.length === 0) return alert("נא למלא טלפון ולבחור מוצרים");
    setLoading(true);

    const payload = {
      customer: form.name,
      phone: form.phone,
      address: form.address,
      details: `הובלה: ${form.deliveryType} | שעה: ${form.requestedTime} | הערות: ${form.driverNotes}`,
      date: form.requestedDate,
      items: cart.map(i => i.name).join(", "),
      status: "חדש",
      timestamp: new Date()
    };

    try {
      await fetch("https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await addDoc(collection(db, "orders"), payload);
      alert("ההזמנה נשלחה בהצלחה! ✅");
      setCart([]);
    } catch (err) { alert("שגיאה בשליחה"); }
    finally { setLoading(false); }
  };

  return (
    <main dir="rtl" style={mainStyle}>
      <div style={containerStyle}>
        
        {/* Header עם לוגו מהתיקייה שלך */}
        <div style={headerStyle}>
          <img src="/logo.png" alt="ח.סבן" style={{ height: '50px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={profilePicPlaceholder}>ח.ס</div>
             <span style={{ fontWeight: 'bold' }}>ח. סבן 94</span>
          </div>
        </div>

        <div style={welcomeMsg}>שלום! ברוכים הבאים למערכת ההזמנות. אנא מלאו פרטים וסוג הובלה:</div>

        {/* פרטי הזמנה */}
        <input type="text" placeholder="שם הלקוח" style={inputS} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון *" style={inputS} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת אספקה" style={inputS} onChange={e => setForm({...form, address: e.target.value})} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="date" title="תאריך" style={inputS} onChange={e => setForm({...form, requestedDate: e.target.value})} />
          <input type="time" title="שעה מועדפת" style={inputS} onChange={e => setForm({...form, requestedTime: e.target.value})} />
        </div>

        <label style={labelS}>סוג הובלה / פריקה:</label>
        <select style={inputS} value={form.deliveryType} onChange={e => setForm({...form, deliveryType: e.target.value})}>
          <option>פריקה ידנית</option>
          <option>פריקת מנוף 10 מטר</option>
          <option>פריקת מנוף 15 מטר</option>
          <option>אחר (ציין בהערות)</option>
        </select>

        <textarea placeholder="הערות לנהג (נא לציין כאן אם בחרת 'אחר' בסוג הובלה)" style={inputS} onChange={e => setForm({...form, driverNotes: e.target.value})} />

        {/* חיפוש מוצרים */}
        <div style={{ position: 'relative', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 חפש חומר או מכולה..." 
            style={{ ...inputS, borderColor: '#075E54', borderWidth: '2px' }} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search.length > 1 && (
            <div style={searchListS}>
              {allProducts.filter(p => p.name.includes(search)).map(p => (
                <div key={p.id} onClick={() => {
                  if (p.type === 'container' || p.name.includes('מכולה')) { setPendingContainer(p); setSearch(''); }
                  else { addToCart(p); }
                }} style={searchItemS}>
                  {p.name} {p.type === 'container' ? '🏗️' : '📦'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* בחירת פעולה למכולה - מעוצב מתחת לחיפוש */}
        {pendingContainer && (
          <div style={actionBoxS}>
            <p style={{ fontWeight: 'bold' }}>בחר פעולה עבור {pendingContainer.name}:</p>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => addToCart(pendingContainer, 'הצבה')} style={actionBtnS}>הצבה</button>
              <button onClick={() => addToCart(pendingContainer, 'החלפה')} style={actionBtnS}>החלפה</button>
              <button onClick={() => addToCart(pendingContainer, 'הוצאה')} style={actionBtnS}>הוצאה</button>
            </div>
          </div>
        )}

        {/* עגלת קניות */}
        <div style={cartS}>
          <p>🛒 <b>הזמנה נוכחית:</b></p>
          {cart.map((item, idx) => (
            <div key={idx} style={cartItemS}>
              <span>{item.name}</span>
              <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={delBtnS}>מחק</button>
            </div>
          ))}
        </div>

        <button onClick={sendOrder} disabled={loading} style={sendBtnS}>
          {loading ? "שולח..." : "שלח הזמנה לראמי וגליה"}
        </button>

      </div>
    </main>
  );
}

// עיצובים
const mainStyle = { backgroundColor: '#E5DDD5', minHeight: '100vh', padding: '10px', display: 'flex', justifyContent: 'center' };
const containerStyle = { maxWidth: '450px', width: '100%', backgroundColor: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #25D366', paddingBottom: '10px' };
const profilePicPlaceholder = { width: '40px', height: '40px', backgroundColor: '#075E54', borderRadius: '50%', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' };
const welcomeMsg = { backgroundColor: '#DCF8C6', padding: '10px', borderRadius: '10px', fontSize: '14px', marginBottom: '15px' };
const inputS = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' as 'border-box' };
const labelS = { fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' };
const searchListS = { position: 'absolute' as 'absolute', width: '100%', background: '#fff', zIndex: 100, border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const searchItemS = { padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer' };
const actionBoxS = { marginTop: '10px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '10px', border: '1px solid #075E54' };
const actionBtnS = { flex: 1, padding: '10px', backgroundColor: '#075E54', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' };
const cartS = { marginTop: '20px', padding: '10px', borderTop: '1px solid #eee' };
const cartItemS = { display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '5px', marginBottom: '5px' };
const delBtnS = { background: 'none', border: 'none', color: 'red', cursor: 'pointer' };
const sendBtnS = { width: '100%', padding: '15px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
