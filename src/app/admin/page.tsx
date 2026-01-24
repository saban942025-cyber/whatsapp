'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

export default function RamiDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [formData, setFormData] = useState({ client: '', items: '', address: '', phone: '' });

  useEffect(() => {
    const q = query(collection(db, "saban_tasks"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const createAndSend = async () => {
    const docRef = await addDoc(collection(db, "saban_tasks"), {
      ...formData,
      status: "🆕 ממתין",
      timestamp: new Date()
    });
    
    const taskLink = `https://whatasap.vercel.app/driver/${docRef.id}`;
    const waUrl = `https://wa.me/${formData.phone}?text=${encodeURIComponent("חכמת, משימה חדשה: " + taskLink)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div dir="rtl" style={{ padding: '30px', background: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <h1>ניהול משימות ח. סבן</h1>
      </header>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', marginTop: '20px' }}>
        <h3>יצירת משימה חדשה</h3>
        <input placeholder="לקוח (למשל: אוסטושינסקי)" style={s.input} onChange={e => setFormData({...formData, client: e.target.value})} />
        <input placeholder="פריטים (50 מלט, 2 בלה)" style={s.input} onChange={e => setFormData({...formData, items: e.target.value})} />
        <input placeholder="טלפון נהג (972...)" style={s.input} onChange={e => setFormData({...formData, phone: e.target.value})} />
        <button onClick={createAndSend} style={s.btn}>צור ושגר לחכמת 🚀</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        {tasks.map(t => (
          <div key={t.id} style={s.card}>
            <strong>{t.client}</strong> | {t.status}
            <br/><small>{t.items}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

const s: any = {
  input: { display: 'block', width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' },
  btn: { width: '100%', padding: '12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  card: { background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', borderRight: '5px solid #075E54' }
};
