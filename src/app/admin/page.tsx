'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Users, Edit3, Save, X, Share2, Upload, MessageSquare, ExternalLink } from 'lucide-react';

export default function AdminCRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // טעינת לקוחות בזמן אמת
  useEffect(() => {
    const q = query(collection(db, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    return onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

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
          accNum: editData.accNum,
          lastUpdate: new Date().toISOString()
        });
        setEditingId(null);
        alert("הנתונים עודכנו!");
      } catch (e) {
        alert("שגיאה בעדכון");
      }
    }
  };

  const sendWhatsApp = (id: string, name: string) => {
    const link = `${window.location.origin}/client/${id}`;
    const msg = `שלום ${name}, מצורף לינק אישי למערכת ההזמנות של ח. סבן:\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2"><Users /> ניהול לקוחות ח. סבן</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-500 text-sm">
                <th className="p-4">לקוח</th>
                <th className="p-4">מספר לקוח</th>
                <th className="p-4">פרויקט</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={c.profileImage} className="w-12 h-12 rounded-full border object-cover" />
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-1">
                        <input className="border p-1 text-sm rounded" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="שם" />
                        <input className="border p-1 text-[10px] rounded w-40" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="לינק לתמונה" />
                      </div>
                    ) : (
                      <span className="font-bold">{c.name}</span>
                    )}
                  </td>
                  <td className="p-4 font-mono">
                    {editingId === c.id ? (
                      <input className="border p-1 text-sm rounded w-24" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} />
                    ) : c.accNum}
                  </td>
                  <td className="p-4 text-sm text-blue-600">{c.project}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {editingId === c.id ? (
                        <>
                          <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-lg"><Save size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-red-500 text-white rounded-lg"><X size={18}/></button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(c)} className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Edit3 size={18}/></button>
                      )}
                      <button onClick={() => sendWhatsApp(c.id, c.name)} className="p-2 bg-green-100 text-green-600 rounded-lg"><Share2 size={18}/></button>
                      <a href={`/client/${c.id}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ExternalLink size={18}/></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
