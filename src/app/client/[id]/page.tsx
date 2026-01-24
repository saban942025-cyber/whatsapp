'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PDFDocument, rgb } from 'pdf-lib';

export default function DriverTaskPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<any>(null);
  const [arrivalTime, setArrivalTime] = useState("");
  const [coords, setCoords] = useState("");
  const sigPad = useRef<any>(null);

  useEffect(() => {
    // טעינת המשימה וזיהוי מיקום אוטומטי
    const fetchTask = async () => {
      const docRef = doc(db, "saban_tasks", params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setTask(docSnap.data());
    };
    
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords(`${pos.coords.latitude}, ${pos.coords.longitude}`);
      setArrivalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    });

    fetchTask();
  }, [params.id]);

  const saveAndUpload = async () => {
    if (sigPad.current.isEmpty()) return alert("חובה להחתים את הלקוח!");

    const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    
    // כאן תתבצע הלוגיקה של הזרקת הנתונים ל-PDF
    alert("מעבד תעודה חתומה עם מיקום GPS...");
    
    await updateDoc(doc(db, "saban_tasks", params.id), {
      status: "נסרק",
      actualArrivalTime: arrivalTime,
      gpsLocation: coords,
      signature: signatureBase64,
      completedAt: new Date()
    });
    
    alert("תעודה נשלחה בהצלחה לראמי לבדיקה!");
  };

  if (!task) return <div style={{padding: 20}}>טוען משימה...</div>;

  return (
    <main dir="rtl" style={s.container}>
      <header style={s.header}>
        <h2 style={{margin:0}}>משימת הובלה: {task.client}</h2>
        <div style={s.subHeader}>📍 {task.address}</div>
      </header>

      <section style={s.orderDetail}>
        <h3 style={{borderBottom: '1px solid #eee'}}>פרטי העמסה:</h3>
        <p style={{fontSize: '18px', fontWeight: 'bold'}}>{task.items}</p>
      </section>

      <section style={s.formSection}>
        <div style={s.inputRow}>
          <span>שעת הגעה (אוטומטי):</span>
          <input value={arrivalTime} readOnly style={s.readOnlyInput} />
        </div>
        
        <div style={s.inputRow}>
          <span>מיקום GPS:</span>
          <input value={coords} readOnly style={s.readOnlyInput} />
        </div>

        <div style={{marginTop: 20}}>
          <label>חתימת לקוח:</label>
          <div style={s.sigContainer}>
            <SignatureCanvas 
              ref={sigPad}
              canvasProps={{width: 350, height: 150, className: 'sigCanvas'}}
              backgroundColor="#f9f9f9"
            />
          </div>
          <button onClick={() => sigPad.current.clear()} style={s.clearBtn}>נקה חתימה</button>
        </div>
      </section>

      <button onClick={saveAndUpload} style={s.submitBtn}>
        סיים פריקה ושגר תעודה חתומה 🚀
      </button>
    </main>
  );
}

const s: any = {
  container: { padding: '20px', background: '#f4f7f6', minHeight: '100vh', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '15px' },
  subHeader: { fontSize: '14px', opacity: 0.9, marginTop: '5px' },
  orderDetail: { background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px' },
  formSection: { background: '#fff', padding: '15px', borderRadius: '15px' },
  inputRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  readOnlyInput: { border: 'none', background: '#f0f0f0', padding: '8px', borderRadius: '5px', width: '120px', textAlign: 'center' },
  sigContainer: { border: '2px dashed #ccc', borderRadius: '10px', marginTop: '10px', overflow: 'hidden' },
  clearBtn: { marginTop: '5px', background: '#eee', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' },
  submitBtn: { width: '100%', marginTop: '20px', padding: '15px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px' }
};
