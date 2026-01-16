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
  const [newProd, setNewProd] = useState({ sku: '', name: '', imageUrl: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const saveProduct = async () => {
    if (!newProd.sku || !newProd.name) return alert("מלא מק\"ט ושם מוצר");
    await addDoc(collection(db, "products"), newProd);
    setNewProd({ sku: '', name: '', imageUrl: '' });
    loadProducts();
  };

  const removeProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#075E54' }}>🛠️ סטודיו ניהול מוצרים - סבן 94</h1>
      
      {/* טופס הוספה */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3>הוספת מוצר חדש למאגר</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="מק\"ט" value={newProd.sku} style={sInput} onChange={e => setNewProd({...newProd, sku: e.target.value})} />
          <input type="text" placeholder="שם מוצר" value={newProd.name} style={sInput} onChange={e => setNewProd({...newProd, name: e.target.value})} />
          <input type="text" placeholder="לינק לתמונה (אופציונלי)" value={newProd.imageUrl} style={sInput} onChange={e => setNewProd({...newProd, imageUrl: e.target.value})} />
          <button onClick={saveProduct} style={{ padding: '10px 25px', background: '#075E54', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>הוסף למאגר</button>
        </div>
      </div>

      {/* טבלת מוצרים */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
        <h3>המוצרים הקיימים במערכת</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px', position: 'relative' }}>
              {p.imageUrl && <img src={p.imageUrl} style={{ width: '100%', height: '100px', objectFit: 'contain' }} />}
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>מק"ט: {p.sku}</div>
              <button onClick={() => removeProduct(p.id)} style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', marginTop: '5px', cursor: 'pointer' }}>מחק</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const sInput = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', flex: '1', minWidth: '150px' };=
