'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
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

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (typeof window !== 'undefined') {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added" && !snapshot.metadata.hasPendingWrites) {
            new Audio('/notification.mp3').play().catch(() => null);
          }
        });
      }
      setOrders(docs);
    });
    return () => unsub();
  }, []);

  const setStatus = async (id: string, s: string) => {
    await updateDoc(doc(db, "orders", id), { status: s });
  };

  return (
    <main dir="rtl" style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#075E54', borderBottom: '3px solid #FFD700', display: 'inline-block' }}>מחלקת הזמנות - סבן 94</h1>
      
      <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ background: 'white', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '18px' }}>{order.customerName || 'לקוח'}</strong>
                <div style={{ color: '#666' }}>📞 {order.phone}</div>
              </div>
              <span style={{ background: order.status === 'חדש' ? '#ffebee' : '#e8f5e9', color: order.status === 'חדש' ? '#c62828' : '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                {order.status}
              </span>
            </div>

            <div style={{ margin: '15px 0', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
              <strong>📦 פריטים:</strong> {typeof order.items === 'string' ? order.items : 'נא לבדוק בווטסאפ'}
            </div>

            <div style={{ fontSize: '14px', marginBottom: '15px' }}>📍 <strong>כתובת:</strong> {order.address}</div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStatus(order.id, "בטיפול 🚛")} style={{ ...btn, background: '#007bff' }}>בטיפול</button>
              <button onClick={() => setStatus(order.id, "סופק ✅")} style={{ ...btn, background: '#28a745' }}>סופק</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const btn = { flex: 1, padding: '10px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as 'bold' };
