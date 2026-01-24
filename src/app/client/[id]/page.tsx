'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ClientTaskPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const sigPad = useRef<any>(null);

  // 1. טעינת נתוני המשימה מ-Firebase לפי ה-ID בלינק
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const docRef = doc(db, "tasks", params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTask(docSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  // 2. פונקציית שליחת החתימה והפריקה
  const handleComplete = async () => {
    if (sigPad.current.isEmpty()) return alert("חובה לחתום כדי לאשר קבלת סחורה");

    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    
    try {
      await updateDoc(doc(db, "tasks", params.id), {
        status: "נסרק",
        signature: signatureData,
        finishTime: new Date().toLocaleTimeString('he-IL'),
        completedAt: new Date()
      });
      alert("התעודה נשלחה בהצלחה למשרד!");
      setIsSigning(false);
    } catch (e) {
      alert("שגיאה בשליחה, נסה שוב");
    }
  };

  if (loading) return <div style={s.center}>טוען נתונים...</div>;
  if (!task) return <div style={s.center}>משימה לא נמצאה</div>;

  return (
    <div dir="rtl" style={s.container}>
      {/* כותרת הפרויקט */}
      <div style={s.header}>
        <h2 style={{margin:0}}>ח. סבן - אישור פריקה</h2>
        <div style={s.badge}>{task.client}</div>
      </div>

      <div style={s.infoCard}>
        <p><strong>📍 כתובת:</strong> {task.address}</p>
        <p><strong>📦 פריטים לפריקה:</strong></p>
        <div style={s.itemsBox}>{task.items}</div>
      </div>

      {!isSigning ? (
        <button onClick={() => setIsSigning(true)} style={s.mainBtn}>
          ✍️ לחץ כאן לחתימה ואישור פריקה
        </button>
      ) : (
        <div style={s.signatureSection}>
          <label>חתימת לקוח/מנהל עבודה:</label>
          <div style={s.canvasWrapper}>
            <SignatureCanvas 
              ref={sigPad}
              canvasProps={{width: 350, height: 180, className: 'sigCanvas'}}
            />
          </div>
          <div style={s.btnGroup}>
            <button onClick={() => sigPad.current.clear()} style={s.clearBtn}>נקה</button>
            <button onClick={handleComplete} style={s.submitBtn}>שלח תעודה חתומה ✅</button>
          </div>
        </div>
      )}
      
      <p style={s.footer}>מערכת סריקה דיגיטלית ח. סבן 365</p>
    </div>
  );
}

const s: any = {
  container: { padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  header: { background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  badge: { background: '#2ecc71', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', marginTop: '10px' },
  infoCard: { background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' },
  itemsBox: { background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginTop: '5px', fontWeight: 'bold' },
  mainBtn: { width: '100%', padding: '18px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
  signatureSection: { background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #075E54' },
  canvasWrapper: { border: '2px dashed #cbd5e1', borderRadius: '8px', marginTop: '10px', background: '#fff' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
  clearBtn: { flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px' },
  submitBtn: { flex: 2, padding: '12px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  footer: { textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '30px' }
};
