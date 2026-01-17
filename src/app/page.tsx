'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore, memoryLocalCache } from "firebase/firestore";
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
  const [status, setStatus] = useState<string>('ממתין לפעולה');
  const [loading, setLoading] = useState(false);

  const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

  const testFlow = async () => {
    setLoading(true);
    setStatus("🚀 השליחה התחילה...");
    
    try {
      console.log("מנסה לשלוח לכתובת:", flowUrl);
      
      const response = await fetch(flowUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: "בדיקת מערכת סבן",
          phone: "0500000000",
          items: "בדיקה טכנית",
          address: "כתובת בדיקה"
        })
      });

      console.log("Response received:", response);
      setStatus(`תגובת שרת: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        alert("הצלחה! ה-Flow הופעל.");
      } else {
        const text = await response.text();
        console.error("Server Error Detail:", text);
        setStatus(`שגיאת שרת: ${response.status}. פרטים בקונסולה.`);
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setStatus(`🚨 כשל טכני: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', border: '2px solid #075E54', padding: '20px', borderRadius: '15px' }}>
        <h2>בדיקת זרימה ל-365</h2>
        <p>גרסת קוד: 1.0.4 (עדכון אחרון)</p>
        
        <button 
          onClick={testFlow} 
          disabled={loading}
          style={{ width: '100%', padding: '15px', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "שולח..." : "לחץ כאן לבדיקת חיבור"}
        </button>

        <div style={{ marginTop: '20px', padding: '10px', background: '#eee', borderRadius: '5px' }}>
          <strong>סטטוס נוכחי:</strong>
          <p>{status}</p>
        </div>
      </div>
    </main>
  );
}
