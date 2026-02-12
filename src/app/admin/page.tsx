'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Users, Edit3, Save, X, Share2, Image as ImageIcon, ExternalLink } from 'lucide-react';

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
        profileImage: editData.profileImage, // כאן נשמר הלינק לתמונה החדשה
        accNum: editData.accNum || '',
        lastUpdate: new Date().toISOString()
      });
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#075E54] text-white p-6 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2"><Users /> ניהול לקוחות ועריכת פרופיל</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr className="text-gray-500 text-sm">
                <th className="p-4">לקוח</th>
                <th className="p-4">פרטי זיהוי</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-green-50/30 transition-all">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative group">
                      <img src={c.profileImage} className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />
                      {editingId === c.id && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white"><ImageIcon size={16}/></div>}
                    </div>
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <input className="border p-1 rounded text-sm" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="שם לקוח" />
                        <input className="border p-1 rounded text-[10px] w-48 text-blue-600" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="לינק לתמונה (URL)" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-lg">{c.name}</div>
                        <div className="text-xs text-gray-400">מזהה: {c.id}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === c.id ? (
                      <input className="border p-1 rounded text-sm w-full" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} placeholder="מספר לקוח" />
                    ) : (
                      <span className="font-mono text-blue-600">{c.accNum || 'ללא מספר'}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-xl shadow-md"><Save size={20}/></button>
                      ) : (
                        <button onClick={() => { setEditingId(c.id); setEditData(c); }} className="bg-gray-100 p-2 rounded-xl text-gray-500"><Edit3 size={20}/></button>
                      )}
                      <a href={`/client/${c.id}`} className="bg-blue-100 p-2 rounded-xl text-blue-600"><ExternalLink size={20}/></a>
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
