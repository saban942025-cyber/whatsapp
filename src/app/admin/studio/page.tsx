'use client';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function ProductStudio() {
  const [products, setProducts] = useState<any[]>([]);
  const [newProd, setNewProd] = useState({ sku: '', name: '' });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const saveProduct = async () => {
    if (!newProd.sku || !newProd.name) return alert("מלא פרטים");
    await addDoc(collection(db, "products"), newProd);
    setNewProd({ sku: '', name: '' });
    loadProducts();
  };

  const removeProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#075E54' }}>🛠️ סטודיו מוצרים - סבן 94</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <input type="text" placeholder="מקט מוצר" style={sInput} value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} />
        <input type="text" placeholder="שם מוצר" style={sInput} value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
        <button onClick={saveProduct} style={{ padding: '10px 20px', background: '#075E54', color: 'white', border: 'none', borderRadius: '8px' }}>הוסף למאגר</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
            <strong>{p.name}</strong><br/>
            <small>מקט: {p.sku}</small><br/>
            <button onClick={() => removeProduct(p.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginTop: '10px' }}>מחק</button>
          </div>
        ))}
      </div>
    </main>
  );
}
const sInput = { padding: '10px', marginLeft: '10px', borderRadius: '5px', border: '1px solid #ddd' };
