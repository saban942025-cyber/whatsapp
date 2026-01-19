'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// שימוש ב-Default Export קריטי למניעת 404
export default function InsightsPage() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalStats, setGlobalStats] = useState({ loss: 0, count: 0 });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const XLSX = (window as any).XLSX;
        if (!XLSX) return alert("המערכת טוענת רכיבים, נסה שוב בעוד רגע");

        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        await analyzeSabanLogistics(jsonData);
      } catch (err) {
        alert("שגיאה בניתוח הקובץ");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const analyzeSabanLogistics = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    // מנוע ההצלבה של המלשינון (כתובות מזהות מתעודות גליה)
    const addressMemory: any = {
      "ישעיהו": "נישה אדריכלות נוף",
      "החרש": "נישה אדריכלות נוף",
      "התלמיד": "זבולון-עדיר",
      "סמטת הגן": "בועז נחשוני"
    };

    const driverMap: any = {};
    let totalLoss = 0;

    rows.forEach((row, idx) => {
      if (idx < 8 || !row[1]) return; // דילוג על זבל של איתורן
      const [time, driver, , , duration, , address, , status] = row;
      const durInt = parseFloat(duration) || 0;

      if (!driverMap[driver]) driverMap[driver] = { name: driver, loss: 0, anomalies: 0, worstStop: "" };

      // בדיקת חוקי עסק (30 דקות פריקה)
      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      const isAnom = (status?.includes('עצירה') || status?.includes('PTO')) && durInt > rule.maxTime;

      if (isAnom) {
        const excess = durInt - rule.maxTime;
        const moneyLost = excess * 7.5;
        driverMap[driver].loss += moneyLost;
        driverMap[driver].anomalies++;
        totalLoss += moneyLost;
        
        // זיהוי הלקוח שבו הייתה החריגה
        const client = Object.keys(addressMemory).find(k => address?.includes(k));
        if (client) driverMap[driver].worstStop = addressMemory[client];
      }
    });

    setAnalyzedDrivers(Object.values(driverMap));
    setGlobalStats({ loss: totalLoss, count: Object.keys(driverMap).length });
  };

  return (
    <div dir="rtl" style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{margin:0}}>SABAN <span style={{color:'#2ecc71'}}>INSIGHTS</span></h1>
          <p style={{margin:0, opacity:0.8}}>מערכת המלשינון: מי הנהג ששורף הכי הרבה כסף?</p>
        </div>
        <label style={styles.uploadBtn}>
          {isProcessing ? 'מעבד...' : '📂 העלה דוח איתורן'}
          <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      <div style={styles.dashboard}>
        <div style={styles.statCard}>
          <small>נזק כספי מצטבר</small>
          <h2 style={{color:'#e74c3c', fontSize:'2.5rem', margin:'10px 0'}}>₪{globalStats.loss.toFixed(0)}</h2>
        </div>
        <div style={styles.statCard}>
          <small>נהגים מנותחים</small>
          <h2 style={{fontSize:'2.5rem', margin:'10px 0'}}>{globalStats.count}</h2>
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th>נהג / משאית</th>
              <th>חריגות פריקה</th>
              <th>לקוח בעייתי</th>
              <th>הפסד בחיוב</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {analyzedDrivers.sort((a,b)=>b.loss - a.loss).map(d => (
              <tr key={d.name} style={styles.tr}>
                <td style={{fontWeight:'bold'}}>🚚 {d.name}</td>
                <td>{d.anomalies} פעמים</td>
                <td style={{color:'#666'}}>{d.worstStop || "אין חריגות"}</td>
                <td style={{color:'#c0392b', fontWeight:900}}>₪{d.loss.toFixed(0)}</td>
                <td>
                  <span style={styles.badge(d.loss)}>{d.loss > 300 ? 'חריג ❌' : 'יעיל ✅'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {analyzedDrivers.length === 0 && <div style={{textAlign:'center', padding:'50px', color:'#ccc'}}>העלה דוח כדי להתחיל בחקירה</div>}
      </div>
    </div>
  );
}

const styles: any = {
  container: { background: '#f0f2f5', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '25px 40px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  uploadBtn: { background: '#2ecc71', color: '#fff', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  dashboard: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  tableCard: { background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  thRow: { borderBottom: '2px solid #f1f3f5', color: '#95a5a6', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f8f9fa', height: '65px' },
  badge: (l: number) => ({ background: l > 300 ? '#ffebee' : '#e8f5e9', color: l > 300 ? '#c62828' : '#2e7d32', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' })
};
