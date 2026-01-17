'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, initializeFirestore, memoryLocalCache } from "firebase/firestore";
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
const db = initializeFirestore(app, { localCache: memoryLocalCache() });

export default function OrderPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

  const sendOrder = async () => {
    if (!form.phone) return alert("חובה להזין טלפון");
    setLoading(true);
    setStatus("🔍 מתחיל אבחון חיבור...");

    const payload = {
      customer: form.name || "בדיקת מערכת",
      phone: form.phone,
      items: "טסט מלשינון",
      address: "בדיקה"
    };

    try {
      setStatus("📡 מנסה לדפוק בדלת של מיקרוסופט (POST)...");
      
      const response = await fetch(flowUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
        if (err.message.includes('Failed to fetch')) {
          throw new Error("❌ חסימת רשת! ה-Firewall או הדפדפן חוסמים את השליחה למיקרוסופט.");
        }
        throw err;
      });

      setStatus(`🔄 תגובת שרת: ${response.status}`);

      if (response.status === 202 || response.status === 200) {
        setStatus("✅ הצלחה! הזרימה הופעלה ב-365.");
        alert("הזמנה עברה בהצלחה!");
      } else {
        const errText = await response.text();
        setStatus(`⚠️ שרת הגיב עם שגיאה: ${response.status}`);
        console.error("Microsoft Error:", errText);
      }

    } catch (err: any) {
      setStatus(`🚨 כשל סופי: ${err.message}`);
      console.error("Full Error Info:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>סבן 94 - בדיקת חיבור</h2>
        
        <input type="text" placeholder="שם" style={iStyle} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={inputHighlight} onChange={e => setForm({...form, phone: e.target.value})} />
        
        <button 
          onClick={sendOrder} 
          disabled={loading} 
          style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "מריץ אבחון..." : "שלח הזמנת בדיקה ל-365"}
        </button>

        {status && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', fontSize: '14px', border: '1px solid #ccc' }}>
            <strong>סטטוס מלשינון:</strong>
            <p style={{ margin: '5px 0', color: status.includes('❌') || status.includes('🚨') ? 'red' : 'blue' }}>{status}</p>
          </div>
        )}
      </div>
    </main>
  );
}

const iStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const inputHighlight = { ...iStyle, border: '2px solid #075E54' };
