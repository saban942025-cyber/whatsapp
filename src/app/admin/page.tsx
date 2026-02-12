'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, query, orderBy } from 'firebase/firestore';
import { Howl } from 'howler';
import { 
  Users, MessageSquare, Share2, Upload, 
  UserPlus, Activity, ExternalLink, Edit3, Save, X, Phone
} from 'lucide-react';
import Papa from 'papaparse';
import { getSabanResponse } from '@/app/actions/gemini-brain';

export default function AdminCRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const alertSound = new Howl({ src: ['/notification.mp3'], html5: true });

  useEffect(() => {
    const q = query(collection(db, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    return onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [{ msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setEditData(c);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateDoc(doc(db, 'customer_memory', editingId), editData);
      setEditingId(null);
      addLog(`פרטי לקוח ${editData.name} עודכנו`);
    }
  };

  const processCSV = (file: File, customerId: string) => {
    setIsProcessing(true);
    Papa.parse(file, {
      complete: async (results) => {
        try {
          const rawText = JSON.stringify(results.data.slice(0, 30));
          const prompt = `נתח את ה-CSV וחלץ: מספר הזמנה (OrderId), תאריך, פרויקט, ורשימת מוצרים (שם, כמות). תחזיר JSON בלבד: {"orderId": "...", "date": "...", "project": "...", "items": [...]}`;
          const analysisStr = await getSabanResponse(prompt, customerId);
          const cleanJson = JSON.parse(analysisStr.replace(/```json|```/g, ''));

          await updateDoc(doc(db, 'customer_memory', customerId), {
            orderHistory: arrayUnion(cleanJson),
            project: cleanJson.project,
            lastUpdate: new Date().toISOString()
          });
          addLog(`הזמנה ${cleanJson.orderId} הועלתה ל-${customerId}`);
          alertSound.play();
        } catch (e) { addLog("שגיאה בניתוח קובץ"); }
        finally { setIsProcessing(false); }
      }
    });
  };

  const shareLink = (id: string, name: string) => {
    const link = `${window.location.origin}/client/${id}`;
    const text = `שלום ${name}, ברוך הבא למערכת ח. סבן 🏗️\nלינק אישי למעקב והזמנות:\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-8" dir="rtl text-right">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-6 rounded-[25px] shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2"><Users /> CRM ח. סבן</h1>
          <Activity className="animate-pulse text-green-400" />
        </div>

        <div className="bg-white rounded-[30px] shadow-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-500 text-xs">
                <th className="p-4">פרופיל</th>
                <th className="p-4">שם ופרויקט</th>
                <th className="p-4">מספר לקוח</th>
                <th className="p-4">הודעה אחרונה</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-all">
                  <td className="p-4">
                    <img src={c.profileImage} className="w-12 h-12 rounded-full border shadow-sm object-cover" />
                  </td>
                  <td className="p-4">
                    {editingId === c.id ? (
                      <input className="border p-1 rounded w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                    ) : (
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-blue-500">{c.project}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-600">
                    {editingId === c.id ? (
                      <input className="border p-1 rounded w-full" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} />
                    ) : c.accNum}
                  </td>
                  <td className="p-4 text-xs text-gray-500 truncate max-w-[150px]">{c.lastMessage || 'ממתין...'}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="p-2 bg-blue-500 text-white rounded-lg"><Save size={16}/></button>
                      ) : (
                        <button onClick={() => handleEdit(c)} className="p-2 bg-gray-100 rounded-lg"><Edit3 size={16}/></button>
                      )}
                      <button onClick={() => shareLink(c.id, c.name)} className="p-2 bg-green-100 text-green-600 rounded-lg"><Share2 size={16}/></button>
                      <label className="p-2 bg-orange-100 text-orange-600 rounded-lg cursor-pointer">
                        <Upload size={16}/><input type="file" className="hidden" onChange={e => e.target.files && processCSV(e.target.files[0], c.id)} />
                      </label>
                      <a href={`/chat/${c.id}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><MessageSquare size={16}/></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-black text-green-400 p-6 rounded-[25px] font-mono text-xs shadow-2xl">
          <p className="border-b border-green-900 pb-2 mb-2 uppercase tracking-widest opacity-70">System Activity Logs</p>
          {logs.map((l, i) => <div key={i}><span className="opacity-50">[{l.time}]</span> {l.msg}</div>)}
        </div>
      </div>
    </div>
  );
}
