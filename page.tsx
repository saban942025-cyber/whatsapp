'use client';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useState } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
  measurementId: "G-9JNS1ZJLDX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Home() {
  const [formData, setFormData] = useState({ customerName: '', orderType: 'חומרי בניין', address: '', orderDetails: '' });

  const sendOrder = async () => {
    if (!formData.customerName || !formData.orderDetails) { alert("אחי, מלא שם ופרטים"); return; }
    try {
      const docRef = await addDoc(collection(db, "orders"), { ...formData, timestamp: new Date() });
      const msg = `*הזמנה חדשה - סבן 94* 🚛\n\n*לקוח:* ${formData.customerName}\n*סוג:* ${formData.orderType}\n*פירוט:* ${formData.orderDetails}\n*כתובת:* ${formData.address}\n\n*מספר מעקב:* ${docRef.id}`;
      window.open(`https://wa.me/972508860896?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (e) { alert("שגיאה בשמירה"); }
  };

  return (
    <main style={{ backgroundColor: '#E5DDD5', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#075E54', color: 'white', padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#FFD700', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold' }}>S94</div>
        <div><strong>סבן 94 - הזמנה חכמה</strong><br/><small>מחובר ל-Firebase</small></div>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '15px 0 15px 15px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          אהלן! כאן המערכת של <strong style={{color:'#075E54'}}>סבן 94</strong>. מלא את פרטי ההזמנה וזה ישלח ישר להראל בווטסאפ.
        </div>
      </div>
      <div style={{ background: '#f0f0f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'fixed', bottom: 0, width: '100%', boxSizing: 'border-box' }}>
        <input type="text" placeholder="שם הלקוח" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} onChange={(e)=>setFormData({...formData, customerName:e.target.value})} />
        <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} onChange={(e)=>setFormData({...formData, orderType:e.target.value})}>
          <option value="חומרי בניין">🏗️ חומרי בניין</option>
          <option value="הצבת מכולה">🗑️ הצבת מכולה</option>
          <option value="החלפת מכולה">🔄 החלפת מכולה</option>
        </select>
        <input type="text" placeholder="כתובת" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} onChange={(e)=>setFormData({...formData, address:e.target.value})} />
        <textarea placeholder="מה להביא לך?" rows={3} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} onChange={(e)=>setFormData({...formData, orderDetails:e.target.value})}></textarea>
        <button onClick={sendOrder} style={{ backgroundColor: '#25D366', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>שלח הזמנה לווטסאפ</button>
      </div>
    </main>
  );
}
