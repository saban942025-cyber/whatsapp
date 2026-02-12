'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, query, orderBy, limit } from 'firebase/firestore';
import { Howl } from 'howler';
import { 
  Users, MessageSquare, Share2, Upload, 
  UserPlus, Activity, ExternalLink, Clipboard, CheckCircle2 
} from 'lucide-react';
import Papa from 'papaparse';

export default function AdminCRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', id: '', img: '' });

  // אתחול צלצול התראה
  const alertSound = new Howl({
    src: ['/notification.mp3'],
    html5: true,
  });

  // האזנה ללקוחות בזמן אמת (Real-time CRM)
  useEffect(() => {
    const q = query(collection(db, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data);
      if (!snap.metadata.hasPendingWrites) alertSound.play(); // צלצול כשיש עדכון
    });
    return () => unsub();
  }, []);

  // יצירת לקוח חדש
  const handleCreate = async () => {
    if (!newCustomer.id || !newCustomer.name) return;
    const ref = doc(db, 'customer_memory', newCustomer.id);
    await setDoc(ref, {
      name: newCustomer.name,
      profileImage: newCustomer.img || `https://i.pravatar.cc/150?u=${newCustomer.id}`,
      lastUpdate: new Date().toISOString(),
      orderHistory: [],
      status: 'active'
    });
    addLog(`לקוח חדש נוצר: ${newCustomer.name}`);
    setNewCustomer({ name: '', id: '', img: '' });
  };

  const addLog = (msg: string) => {
    setLogs(prev => [{ msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const shareToWA = (id: string, name: string) => {
    const link = `${window.location.origin}/client/${id}`;
    const text = `שלום ${name}, ברוך הבא למערכת ההזמנות של ח. סבן! 🏗️\nמעקב והזמנות בלינק שלך:\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans p-4 md:p-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header CRM */}
        <div className="bg-[#075E54] text-white p-6 rounded-[25px] shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Users size={40} className="bg-white/10 p-2 rounded-full" />
            <div>
              <h1 className="text-2xl font-black">ניהול לקוחות ח. סבן (CRM)</h1>
              <p className="text-sm opacity-80">מחוברים כעת: {customers.length} לקוחות</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              placeholder="שם לקוח" 
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              className="p-2 rounded-lg text-black text-sm outline-none" 
            />
            <input 
              placeholder="ID" 
              value={newCustomer.id}
              onChange={e => setNewCustomer({...newCustomer, id: e.target.value})}
              className="p-2 rounded-lg text-black text-sm w-24 outline-none" 
            />
            <button onClick={handleCreate} className="bg-[#25D366] p-2 rounded-lg font-bold text-sm flex items-center gap-1">
              <UserPlus size={16}/> הוסף
            </button>
          </div>
        </div>

        {/* טבלת לקוחות */}
        <div className="bg-white rounded-[25px] shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest border-b">
                <th className="p-4">לקוח ופרויקט</th>
                <th className="p-4">הודעה אחרונה / סטטוס</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-green-50/50 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative">
                      <img src={c.profileImage} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-black text-gray-800">{c.name}</div>
                      <div className="text-xs text-gray-500 italic font-medium">{c.project || 'אין פרויקט פעיל'}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {c.lastMessage || 'ממתין להזמנה ראשונה...'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase">{c.lastUpdate}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-3">
                      <button onClick={() => shareToWA(c.id, c.name)} className="text-[#25D366] hover:scale-110 transition-transform shadow-sm bg-white p-2 rounded-full border">
                        <Share2 size={18} />
                      </button>
                      <LinkIcon href={`/chat/${c.id}`} icon={<ExternalLink size={18} />} color="blue" />
                      <div className="relative group/upload cursor-pointer bg-white p-2 rounded-full border hover:bg-gray-50 transition-all">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept=".csv"
                          onChange={(e) => {/* לוגיקת העלאת ה-CSV שלך */}}
                        />
                        <Upload size={18} className="text-orange-500" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* לוג פעילות בזמן אמת */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-[25px] shadow-2xl font-mono text-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-green-900/50 pb-2">
            <Activity size={16} />
            <span className="uppercase tracking-tighter">Activity Logs - ח. סבן System</span>
          </div>
          <div className="space-y-2">
            {logs.length === 0 && <p className="opacity-50">ממתין לפעולות במערכת...</p>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4">
                <span className="opacity-50">[{log.time}]</span>
                <span className="text-white">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// קומפוננטת עזר לאייקונים עם לינק
function LinkIcon({ href, icon, color }: { href: string, icon: any, color: string }) {
  return (
    <a href={href} className={`text-${color}-500 hover:scale-110 transition-transform bg-white p-2 rounded-full border shadow-sm`}>
      {icon}
    </a>
  );
}
