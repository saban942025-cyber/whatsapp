'use client';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from 'react';

// קונפיגורציה שכבר הגדרנו
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

export default function Home() {
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({ 
    customerName: '', 
    orderType: 'חומרי בניין', 
    address: '', 
    orderDetails: '' 
  });
  const [lastOrder, setLastOrder] = useState(null);

  // פונקציית "הזמנה מהירה" - שליפת נתונים לפי טלפון
  const identifyCustomer = async (inputPhone) => {
    if (inputPhone.length >= 10) {
      const q = query(
        collection(db, "orders"), 
        where("phone", "==", inputPhone),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setLastOrder({ id: querySnapshot.docs[0].id, ...data });
        setFormData({
          ...formData,
          customerName: data.customerName,
          address: data.address
        });
      }
    }
  };

  const sendOrder = async () => {
    try {
      const docRef = await addDoc(collection(db, "orders"), { 
        ...formData, 
        phone,
        status: "התקבלה", // סטטוס ראשוני
        timestamp: new Date() 
      });
      const msg = `*סבן 94 - הזמנה חדשה*\n\n*לקוח:* ${formData.customerName}\n*כתובת:* ${formData.address}\n*פירוט:* ${formData.orderDetails}\n\n*מספר מעקב:* ${docRef.id}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (e) { alert("שגיאה בשמירה"); }
  };

  return (
    <main style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#075E54', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: 0 }}>סבן 94</h1>
        <small>הזמנה מהירה וחכמה</small>
      </div>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* זיהוי לקוח */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
          <label>מספר טלפון לזיהוי:</label>
          <input 
            type="tel" 
            placeholder="05X-XXXXXXX"
            style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
            onChange={(e) => { setPhone(e.target.value); identifyCustomer(e.target.value); }}
          />
        </div>

        {/* טופס הזמנה */}
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px' }}>
          {lastOrder && <div style={{ color: '#075E54', fontSize: '14px', marginBottom: '10px' }}>✨ זוהית כלקוח חוזר! מילאנו לך את הפרטים.</div>}
          
          <input 
            type="text" placeholder="שם מלא" value={formData.customerName}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            onChange={(e)=>setFormData({...formData, customerName: e.target.value})}
          />
          
          <select 
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            onChange={(e)=>setFormData({...formData, orderType: e.target.value})}
          >
            <option value="חומרי בניין">🏗️ חומרי בניין</option>
            <option value="הצבת מכולה">🗑️ הצבת מכולה</option>
            <option value="החלפת מכולה">🔄 החלפת מכולה</option>
          </select>

          <input 
            type="text" placeholder="כתובת למשלוח" value={formData.address}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            onChange={(e)=>setFormData({...formData, address: e.target.value})}
          />

          <textarea 
            placeholder="פירוט ההזמנה..." rows={3}
            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            onChange={(e)=>setFormData({...formData, orderDetails: e.target.value})}
          ></textarea>

          <button 
            onClick={sendOrder}
            style={{ width: '100%', backgroundColor: '#25D366', color: 'white', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            שלח הזמנה וקבל מספר מעקב
          </button>
        </div>

        {/* סטטוס הזמנה אחרונה */}
        {lastOrder && (
          <div style={{ marginTop: '20px', background: '#e1f5fe', padding: '15px', borderRadius: '10px', border: '1px solid #b3e5fc' }}>
            <strong>סטטוס הזמנה אחרונה (#...{lastOrder.id.slice(-4)}):</strong>
            <div style={{ fontSize: '18px', color: '#01579b', marginTop: '5px' }}>
              {lastOrder.status || 'בטיפול'} 🚛
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
