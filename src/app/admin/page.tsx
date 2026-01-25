'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Send, Copy, ExternalLink, Truck } from 'lucide-react';

export default function SabanAdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);

  // 1. האזנה למשימות בזמן אמת מ-Firebase
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const copyTaskLink = (id: string) => {
    const link = `https://whatasap.vercel.app/client/${id}`;
    navigator.clipboard.writeText(link);
    alert("הלינק לאפליקציית חכמת הועתק!");
  };

  const sendToHachmat = (task: any) => {
    const link = `https://whatasap.vercel.app/client/${task.id}`;
    const message = `חכמת אחי, משימה חדשה עבור ${task.client}.\nכתובת: ${task.address}\nציוד: ${task.items}\nלינק לחתימה: ${link}`;
    window.open(`https://wa.me/972${task.phone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div dir="rtl" style={s.adminBody}>
      <header style={s.topBar}>
        <h1>ניהול לוגיסטי - ח. סבן</h1>
        <div style={s.statusBadge}>מחובר ל-365 ✅</div>
      </header>

      <div style={s.dashboardGrid}>
        {tasks.map((task) => (
          <div key={task.id} style={s.taskCard}>
            <div style={s.cardHeader}>
              <h3 style={{margin:0}}>{task.client}</h3>
              <span style={{...s.badge, backgroundColor: task.status === 'מאושר לחיוב' ? '#2ecc71' : '#f39c12'}}>
                {task.status}
              </span>
            </div>
            
            <p><strong>🏠 כתובת:</strong> {task.address}</p>
            <p><strong>📦 ציוד:</strong> {task.items}</p>
            
            <div style={s.actionRow}>
              <button onClick={() => sendToHachmat(task)} style={s.waBtn}>
                <Send size={16} /> שלח לחכמת
              </button>
              
              <button onClick={() => copyTaskLink(task.id)} style={s.copyBtn}>
                <Copy size={16} /> העתק לינק
              </button>

              <button onClick={() => window.open(`/client/${task.id}`)} style={s.viewBtn}>
                <ExternalLink size={16} /> תצוגת נהג
              </button>
            </div>
            
            {task.returns && (
              <div style={s.returnInfo}>
                🚚 חזר עם <strong>{task.returns}</strong> משטחים
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const s: any = {
  adminBody: { padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'system-ui' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' },
  statusBadge: { background: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  taskCard: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  badge: { color: '#fff', padding: '4px 10px', borderRadius: '10px', fontSize: '12px' },
  actionRow: { display: 'flex', gap: '10px', marginTop: '20px' },
  waBtn: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  copyBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  viewBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  returnInfo: { marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32', textAlign: 'center' }
};
