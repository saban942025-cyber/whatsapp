'use client';
import { db } from "../../firebase"
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function AdminStudio() {
  const [activeTab, setActiveTab] = useState<'products' | 'team' | 'internal'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  
  const [formProduct, setFormProduct] = useState({ name: '', type: 'product', imageUrl: '' });
  const [formMember, setFormMember] = useState({ name: '', phone: '', project: '', address: '', profileImg: '' });

  const fetchData = async () => {
    try {
      const pSnap = await getDocs(collection(db, "products"));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const tSnap = await getDocs(collection(db, "team"));
      setTeam(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const sendMagicLink = (member: any) => {
    const magicLink = `https://whatsapp-three-beryl.vercel.app/client/${member.id}`;
    const message = `שלום ${member.name}, ברוך הבא למערכת VIP של ח.סבן! 🏗️%0A%0Aהנה אפליקציית הניהול האישית שלך לפרויקט ${member.project}:%0A🔗 ${magicLink}%0A%0A🚨 הנחיות חשובות:%0A1. לחץ על הלינק.%0A2. במכשירך, בחר "הוסף למסך הבית" (Add to Home Screen).%0A3. אשר קבלת התראות (Push) כדי לקבל עדכוני אספקה ומכולות בזמן אמת!%0A%0Aמעכשיו, הכל במקום אחד - מקצועי, מהיר וזמין.`;
    window.open(`https://wa.me/972${member.phone.substring(1)}?text=${message}`);
  };

  return (
    <main dir="rtl" style={{ background: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ background: '#075E54', color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0 }}>SABAN 94 - STUDIO</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
          <button onClick={() => setActiveTab('products')} style={tabBtn(activeTab === 'products')}>📦 קטלוג</button>
          <button onClick={() => setActiveTab('team')} style={tabBtn(activeTab === 'team')}>👥 לקוחות וצוות</button>
          <button onClick={() => setActiveTab('internal')} style={tabBtn(activeTab === 'internal')}>💬 קשר סמוי</button>
        </div>
      </header>

      {activeTab === 'products' && (
        <section style={cardStyle}>
          <h3 style={titleStyle}>הוספת מוצר/מכולה לקטלוג</h3>
          <input placeholder="שם המוצר" style={iS} value={formProduct.name} onChange={e => setFormProduct({...formProduct, name: e.target.value})} />
          <input placeholder="לינק לתמונת מוצר" style={iS} value={formProduct.imageUrl} onChange={e => setFormProduct({...formProduct, imageUrl: e.target.value})} />
          <select style={iS} value={formProduct.type} onChange={e => setFormProduct({...formProduct, type: e.target.value})}>
            <option value="product">חומר בניין</option>
            <option value="container">מכולה 8 קוב</option>
          </select>
          <button style={saveBtn} onClick={async () => { await addDoc(collection(db, "products"), formProduct); setFormProduct({name:'', type:'product', imageUrl:''}); fetchData(); }}>שמור מוצר</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {products.map(p => (
              <div key={p.id} style={pCard}>
                <img src={p.imageUrl || 'https://via.placeholder.com/80'} style={{ width:'100%', height:'80px', objectFit:'cover', borderRadius:'8px' }} />
                <div style={{ fontWeight:'bold', fontSize:'13px', marginTop:'5px' }}>{p.name}</div>
                <button onClick={async () => { await deleteDoc(doc(db, "products", p.id)); fetchData(); }} style={{ border:'none', color:'red', background:'none', cursor:'pointer', fontSize:'11px' }}>מחק</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'team' && (
        <section style={cardStyle}>
          <h3 style={titleStyle}>יצירת לקוח/איש צוות (לינק קסם)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input placeholder="שם הלקוח" style={iS} onChange={e => setFormMember({...formMember, name: e.target.value})} />
            <input placeholder="טלפון (למשל 0501234567)" style={iS} onChange={e => setFormMember({...formMember, phone: e.target.value})} />
            <input placeholder="שם פרויקט" style={iS} onChange={e => setFormMember({...formMember, project: e.target.value})} />
            <input placeholder="לינק לתמונת פרופיל" style={iS} onChange={e => setFormMember({...formMember, profileImg: e.target.value})} />
          </div>
          <button style={magicBtn} onClick={async () => { await addDoc(collection(db, "team"), formMember); fetchData(); alert("לקוח נוסף!"); }}>צור לקוח במערכת</button>
          <div style={{ marginTop: '20px' }}>
            {team.map(m => (
              <div key={m.id} style={memberRow}>
                <img src={m.profileImg || 'https://via.placeholder.com/50'} style={{ width:'50px', height:'50px', borderRadius:'50%', border:'2px solid #25D366' }} />
                <div style={{ flex: 1, marginRight: '15px' }}>
                  <strong>{m.name}</strong><br/><small>{m.project}</small>
                </div>
                <button onClick={() => sendMagicLink(m)} style={waBtn}>שלח לינק קסם 💬</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'internal' && (
        <section style={cardStyle}>
          <h3 style={titleStyle}>קשר סמוי (ראמי - נתנאל - גליה)</h3>
          <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
            💡 השתמשו בערוץ זה לתיאום מלאי והזמנות חסרות מבלי שהלקוח יראה.
          </div>
          <textarea placeholder="הודעה דחופה לצוות..." style={{ ...iS, height:'120px' }}></textarea>
          <button style={{ ...saveBtn, background: '#fb8c00' }}>שלח הודעה פנימית</button>
        </section>
      )}
    </main>
  );
}

// Styles
const tabBtn = (active: boolean) => ({ padding: '10px 18px', borderRadius: '25px', border: 'none', background: active ? '#25D366' : '#054d44', color: '#fff', cursor: 'pointer', fontWeight: 'bold' as 'bold' });
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '15px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const titleStyle = { color: '#075E54', borderBottom: '2px solid #25D366', paddingBottom: '8px', marginBottom: '15px' };
const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const saveBtn = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' as 'bold', cursor: 'pointer' };
const magicBtn = { width: '100%', padding: '15px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' as 'bold', cursor: 'pointer' };
const pCard = { textAlign: 'center' as 'center', border: '1px solid #eee', padding: '10px', borderRadius: '12px' };
const memberRow = { display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #eee' };
const waBtn = { background: '#25D366', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' as 'bold' };
