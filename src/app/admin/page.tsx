'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";

export default function RamiDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [formData, setFormData] = useState({ client: '', items: '', address: '', phone: '972' });
  const [isAdding, setIsAdding] = useState(false);

  // 1. האזנה ל-Collection הנכון (tasks)
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. יצירת משימה ושליחת לינק תקין (client)
  const createAndSend = async () => {
    if (!formData.client || !formData.items) return alert("מלא פרטי לקוח ומוצרים");

    const docRef = await addDoc(collection(db, "tasks"), {
      ...formData,
      status: "🆕 ממתין",
      timestamp: new Date()
    });
    
    // התיקון: שימוש ב-client במקום driver
    const taskLink = `https://whatasap.vercel.app/client/${docRef.id}`;
    const waUrl = `https://api.whatsapp.com/send/?phone=${formData.phone}&text=${encodeURIComponent("חכמת אחי, משימה חדשה. כנס לאישור וחתימה: " + taskLink)}`;
    
    window.open(waUrl, '_blank');
    setIsAdding(false);
    setFormData({ client: '', items: '', address: '', phone: '972' });
  };

  const approveTask = async (id: string) => {
    await updateDoc(doc(db, "tasks", id), { status: 'מאושר לחיוב' });
  };

  return (
    <div dir="rtl" style={s.container}>
      <header style={s.header}>
        <h1 style={{margin:0}}>ח. סבן <span style={{fontSize:'16px'}}>| ניהול משימות 365</span></h1>
        <button onClick={() => setIsAdding(!isAdding)} style={s.addBtn}>
          {isAdding ? '✖ סגור' : '➕ משימה חדשה'}
        </button>
      </header>

      {isAdding && (
        <div style={s.formCard}>
          <input placeholder="לקוח (למשל: ד.ניב/בית ברל)" style={s.input} value={formData.client} onChange={e=>setFormData({...formData, client:e.target.value})} />
          <input placeholder="מוצרים (למשל: 20 מלט, 10 סומסום)" style={s.input} value={formData.items} onChange={e=>setFormData({...formData, items:e.target.value})} />
          <input placeholder="כתובת (למשל: ספריה, כפר סבא)" style={s.input} value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} />
          <input placeholder="טלפון נהג (972...)" style={s.input} value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
          <button onClick={createAndSend} style={s.saveBtn}>שלח לחכמת לוואטסאפ 🚀</button>
        </div>
      )}

      <div style={s.grid}>
        {['🆕 ממתין', 'נסרק', 'מאושר לחיוב'].map(status => (
          <div key={status} style={s.column}>
            <h3 style={s.columnTitle}>{status}</h3>
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} style={s.card}>
                <div style={{fontWeight:'bold'}}>{task.client}</div>
                <div style={{fontSize:'12px'}}>{task.items}</div>
                
                {task.status === 'נסרק' && (
                  <div style={{marginTop:'10px'}}>
                    <button onClick={() => window.open(task.signature)} style={s.viewBtn}>👁️ צפה בתעודה חתומה</button>
                    <button onClick={() => approveTask(task.id)} style={s.approveBtn}>✅ אשר לחיוב</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const s: any = {
  container: { padding: '20px', background: '#f4f7f6', minHeight: '100vh' },
  header: { background: '#075E54', color: '#fff', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
  formCard: { background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd' },
  saveBtn: { gridColumn: 'span 2', background: '#075E54', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' },
  column: { background: '#e2e8f0', padding: '10px', borderRadius: '10px', minHeight: '400px' },
  columnTitle: { textAlign: 'center', fontSize: '14px', color: '#4a5568' },
  card: { background: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  viewBtn: { width: '100%', padding: '5px', fontSize: '12px', marginBottom: '5px', cursor: 'pointer' },
  approveBtn: { width: '100%', padding: '5px', fontSize: '12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }
};
