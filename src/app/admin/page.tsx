'use client'
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Users, Edit3, Save, X, Share2, Image as ImageIcon, MessageCircle } from 'lucide-react';

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
        project: editData.project || '',
        lastUpdate: new Date().toISOString()
      });
      setEditingId(null);
      alert("עודכן בהצלחה!");
    }
  };

  const shareWA = (id: string, name: string) => {
    const link = `${window.location.origin}/client/${id}`;
    const text = `שלום ${name}, מצורף לינק אישי למעקב הזמנות ח. סבן: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
          <h1 className="text-2xl font-black flex items-center gap-2"><Users /> ניהול לקוחות ח. סבן</h1>
        </div>

        <div className="bg-white rounded-[35px] shadow-xl overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-gray-400 text-xs uppercase tracking-widest">
                <th className="p-5">פרופיל</th>
                <th className="p-5">שם ופרויקט</th>
                <th className="p-5 text-center">מספר לקוח</th>
                <th className="p-5 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-green-50/30 transition-all">
                  <td className="p-5">
                    <div className="relative w-16 h-16">
                      <img src={c.profileImage} className="w-full h-full rounded-full border-2 border-white shadow-md object-cover" />
                    </div>
                  </td>
                  <td className="p-5">
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <input className="border p-2 rounded-xl text-sm" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                        <input className="border p-2 rounded-xl text-[10px] text-blue-500" value={editData.profileImage} onChange={e => setEditData({...editData, profileImage: e.target.value})} placeholder="לינק לתמונה (URL)" />
                      </div>
                    ) : (
                      <div>
                        <div className="font-black text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.project}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-center font-mono text-blue-600 font-bold">
                    {editingId === c.id ? (
                      <input className="border p-2 rounded-xl text-sm w-24 text-center" value={editData.accNum} onChange={e => setEditData({...editData, accNum: e.target.value})} />
                    ) : c.accNum}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      {editingId === c.id ? (
                        <button onClick={handleSave} className="bg-green-500 text-white p-3 rounded-2xl shadow-md"><Save size={18}/></button>
                      ) : (
                        <button onClick={() => { setEditingId(c.id); setEditData(c); }} className="bg-gray-100 p-3 rounded-2xl text-gray-500"><Edit3 size={18}/></button>
                      )}
                      <button onClick={() => shareWA(c.id, c.name)} className="bg-green-100 text-green-600 p-3 rounded-2xl"><Share2 size={18}/></button>
                      <a href={`/chat/${c.id}`} className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><MessageCircle size={18}/></a>
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
