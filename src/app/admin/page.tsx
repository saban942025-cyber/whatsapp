'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Users, Edit3, Save, X, Share2, Image as ImageIcon, ExternalLink, Activity } from 'lucide-react';

export default function AdminCRM() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const q = query(collection(db, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    return onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleSave = async () => {
    if (editingId) {
      const ref = doc(db, 'customer_memory', editingId);
      await updateDoc(ref, {
        name: editData.name,
        profileImage: editData.profileImage,
        accNum: editData.accNum || '',
        project: editData.project || '',
        lastUpdate: new Date().toISOString()
      });
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white p-6 rounded-[25px] shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users size={32} />
            <h1 className="text-2xl font-black">ניהול לקוחות ח. סבן - CRM</h1>
          </div>
          <Activity className="text-green-400 animate-pulse" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[30px] shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b text-gray-500 text-sm">
              <tr>
                <th className="p-5">לקוח ופרופיל</th>
                <th className="p-5 text-center">מספר לקוח / פרויקט</th>
                <th className="p-5 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-green-50/30 transition-all">
                  <td className="p-5 flex items-center gap-4">
                    <img src={c.profileImage} className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" />
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <input className="border p-2 rounded-xl text-sm outline-none focus:border-[#25D366]" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        <input className="border p-2 rounded-xl text-[10px] w-64 text-blue-600 outline-none" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="לינק לתמונה (URL)" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-black text-gray-800 text-lg">{c.name}</div>
                        <div className="text-xs text-gray-400">ID: {c.id}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2 max-w-[150px] mx-auto">
                        <input className="border p-2 rounded-xl text-sm" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} placeholder="מספר לקוח" />
                        <input className="border p-2 rounded-xl text-sm" value={editData.project} onChange={e => setEditData({...editData, project: e.target.value})} placeholder="שם פרויקט" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-mono text-blue-600 font-bold">{c.accNum || '---'}</div>
                        <div className="text-xs text-gray-500">{c.project}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="bg-green-500 text-white p-3 rounded-2xl shadow-md hover:bg-green-600"><Save size={20}/></button>
                      ) : (
                        <button onClick={() => { setEditingId(c.id); setEditData(c); }} className="bg-gray-100 p-3 rounded-2xl text-gray-500 hover:bg-gray-200"><Edit3 size={20}/></button>
                      )}
                      <a href={`/client/${c.id}`} target="_blank" className="bg-blue-50 p-3 rounded-2xl text-blue-600 hover:bg-blue-100"><ExternalLink size={20}/></a>
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
