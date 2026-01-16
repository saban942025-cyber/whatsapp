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

export default function Admin() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (typeof window !== 'undefined') {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !snapshot.metadata.hasPendingWrites) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => console.log("Sound blocked - click anywhere to enable"));
          }
        });
      }
      setOrders(data);
    });
    return () => unsubscribe();
  }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
    } catch (e) { alert("שגיאה בעדכון"); }
  };

  // פונקציית עזר להצגת פריטים בצורה בטוחה
  const renderItems = (items: any) => {
    if (typeof items === 'string') return items;
    if (Array.isArray(items)) return items.join(", ");
    if (typeof items === 'object' && items !== null) return JSON.stringify(items);
    return "אין פירוט";
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#075E54' }}>ניהול הזמנות - סבן 94</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{order.customerName || 'לקוח'} | {order.phone}</strong>
              <span style={{ fontSize: '12px', background: '#eee', padding: '2px 8px', borderRadius: '10px' }}>{order.status}</span>
            </div>
            {/* כאן התיקון הקריטי למניעת שגיאה 31 */}
            <p style={{ margin: '10px 0' }}>📦 פריטים: <span style={{ color: '#075E54', fontWeight: 'bold' }}>{renderItems(order.items)}</span></p>
            <p style={{ fontSize: '14px' }}>📍 כתובת: {order.address}</p>
            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
              <button onClick={() => changeStatus(order.id, "בטיפול 🚛")} style={{ flex: 1, padding: '10px', background: '#34b7f1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>בטיפול</button>
              <button onClick={() => changeStatus(order.id, "סופק ✅")} style={{ flex: 1, padding: '10px', background: '#25D366', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>סופק</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
