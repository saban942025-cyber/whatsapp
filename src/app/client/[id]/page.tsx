'use client';

import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// ספריות מפה
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון ויזואלי לאייקון המפה
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function HachmatDriverApp({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: מפה וניווט, 2: דיווח וחתימה
  const [formData, setFormData] = useState({ returns: '0', waitingTime: '0', driverNote: '' });
  const sigPad = useRef<any>(null);

  useEffect(() => {
    const fetchTask = async () => {
      const docSnap = await getDoc(doc(db, "tasks", params.id));
      if (docSnap.exists()) setTask(docSnap.data());
    };
    fetchTask();
  }, [params.id]);

  const sendToSaban365 = async () => {
    if (sigPad.current.isEmpty()) return alert("חכמת, חייב חתימה בשביל גליה!");

    const signatureBase64 = sigPad.current.getTrimmedCanvas().toDataURL('image/png').split(',')[1];

    try {
      const powerAutomateUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/bff0c0523978498e8a3ddc9fa163f2a8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aEqAGkUi5xEpFiBhe_tQmnO4EzRGHTqA1OdKJjFNqyM";

      const payload = {
        customer: task.client,
        items: task.items,
        address: task.address,
        fileContent: signatureBase64, // שולח את החתימה ישירות ל-Flow
        fileName: `חתימה_${task.client}_${new Date().toLocaleDateString('he-IL')}.pdf`
      };

      const res = await fetch(powerAutomateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await updateDoc(doc(db, "tasks", params.id), { status: "מאושר לחיוב" });
        alert("נשלח בהצלחה ל-SharePoint! סע לשלום אחי.");
        window.location.href = "/thank-you"; // דף סיום נקי
      }
    } catch (e) {
      alert("תקלה בחיבור ל-365");
    }
  };

  if (!task) return <div style={s.loader}>טוען משימה לחכמת...</div>;

  return (
    <div dir="rtl" style={s.appShell}>
      {/* Header קבוע */}
      <div style={s.topBar}>
        <h1 style={s.logo}>ח. סבן <span style={{fontWeight:300}}>LOGISTICS</span></h1>
        <div style={s.driverName}>שלום, חכמת 🚛</div>
      </div>

      {step === 1 ? (
        <div style={s.content}>
          <div style={s.card}>
            <h3>📍 יעד פריקה: {task.client}</h3>
            <p style={s.addressText}>{task.address}</p>
            <button onClick={() => window.open(`waze://?q=${encodeURIComponent(task.address)}&navigate=yes`)} style={s.wazeBtn}>
              🧭 ניווט לכתובת ב-WAZE
            </button>
          </div>

          <div style={s.mapContainer}>
            <MapContainer center={[32.1848, 34.8713]} zoom={14} scrollWheelZoom={false} style={{height: '100%', width: '100%'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[32.1848, 34.8713]} icon={customIcon}>
                <Popup>{task.client}</Popup>
              </Marker>
            </MapContainer>
          </div>

          <button onClick={() => setStep(2)} style={s.nextBtn}>התחל פריקה ודיווח</button>
        </div>
      ) : (
        <div style={s.content}>
          <div style={s.formCard}>
            <h3>📦 דיווח פריקה: {task.client}</h3>
            <div style={s.itemsList}><strong>העמסת:</strong> {task.items}</div>
            
            <div style={s.inputRow}>
              <label>החזרת משטחים:</label>
              <input type="number" style={s.smallInput} value={formData.returns} onChange={e => setFormData({...formData, returns: e.target.value})} />
            </div>

            <div style={s.signatureBox}>
              <p>חתימת הלקוח (ד. ניב / נציג בשטח):</p>
              <div style={s.padWrapper}>
                <SignatureCanvas ref={sigPad} canvasProps={{width: 320, height: 180, className: 'sigCanvas'}} />
              </div>
              <button onClick={() => sigPad.current.clear()} style={s.clearLink}>נקה חתימה</button>
            </div>

            <button onClick={sendToSaban365} style={s.finalBtn}>שלח תעודה חתומה ל-365 ✅</button>
            <button onClick={() => setStep(1)} style={s.backBtn}>חזור למפה</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s: any = {
  appShell: { background: '#f4f7f6', minHeight: '100vh', fontFamily: 'system-ui' },
  topBar: { background: '#075E54', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 },
  logo: { fontSize: '18px', margin: 0 },
  content: { padding: '15px' },
  card: { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '15px' },
  addressText: { color: '#666', marginBottom: '15px' },
  wazeBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  mapContainer: { height: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', border: '2px solid #fff' },
  nextBtn: { width: '100%', padding: '18px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold' },
  formCard: { background: '#fff', padding: '20px', borderRadius: '15px' },
  itemsList: { background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '15px' },
  inputRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  smallInput: { width: '80px', padding: '10px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px' },
  signatureBox: { border: '2px dashed #075E54', borderRadius: '12px', padding: '10px', marginBottom: '20px' },
  padWrapper: { background: '#fff', borderRadius: '8px' },
  clearLink: { background: 'none', border: 'none', color: '#e74c3c', textDecoration: 'underline', marginTop: '5px' },
  finalBtn: { width: '100%', padding: '18px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold' },
  backBtn: { width: '100%', background: 'none', border: 'none', marginTop: '15px', color: '#999' },
  loader: { textAlign: 'center', marginTop: '100px', fontSize: '18px' }
};
