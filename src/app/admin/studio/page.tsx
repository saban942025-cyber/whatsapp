'use client';
import { db } from "../../../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function AdminStudio() {
  const [activeTab, setActiveTab] = useState<'products' | 'team' | 'orders' | 'internal'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Forms states
  const [formProduct, setFormProduct] = useState({ name: '', type: 'product', imageUrl: '' });
  const [formMember, setFormMember] = useState({ name: '', phone: '', project: '', address: '', profileImg: '' });
  const [internalMsg, setInternalMsg] = useState({ to: 'נתנאל הקניין', content: '', urgent: false });

  const fetchData = async () => {
    const pSnap = await getDocs(collection(db, "products"));
    setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const tSnap = await getDocs(collection(db, "team"));
    setTeam(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const oSnap = await getDocs(query(collection(db, "orders"), orderBy("timestamp", "desc"), limit(10)));
    setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchData(); }, []);

  const sendMagicLink = (member: any) => {
    const magicLink = `https://whatsapp-three-beryl.vercel.app/client/${member.id}`;
    const message = `שלום ${member.name}, ברוך הבא למערכת VIP של ח.סבן! 🏗️

הנה אפליקציית הניהול האישית שלך לפרויקט ${member.project}:
🔗 ${magicLink}

🚨 הנחיות חשובות:
1. לחץ על הלינק.
2. במכשירך, בחר "הוסף למסך הבית" (Add to Home Screen).
3. אשר קבלת התראות (Push) כדי לקבל עדכוני אספקה ומכולות בזמן אמת!

מעכשיו, הכל במקום אחד - מקצועי, מהיר וזמין.`;
    
    window.open(`https://wa.me/972${member.phone.substring(1)}?text=${encodeURIComponent(message)}`);
  };

  return (
    <main dir="rtl" style={containerStyle}>
      {/* Header המקצועי של סבן */}
      <header style={headerStyle}>
        <h1 style={{ margin: 0 }}>SABAN 94 STUDIO</h1>
        <p>מערכת שליטה מאוחדת: לקוחות, מלאי וצוות</p>
        <div style={tabBar}>
          <button onClick={() => setActiveTab('products')} style={tabBtn(activeTab === 'products')}>📦 קטלוג</button>
          <button onClick={() => setActiveTab('team')} style={tabBtn(activeTab === 'team')}>👥 לקוחות/צוות</button>
          <button onClick={() => setActiveTab('orders')} style={tabBtn(activeTab === 'orders')}>📑 הזמנות</button>
          <button onClick={() => setActiveTab('internal')} style={tabBtn(activeTab === 'internal')}>💬 קשר סמוי</button>
        </div>
      </header>

      {/* לשונית קטלוג - הוספת מוצרים עם תמונה */}
      {activeTab === 'products' && (
        <section style={cardStyle}>
          <h3 style={titleStyle}>הוספת מוצר לקטלוג האפליקציה</h3>
          <input placeholder="שם המוצר/מכולה" style={iS} onChange={e => setFormProduct({...formProduct, name: e.target.value})} />
          <input placeholder="לינק לתמונה מהאינטרנט" style={iS} onChange={e => setFormProduct({...formProduct, imageUrl: e.target.value})} />
          <select style={iS} onChange={e => setFormProduct({...formProduct, type: e.target.value})}>
            <option value="product">חומר בניין</option>
            <option value="container">מכולה (8 קוב)</option>
          </select>
          <button style={saveBtn} onClick={async () => { await addDoc(collection(db, "products"), formProduct); fetchData(); alert("הקטלוג עודכן!"); }}>שמור מוצר</button>
          
          <div style={gridStyle}>
            {products.map(p => (
              <div key={p.id} style={pCard}>
                <img src={p.imageUrl || 'https://via.placeholder.com/100'} style={pImg} />
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                <button onClick={async () => { await deleteDoc(doc(db, "products", p.id)); fetchData(); }} style={delBtn}>מחק</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* לשונית לקוחות - לינק קסם וניהול PWA */}
      {activeTab === 'team' && (
        <section style={cardStyle}>
          <h3 style={titleStyle}>יצירת לקוח/איש צוות ולינק קסם</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input placeholder="שם הלקוח" style={iS} onChange={e => setFormMember({...formMember, name: e.target.value})} />
            <input placeholder="טלפון (ללא 0 בתחילה)" style={iS} onChange={e => setFormMember({...formMember, phone: e.target.value})} />
            <input placeholder="שם הפרויקט" style={iS} onChange={e => setFormMember({...formMember, project: e.target.value})} />
            <input placeholder="לינק לתמונת פרופיל" style={iS} onChange={e => setFormMember({...formMember, profileImg: e.target.value})} />
          </div>
          <button style={magicBtn} onClick={async () => { await addDoc(collection(db, "team"), formMember); fetchData(); alert("לקוח נוצר!"); }}>צור לקוח במערכת</button>

          <div style={{ marginTop: '20px' }}>
            {team.map(m => (
              <div key={m.id} style={memberRow}>
                <img src={m.profileImg || 'https://via.placeholder.com/50'} style={profileCircle} />
                <div style={{ flex: 1, marginRight: '15px' }}>
                  <strong>{m.name}</strong> - {m.project}
                  <div style={{ fontSize: '12px', color: '#666' }}>{m.phone}</div>
                </div>
                <button onClick={() => sendMagicLink(m)} style={waBtn}>שלח לינק קסם 💬</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* לשונית קשר סמוי - תיאום מלאי לוגיסטי */}
      {activeTab === 'internal' && (
        <section style={cardStyle}>
          <h3 style={titleStyle}>תקשורת פנימית (סמוי מהלקוח)</h3>
          <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <strong>💡 תרחיש מקצועי:</strong> הלקוח ביקש מוצר שאין במלאי? ראמי מעדכן את נתנאל כאן, ומבטיח ללקוח אספקה מחר.
          </div>
          <textarea placeholder="הודעה לצוות (למשל: נתנאל תזמין טיט דחוף להזמנה של כהן...)" style={{ ...iS, height: '100px' }} onChange={e => setInternalMsg({...internalMsg, content: e.target.value})} />
          <button style={internalBtn} onClick={() => alert("הודעה נשלחה לצוות!")}>שלח הודעה לנתנאל/ראמי</button>
        </section>
      )}
    </main>
  );
}

// --- Styles ---
const containerStyle = { background: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' };
const headerStyle = { background: '#075E54', color: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' as 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const tabBar = { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' };
const tabBtn = (active: boolean) => ({ padding: '10px 20px', borderRadius: '30px', border: 'none', background: active ? '#25D366' : '#054d44', color: '#fff', cursor: 'pointer', fontWeight: 'bold' });
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '20px', marginTop: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const titleStyle = { color: '#075E54', borderBottom: '2px solid #25D366', paddingBottom: '10px' };
const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const saveBtn = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const magicBtn = { width: '100%', padding: '15px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginTop: '20px' };
const pCard = { textAlign: 'center' as 'center', border: '1px solid #eee', padding: '10px', borderRadius: '15px' };
const pImg = { width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' as 'cover' };
const delBtn = { color: 'red', border: 'none', background: 'none', fontSize: '12px', cursor: 'pointer' };
const memberRow = { display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' };
const profileCircle = { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #25D366' };
const waBtn = { background: '#25D366', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const internalBtn = { width: '100%', padding: '15px', background: '#fb8c00', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' };
