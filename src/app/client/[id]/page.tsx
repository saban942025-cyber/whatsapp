'use client';
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function ClientDashboard({ params }: { params: { id: string } }) {
  const [clientData, setClientData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // כאן נדמה שליפה של פרטי הלקוח לפי ה-ID מהלינק
    // במציאות: תשלוף מה-Firebase לפי ה-Params.id
    setClientData({
      id: params.id,
      name: "ישראל ישראלי",
      project: "מגדלי סבן, קומה 12",
      contact: "אבי מנהל עבודה",
      address: "הרצל 45, נתניה",
      profileImg: "https://via.placeholder.com/150/075E54/FFFFFF?text=S" // תמונת פרופיל מלינק
    });

    // מאזין חי (Real-time) להזמנות של הלקוח הספציפי
    const q = query(collection(db, "orders"), where("phone", "==", "0501234567")); // כאן תשים את הטלפון של הלקוח
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [params.id]);

  if (!clientData) return <div>טוען אפליקציה...</div>;

  return (
    <main dir="rtl" style={appContainer}>
      {/* Header - דמוי ווטסאפ */}
      <header style={headerStyle}>
        <img src={clientData.profileImg} style={profileImgStyle} alt="Saban" />
        <div style={{ marginRight: '15px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>ח.סבן - מחלקת הזמנות</div>
          <div style={{ fontSize: '12px', color: '#d1ffd1' }}>מחובר | מענה מהיר</div>
        </div>
      </header>

      {/* פרטי פרויקט - כרטיס זיהוי */}
      <section style={infoCard}>
        <div style={{ fontSize: '14px', color: '#666' }}>📍 פרויקט: **{clientData.project}**</div>
        <div style={{ fontSize: '14px', color: '#666' }}>👤 איש קשר: {clientData.contact}</div>
      </section>

      {/* דשבורד סטטוסים */}
      <div style={dashboardGrid}>
        <div style={statBox}>
          <div style={{ fontSize: '24px' }}>🚛</div>
          <div style={{ fontWeight: 'bold' }}>חומרים</div>
          <div style={{ fontSize: '12px' }}>{orders.filter(o => !o.items.includes("מכולה")).length} הזמנות</div>
        </div>
        <div style={{ ...statBox, borderRight: '1px solid #eee' }}>
          <div style={{ fontSize: '24px' }}>🗑️</div>
          <div style={{ fontWeight: 'bold' }}>מכולות</div>
          <div style={{ fontSize: '12px' }}>{orders.filter(o => o.items.includes("מכולה")).length} בשימוש</div>
        </div>
      </div>

      {/* רשימת הזמנות חיה */}
      <h4 style={{ padding: '0 20px', marginBottom: '10px' }}>מעקב פעילות:</h4>
      <div style={orderList}>
        {orders.map(o => (
          <div key={o.id} style={orderItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>{o.items}</span>
              <span style={statusBadge(o.status)}>{o.status}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
              {o.items.includes("מכולה") ? "⌛ שכירות: יום 4 מתוך 10" : "🚚 בדרך אליך"}
            </div>
          </div>
        ))}
      </div>

      {/* כפתור פעולה מהיר - דמוי ווטסאפ */}
      <button style={fabStyle} onClick={() => window.location.href = '/'}>
        <span style={{ fontSize: '24px' }}>+</span>
        <span style={{ marginRight: '10px' }}>הזמנה חדשה</span>
      </button>
    </main>
  );
}

// --- עיצובים (WhatsApp Style PWA) ---
const appContainer = { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '100px' };
const headerStyle = { background: '#075E54', color: '#fff', padding: '15px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', position: 'sticky' as 'sticky', top: 0, zIndex: 100 };
const profileImgStyle = { width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #fff' };
const infoCard = { background: '#fff', margin: '10px', padding: '15px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const dashboardGrid = { display: 'flex', background: '#fff', margin: '10px', borderRadius: '10px', overflow: 'hidden' };
const statBox = { flex: 1, padding: '15px', textAlign: 'center' as 'center' };
const orderList = { padding: '0 10px' };
const orderItem = { background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', borderRight: '5px solid #25D366' };
const fabStyle = { position: 'fixed' as 'fixed', bottom: '20px', left: '20px', right: '20px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '30px', padding: '15px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer' };

const statusBadge = (status: string) => ({
  backgroundColor: status === 'חדש' ? '#fff3cd' : '#d1ffd1',
  color: status === 'חדש' ? '#856404' : '#155724',
  padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' as 'bold'
});
