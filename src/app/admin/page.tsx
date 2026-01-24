'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";

export default function RamiDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [formData, setFormData] = useState({ client: '', items: '', address: '', phone: '972' });
  const [isAdding, setIsAdding] = useState(false);

  // 1. האזנה לנתונים בזמן אמת
  useEffect(() => {
    const q = query(collection(db, "saban_tasks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. יצירת משימה ושליחת לינק לוואטסאפ של חכמת
  const createAndSend = async () => {
    if (!formData.client || !formData.items) return alert("מלא פרטי לקוח ומוצרים");

    const docRef = await addDoc(collection(db, "saban_tasks"), {
      ...formData,
      status: "🆕 ממתין",
      timestamp: new Date(),
      waitDuration: 0
    });
    
    const taskLink = `https://whatasap.vercel.app/driver/${docRef.id}`;
    const waUrl = `https://api.whatsapp.com/send/?phone=${formData.phone}&text=${encodeURIComponent("חכמת אחי, משימה חדשה עבורך. כנס לאישור וחתימה: " + taskLink)}`;
    
    window.open(waUrl, '_blank');
    setIsAdding(false);
    setFormData({ client: '', items: '', address: '', phone: '972' });
  };

  // 3. ייצוא נתונים לחיוב (Excel/CSV) ל-365
  const exportToExcel = () => {
    const billableTasks = tasks.filter(t => t.status === 'מאושר לחיוב' || t.status === 'נסרק');
    if (billableTasks.length === 0) return alert("אין תעודות מוכנות לייצוא");

    const headers = "תאריך,לקוח,מוצרים,כתובת,שעת סיום,סטטוס\n";
    const rows = billableTasks.map(t => {
      const date = t.timestamp?.seconds ? new Date(t.timestamp.seconds * 1000).toLocaleDateString() : '';
      return `${date},${t.client},"${t.items}",${t.address},${t.finishTime || ''},${t.status}`;
    }).join("\n");

    const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Saban_Billing_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const approveTask = async (id: string) => {
    await updateDoc(doc(db, "saban_tasks", id), { status: 'מאושר לחיוב' });
  };

  return (
    <div dir="rtl" style={s.container}>
      <header style={s.header}>
        <h1 style={{margin:0}}>SABAN <span style={{color:'#2ecc71'}}>365</span> CONTROL</h1>
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={exportToExcel} style={s.exportBtn}>📊 ייצוא לחיוב (Excel)</button>
          <button onClick={() => setIsAdding(!isAdding)} style={s.addBtn}>
            {isAdding ? '✖ סגור' : '➕ משימה חדשה'}
          </button>
        </div>
      </header>

      {isAdding && (
        <div style={s.formCard}>
          <input placeholder="שם לקוח (למשל: אוסטושינסקי)" style={s.input} value={formData.client} onChange={e=>setFormData({...formData, client:e.target.value})} />
          <input placeholder="מוצרים (למשל: 40 מלט)" style={s.input} value={formData.items} onChange={e=>setFormData({...formData, items:e.target.value})} />
          <input placeholder="כתובת אספקה" style={s.input} value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} />
          <input placeholder="טלפון נהג (972...)" style={s.input} value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />
          <button onClick={createAndSend} style={s.saveBtn}>צור ושגר לחכמת 🚀</button>
        </div>
      )}

      <div style={s.grid}>
        {['🆕 ממתין', 'נסרק - ממתין לראמי', 'מאושר לחיוב'].map(status => (
          <div key={status} style={s.column}>
            <h3 style={s.columnTitle}>{status}</h3>
            {tasks.filter(t => t.status === status || (status === '🆕 ממתין' && !t.status)).map(task => (
              <div key={task.id} style={s.card}>
                <div style={{fontWeight:'bold'}}>{task.client}</div>
                <div style={{fontSize:'13px', color:'#666'}}>{task.items}</div>
                <div style={{fontSize:'11px', marginTop:'5px'}}>📍 {task.address}</div>
                
                {task.status === 'נסרק - ממתין לראמי' && (
                  <div style={{marginTop:'10px', display:'flex', gap:'5px'}}>
                    <button onClick={() => window.open(task.signature)} style={s.smallBtn}>צפה בחתימה</button>
                    <button onClick={() => approveTask(task.id)} style={s.smallBtnSuccess}>אשר לחיוב</button>
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
  container: { padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  addBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  exportBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  formCard: { background: '#fff', padding: '20px', borderRadius: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd' },
  saveBtn: { gridColumn: 'span 2', background: '#075E54', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  column: { background: '#dfe3e6', padding: '15px', borderRadius: '12px', minHeight: '60vh' },
  columnTitle: { fontSize: '14px', textAlign: 'center', marginBottom: '15px', color: '#555' },
  card: { background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  smallBtn: { flex: 1, padding: '5px', fontSize: '11px', cursor: 'pointer' },
  smallBtnSuccess: { flex: 1, padding: '5px', fontSize: '11px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }
};
