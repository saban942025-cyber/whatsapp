'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";

// --- רכיב כרטיס משימה חכם (Task Card) ---
const TaskCard = ({ task, onApprove }: { task: any, onApprove: Function }) => {
  const isAnomaly = task.waitDuration > 30; // חוק ה-30 דקות של רמי
  
  return (
    <div style={s.card(task.status)}>
      <div style={s.cardHeader}>
        <span style={s.clientName}>📍 {task.client}</span>
        <span style={s.statusBadge(task.status)}>{task.status}</span>
      </div>
      
      <div style={s.cardBody}>
        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{task.items}</div>
        <div style={s.metaData}>
          <span>🚚 נהג: {task.driver}</span>
          <span>⏱️ זמן בשטח: {task.waitDuration || 0} דק'</span>
        </div>
        
        {isAnomaly && (
          <div style={s.anomalyAlert}>
            ⚠️ חריגת המתנה: ₪{((task.waitDuration - 30) * 7.5).toFixed(0)}
          </div>
        )}
      </div>

      <div style={s.cardFooter}>
        {task.status === 'נסרק' && (
          <button onClick={() => onApprove(task.id)} style={s.approveBtn}>
            אשר לחיוב 365 ✅
          </button>
        )}
        <button style={s.viewDocBtn} onClick={() => window.open(task.pdfUrl)}>
          תעודה סרוקה 📄
        </button>
      </div>
    </div>
  );
};

export default function RamiDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ active: 0, pending: 0, loss: 0 });

  // האזנה לכל המשימות ב-Firebase (מה שגליה וראמי מעדכנים)
  useEffect(() => {
    const q = query(collection(db, "saban_tasks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(data);
      
      // חישוב סטטיסטיקה מהירה לדשבורד
      const active = data.filter(t => t.status === 'בדרך' || t.status === 'בפריקה').length;
      const pending = data.filter(t => t.status === 'נסרק').length;
      const loss = data.reduce((acc, t) => acc + (t.waitDuration > 30 ? (t.waitDuration - 30) * 7.5 : 0), 0);
      setStats({ active, pending, loss });
    });
    return () => unsubscribe();
  }, []);

  const approveToBilling = async (id: string) => {
    await updateDoc(doc(db, "saban_tasks", id), { 
      status: 'מאושר לחיוב',
      approvedAt: new Date()
    });
    alert("המשימה ננעלה ועברה לחיוב ב-365");
  };

  return (
    <div dir="rtl" style={s.container}>
      {/* Top Banner */}
      <header style={s.header}>
        <div>
          <h1 style={s.title}>ח. סבן | לוח בקרה ניהולי</h1>
          <p style={{margin:0, opacity:0.8}}>מבט על: איתורן vs תעודות משלוח</p>
        </div>
        <div style={s.statsHeader}>
          <div style={s.statBox}>
            <small>הפסד המתנות</small>
            <div style={{color:'#ff4d4d', fontWeight:'bold'}}>₪{stats.loss.toFixed(0)}</div>
          </div>
          <div style={s.statBox}>
            <small>משימות פעילות</small>
            <div>{stats.active}</div>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <div style={s.boardGrid}>
        {/* עמודה 1: משימות בשטח (בדרך/פריקה) */}
        <section style={s.column}>
          <h3 style={s.columnTitle}>🚚 עבודה בשטח (Live)</h3>
          {tasks.filter(t => t.status === 'בדרך' || t.status === 'בפריקה').map(t => (
            <TaskCard key={t.id} task={t} onApprove={approveToBilling} />
          ))}
        </section>

        {/* עמודה 2: המתינה לבדיקה (מה שגליה סרקה) */}
        <section style={s.column}>
          <h3 style={s.columnTitle}>📄 נסרק - ממתין לאישור ראמי</h3>
          {tasks.filter(t => t.status === 'נסרק').map(t => (
            <TaskCard key={t.id} task={t} onApprove={approveToBilling} />
          ))}
        </section>

        {/* עמודה 3: היסטוריה וחיוב */}
        <section style={s.column}>
          <h3 style={s.columnTitle}>✅ מאושר לחיוב / סגור</h3>
          {tasks.filter(t => t.status === 'מאושר לחיוב').slice(0, 5).map(t => (
            <TaskCard key={t.id} task={t} onApprove={approveToBilling} />
          ))}
        </section>
      </div>
    </div>
  );
}

// --- Styles (Saban Enterprise UI) ---
const s: any = {
  container: { background: '#f0f2f5', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '25px 40px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { margin: 0, fontSize: '1.8rem', fontWeight: '900' },
  statsHeader: { display: 'flex', gap: '20px' },
  statBox: { background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', textAlign: 'center' },
  
  boardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' },
  column: { background: '#dfe3e6', padding: '20px', borderRadius: '15px', minHeight: '70vh' },
  columnTitle: { margin: '0 0 20px 0', fontSize: '16px', color: '#444', borderBottom: '2px solid #ccc', paddingBottom: '10px' },
  
  card: (status: string) => ({
    background: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    borderRight: `5px solid ${status === 'נסרק' ? '#f39c12' : status === 'מאושר לחיוב' ? '#2ecc71' : '#3498db'}`
  }),
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  clientName: { fontWeight: 'bold', fontSize: '14px' },
  statusBadge: (s: string) => ({ fontSize: '10px', background: '#f4f7f6', padding: '2px 8px', borderRadius: '10px', border: '1px solid #ddd' }),
  cardBody: { fontSize: '13px', color: '#555' },
  metaData: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', opacity: 0.7 },
  anomalyAlert: { background: '#fff1f0', color: '#cf1322', padding: '5px', borderRadius: '5px', marginTop: '10px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #ffa39e' },
  cardFooter: { marginTop: '15px', display: 'flex', gap: '10px' },
  approveBtn: { flex: 1, background: '#2ecc71', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  viewDocBtn: { background: '#f0f2f5', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};
