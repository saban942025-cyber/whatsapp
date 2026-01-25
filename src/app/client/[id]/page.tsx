'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// מפה פשוטה וחינמית
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון לאייקון של המפה
const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] });

export default function DriverTaskPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [formData, setFormData] = useState({ returns: '0', waitingTime: '0', comments: '' });
  const sigPad = useRef<any>(null);

  useEffect(() => {
    const fetchTask = async () => {
      const docSnap = await getDoc(doc(db, "tasks", params.id));
      if (docSnap.exists()) setTask(docSnap.data());
    };
    fetchTask();
  }, [params.id]);

  const handleComplete = async () => {
    if (sigPad.current.isEmpty()) return alert("חובה לחתום לאישור פריקה");

    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    const base64Content = signatureData.split(',')[1];

    try {
      // 1. הגשר ל-365 (הלינק שבנית ב-Power Automate)
      const powerAutomateUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bff0c0523978498e8a3ddc9fa163f2a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aEqAGkUi5xEpFiBhe_tQmnO4EzRGHTqA1OdKJjFNqyM";

      await fetch(powerAutomateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: task.client,
          items: task.items,
          address: task.address,
          returns: formData.returns, // הזרקת המשטחים שביקשת
          fileContent: base64Content,
          fileName: `Saban_${task.client}_${new Date().getTime()}.pdf`
        })
      });

      // 2. עדכון Firebase
      await updateDoc(doc(db, "tasks", params.id), { status: "מאושר לחיוב", returns: formData.returns });
      alert("תעודה נשלחה בהצלחה ל-365!");
      setIsSigning(false);
    } catch (e) {
      alert("שגיאה בחיבור למשרד");
    }
  };

  if (!task) return <div style={s.center}>טוען...</div>;

  return (
    <div dir="rtl" style={s.container}>
      {/* כותרת וניווט */}
      <div style={s.header}>
        <h2 style={{margin:0}}>משימת הובלה: {task.client}</h2>
        <button onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(task.address)}`)} style={s.wazeBtn}>🧭 ניווט ב-Waze</button>
      </div>

      {/* מפה מוטמעת */}
      <div style={s.mapWrapper}>
        <MapContainer center={[32.1848, 34.8713]} zoom={13} style={{ height: '200px', borderRadius: '10px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[32.1848, 34.8713]} icon={icon}>
            <Popup>{task.address}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* פרטי הזמנה */}
      <div style={s.infoCard}>
        <p><strong>📦 מוצרים:</strong> {task.items}</p>
        <p><strong>📍 יעד:</strong> {task.address}</p>
      </div>

      {/* טופס פריקה וחתימה */}
      <div style={s.formSection}>
        <h3>דיווח פריקה</h3>
        <div style={s.inputGroup}>
          <label>החזרת משטחים:</label>
          <input type="number" value={formData.returns} onChange={e => setFormData({...formData, returns: e.target.value})} style={s.input}/>
        </div>

        {!isSigning ? (
          <button onClick={() => setIsSigning(true)} style={s.mainBtn}>✍️ חתימת לקוח</button>
        ) : (
          <div style={s.signatureArea}>
            <SignatureCanvas ref={sigPad} canvasProps={{width: 330, height: 150, className: 'sigCanvas'}} />
            <div style={s.btnGroup}>
              <button onClick={() => sigPad.current.clear()} style={s.clearBtn}>נקה</button>
              <button onClick={handleComplete} style={s.submitBtn}>שלח ל-365 ✅</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: any = {
  container: { padding: '15px', background: '#f0f4f8', minHeight: '100vh', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  wazeBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '20px', fontWeight: 'bold' },
  mapWrapper: { margin: '15px 0', border: '2px solid #fff', borderRadius: '12px', overflow: 'hidden' },
  infoCard: { background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px' },
  formSection: { background: '#fff', padding: '15px', borderRadius: '12px', borderTop: '4px solid #2ecc71' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '60px', padding: '8px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ddd' },
  mainBtn: { width: '100%', padding: '15px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold' },
  signatureArea: { border: '1px solid #075E54', borderRadius: '8px', padding: '10px' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  clearBtn: { flex: 1, padding: '10px', borderRadius: '5px' },
  submitBtn: { flex: 2, padding: '10px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' },
  center: { textAlign: 'center', marginTop: '50px' }
};
