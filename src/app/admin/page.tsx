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

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      snapshot.docChanges().forEach(change => {
        if (change.type === "added" && !snapshot.metadata.hasPendingWrites) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => console.log("Sound blocked"));
        }
      });
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  return (
    <main dir="rtl" style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#075E54' }}>📦 מחלקת הזמנות - סבן 94</h1>
      <div style={{ display: 'grid', gap: '15px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{order.customerName}</strong>
              <span style={{ fontSize: '12px', color: '#666' }}>{order.status}</span>
            </div>
            <p><strong>פריטים:</strong> {order.items}</p>
            <p><strong>כתובת:</strong> {order.address}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => updateStatus(order.id, "בטיפול 🚛")} style={{ flex: 1, padding: '10px', background: '#34b7f1', color: 'white', border: 'none', borderRadius: '8px' }}>בטיפול</button>
              <button onClick={() => updateStatus(order.id, "סופק ✅")} style={{ flex: 1, padding: '10px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px' }}>סופק</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
