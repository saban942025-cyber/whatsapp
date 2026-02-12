'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Users, Edit3, Save, X, Share2, MessageSquare, ExternalLink, Image as ImageIcon } from 'lucide-react';

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

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setEditData({ ...c });
  };

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

  const sendLink = (id: string, name: string) => {
    const link = `${window.location.origin}/client/${id}`;
    const msg = `שלום ${name}, מצורף לינק אישי למעקב הזמנות ח. סבן: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl text-right">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2"><Users /> ניהול לקוחות ח. סבן</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-100 border-b text-sm text-gray-500">
              <tr>
                <th className="p-4">לקוח</th>
                <th className="p-4 text-center">מספר לקוח</th>
                <th className="p-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={c.profileImage} className="w-12 h-12 rounded-full border shadow-sm object-cover" />
                    {editingId === c.id ? (
                      <div className="space-y-2">
                        <input className="border p-1 text-sm rounded w-full" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        <input className="border p-1 text-[10px] rounded w-full text-blue-600" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="לינק לתמונה" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-gray-800">{c.name}</div>
                        <div className="text-xs text-blue-500 font-medium">{c.project}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center font-mono">
                    {editingId === c.id ? (
                      <input className="border p-1 text-sm rounded w-24 text-center" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} />
                    ) : c.accNum}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-lg"><Save size={18}/></button>
                      ) : (
                        <button onClick={() => startEdit(c)} className="bg-gray-100 text-gray-600 p-2 rounded-lg"><Edit3 size={18}/></button>
                      )}
                      <button onClick={() => sendLink(c.id, c.name)} className="bg-green-100 text-green-600 p-2 rounded-lg"><Share2 size={18}/></button>
                      <a href={`/client/${c.id}`} className="bg-blue-100 text-blue-600 p-2 rounded-lg"><ExternalLink size={18}/></a>
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
