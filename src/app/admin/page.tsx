'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Users, Edit3, Save, X, Share2, MessageSquare, Image as ImageIcon } from 'lucide-react';

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
      await updateDoc(doc(db, 'customer_memory', editingId), {
        name: editData.name,
        profileImage: editData.profileImage,
        accNum: editData.accNum || '',
        lastUpdate: new Date().toISOString()
      });
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2"><Users /> ניהול לקוחות ח. סבן</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4">פרופיל</th>
                <th className="p-4 text-center">פרטים</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <img src={c.profileImage} className="w-14 h-14 rounded-full border shadow-sm object-cover" />
                  </td>
                  <td className="p-4">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <input className="border p-2 rounded text-sm" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="שם לקוח" />
                        <input className="border p-2 rounded text-xs text-blue-500" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="קישור לתמונה (URL)" />
                        <input className="border p-2 rounded text-sm" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} placeholder="מספר לקוח" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-gray-500">מזהה: {c.id}</div>
                        <div className="text-xs font-mono text-blue-600">לקוח: {c.accNum}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-lg"><Save size={18}/></button>
                      ) : (
                        <button onClick={() => {setEditingId(c.id); setEditData(c);}} className="p-2 bg-gray-100 text-gray-500 rounded-lg"><Edit3 size={18}/></button>
                      )}
                      <a href={`/chat/${c.id}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><MessageSquare size={18}/></a>
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
