'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, onSnapshot, doc, updateDoc, 
  arrayUnion, query, orderBy 
} from 'firebase/firestore';
import { 
  Users, Edit3, Save, X, Share2, Upload, 
  MessageSquare, ExternalLink, FileText, Activity, CheckCircle 
} from 'lucide-react';
import { parseSabanCsv } from '@/lib/orderParser';
import { generateDeliveryNote } from '@/lib/pdfGenerator';

export default function AdminCRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  // 1. טעינת לקוחות בזמן אמת מ-Firebase
  useEffect(() => {
    const q = query(collection(db, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data);
    });
    return () => unsub();
  }, []);

  // 2. פונקציית לוגים פנימית
  const addLog = (msg: string) => {
    const newLog = { msg, time: new Date().toLocaleTimeString('he-IL') };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  // 3. טיפול בעריכת לקוח
  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditData({ ...c });
  };

  const handleSave = async () => {
    if (editingId) {
      try {
        const ref = doc(db, 'customer_memory', editingId);
        await updateDoc(ref, {
          name: editData.name,
          profileImage: editData.profileImage,
          accNum: editData.accNum || '',
          project: editData.project || '',
          lastUpdate: new Date().toISOString()
        });
        addLog(`עודכנו פרטים עבור: ${editData.name}`);
        setEditingId(null);
      } catch (e) {
        addLog("שגיאה בעדכון פרטים");
      }
    }
  };

  // 4. העלאת CSV ושימוש בשבלונה של סבן
  const handleFileUpload = async (file: File, customerId: string, customerName: string) => {
    setStatus('מעבד קובץ...');
    try {
      const orderData = await parseSabanCsv(file);
      const ref = doc(db, 'customer_memory', customerId);
      
      await updateDoc(ref, {
        orderHistory: arrayUnion(orderData),
        lastUpdate: new Date().toISOString(),
        project: orderData.project || 'פרויקט פעיל'
      });

      addLog(`הזמנה ${orderData.orderId} נקלטה עבור ${customerName}`);
      setStatus('✅ קובץ נקלט בהצלחה!');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      addLog("שגיאה בפענוח ה-CSV");
      setStatus('❌ שגיאה במבנה הקובץ');
    }
  };

  // 5. שליחת לינק קסם בוואטסאפ
  const shareWhatsApp = (id: string, name: string) => {
    const link = `${window.location.origin}/client/${id}`;
    const text = `שלום ${name}, ברוך הבא למערכת הניהול של ח. סבן 🏗️\nכל ההזמנות והעדכונים שלך כאן:\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-8 font-sans text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white p-6 rounded-[30px] shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">CRM ח. סבן - ניהול חכם</h1>
              <p className="text-xs text-green-200">מחובר למסד הנתונים בזמן אמת</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">{status}</span>
            <Activity className="text-green-400 animate-pulse" />
          </div>
        </div>

        {/* CRM Table */}
        <div className="bg-white rounded-[35px] shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-500 text-xs font-bold">
                <th className="p-5">פרופיל ולקוח</th>
                <th className="p-5">מספר לקוח / פרויקט</th>
                <th className="p-5 text-center">פעולות ניהול</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-green-50/30 transition-all group">
                  <td className="p-5 flex items-center gap-4">
                    <img 
                      src={c.profileImage} 
                      className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" 
                      alt="" 
                    />
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <input className="border p-2 rounded-xl text-sm outline-none focus:border-[#25D366]" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        <input className="border p-2 rounded-xl text-[10px] w-64 text-blue-500 outline-none" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="לינק לתמונה (URL)" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-black text-gray-800 text-lg">{c.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono italic">ID: {c.id}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2 max-w-[150px]">
                        <input className="border p-2 rounded-xl text-sm" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} placeholder="מספר לקוח" />
                        <input className="border p-2 rounded-xl text-sm" value={editData.project} onChange={e => setEditData({...editData, project: e.target.value})} placeholder="שם פרויקט" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-mono text-blue-600 font-bold text-base">{c.accNum || '---'}</div>
                        <div className="text-xs text-gray-500">{c.project || 'אין פרויקט פעיל'}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center items-center gap-2">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="bg-green-500 text-white p-3 rounded-2xl shadow-md hover:bg-green-600 transition-colors">
                          <Save size={20} />
                        </button>
                      ) : (
                        <button onClick={() => startEdit(c)} className="bg-gray-100 p-3 rounded-2xl text-gray-500 hover:bg-gray-200 transition-colors">
                          <Edit3 size={20} />
                        </button>
                      )}
                      
                      {/* כפתור העלאת CSV */}
                      <label className="bg-orange-100 text-orange-600 p-3 rounded-2xl hover:bg-orange-200 transition-colors cursor-pointer" title="העלה הזמנה">
                        <Upload size={20} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".csv" 
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], c.id, c.name)} 
                        />
                      </label>

                      {/* כפתור הפקת PDF */}
                      <button 
                        onClick={() => c.orderHistory?.length > 0 ? generateDeliveryNote(c.orderHistory[c.orderHistory.length - 1]) : alert('אין הזמנות')}
                        className="bg-red-50 text-red-600 p-3 rounded-2xl hover:bg-red-100 transition-colors"
                        title="הפק תעודת משלוח"
                      >
                        <FileText size={20} />
                      </button>

                      {/* כפתור שיתוף וואטסאפ */}
                      <button onClick={() => shareWhatsApp(c.id, c.name)} className="bg-green-100 text-green-600 p-3 rounded-2xl hover:bg-green-200 transition-colors">
                        <Share2 size={20} />
                      </button>

                      <a href={`/chat/${c.id}`} target="_blank" className="bg-blue-50 text-blue-600 p-3 rounded-2xl hover:bg-blue-100">
                        <MessageSquare size={20} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity Logs (המסך השחור) */}
        <div className="bg-black text-green-400 p-6 rounded-[30px] shadow-2xl font-mono text-xs border border-green-900/30">
          <div className="flex items-center gap-2 mb-4 border-b border-green-900/50 pb-2">
            <Activity size={16} />
            <span className="uppercase tracking-widest font-black">Saban System Activity Logs</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {logs.length === 0 && <p className="opacity-40 italic">ממתין לפעולות במערכת...</p>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="opacity-50 text-white">[{log.time}]</span>
                <span className="text-green-300 font-bold">{log.msg}</span>
                <CheckCircle size={10} className="mt-0.5 text-green-600" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
