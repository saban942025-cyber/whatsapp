'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

export default function StudioFinal() {
  const [products, setProducts] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', type: 'product' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const snap = await getDocs(query(collection(db, "products"), orderBy("name")));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addProduct = async () => {
    if (!newItem.name) return alert("נא למלא שם מוצר");
    await addDoc(collection(db, "products"), newItem);
    setNewItem({ name: '', price: '', type: 'product' });
    fetchData();
    alert("המוצר נוסף לקטלוג סבן! ✅");
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>טוען קטלוג סבן...</div>;

  return (
    <main dir="rtl" style={{padding:'20px', fontFamily:'sans-serif', backgroundColor:'#f0f2f5', minHeight:'100vh'}}>
      <h2 style={{color:'#075E54', textAlign:'center'}}>SABAN 94 - STUDIO</h2>
      
      <div style={{background:'#fff', padding:'20px', borderRadius:'15px', marginBottom:'20px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
        <h3>הוספת מוצר לקטלוג</h3>
        <input style={iS} placeholder="שם המוצר" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} />
        <input style={iS} placeholder="מחיר" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value})} />
        <button style={btn} onClick={addProduct}>הוסף לקטלוג</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
        {products.map(p => (
          <div key={p.id} style={{background:'#fff', padding:'15px', borderRadius:'10px', textAlign:'center'}}>
            <strong>{p.name}</strong><br/>
            <span style={{color:'#25D366'}}>₪ {p.price}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

const iS = { width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ddd', boxSizing:'border-box' as 'border-box' };
const btn = { width:'100%', padding:'15px', background:'#075E54', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'bold' as 'bold', cursor:'pointer' };
