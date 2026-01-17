'use client';
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useState } from 'react';
import Link from 'next/link';

export default function TrackPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchOrders = async () => {
    if (!phone) return alert("הכנס טלפון");
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), where("phone", "==", phone));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { alert("שגיאה בחיפוש"); }
    finally { setLoading(false); }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54' }}>מעקב הזמנות</h2>
        
        <input type="tel" placeholder="הכנס טלפון למעקב" style={iS} onChange={e => setPhone(e.target.value)} />
        <button onClick={searchOrders} disabled={loading} style={btnS}>
          {loading ? "מחפש..." : "בדוק סטטוס"}
        </button>

        <div style={{ marginTop: '20px' }}>
          {orders.map((o, i) => (
            <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>סטטוס: {o.status || 'בטיפול'}</strong>
                <span style={{ fontSize: '12px', color: '#888' }}>{o.timestamp?.seconds ? new Date(o.timestamp.seconds * 1000).toLocaleDateString() : 'היום'}</span>
              </div>
              <div style={{ fontSize: '14px' }}>{o.items}</div>
            </div>
          ))}
          {orders.length === 0 && !loading && phone && <p style={{textAlign:'center', color:'#999'}}>לא נמצאו הזמנות</p>}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#075E54' }}>חזור לביצוע הזמנה</Link>
        </div>
      </div>
    </main>
  );
}

const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const btnS = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
