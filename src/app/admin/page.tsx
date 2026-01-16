'use client';
import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  // האזנה בזמן אמת להזמנות חדשות
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, []);

  // עדכון סטטוס הזמנה
  const updateStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
    alert(`סטטוס עודכן ל: ${newStatus}`);
  };

  return (
    <main style={{ padding: '20px', direction: 'rtl', fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <h1 style={{ color: '#075E54' }}>ניהול הזמנות - סבן 94</h1>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {orders.map(order => (
          <div key={order.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{order.customerName}</strong>
              <span style={{ fontSize: '12px', color: '#666' }}>{order.timestamp?.toDate().toLocaleString()}</span>
            </div>
            <p style={{ margin: '5px 0' }}>📍 {order.address}</p>
            <p style={{ margin: '5px 0' }}>📦 {order.orderType}: {order.orderDetails}</p>
            <p style={{ fontWeight: 'bold', color: '#075E54' }}>סטטוס נוכחי: {order.status || 'התקבלה'}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => updateStatus(order.id, "המשאית בדרך 🚛")} style={{ padding: '8px', backgroundColor: '#34b7f1', color: 'white', border: 'none', borderRadius: '4px' }}>בדרך</button>
              <button onClick={() => updateStatus(order.id, "סופק בהצלחה ✅")} style={{ padding: '8px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '4px' }}>סופק</button>
              <button onClick={() => updateStatus(order.id, "בוטל ❌")} style={{ padding: '8px', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '4px' }}>ביטול</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
