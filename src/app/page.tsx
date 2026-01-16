// בתוך ה-Home Component שלך
const [allProducts, setAllProducts] = useState<any[]>([]);
const [search, setSearch] = useState('');
const [cart, setCart] = useState<any[]>([]);

// טעינת המאגר מהסטודיו
useEffect(() => {
  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setAllProducts(snap.docs.map(d => d.data()));
  };
  fetchProducts();
}, []);

// חיזוי הקלדה (Autocomplete)
const filtered = search.length > 1 
  ? allProducts.filter(p => p.name.includes(search) || p.sku.includes(search))
  : [];

const addToCart = (product: any) => {
  const existing = cart.find(c => c.sku === product.sku);
  if (existing) {
    setCart(cart.map(c => c.sku === product.sku ? {...c, qty: c.qty + 1} : c));
  } else {
    setCart([...cart, { ...product, qty: 1 }]);
  }
  setSearch('');
};

return (
  <div style={{ padding: '15px' }}>
    {/* שדה חיפוש עם חיזוי */}
    <div style={{ position: 'relative' }}>
      <input 
        type="text" 
        placeholder="חפש מוצר או מק\"ט..." 
        value={search}
        style={{ width: '100%', padding: '15px', borderRadius: '30px', border: '2px solid #075E54' }}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '55px', width: '100%', background: 'white', zIndex: 10, borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          {filtered.map(p => (
            <div key={p.sku} onClick={() => addToCart(p)} style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
              <strong>{p.name}</strong> <small>(מק"ט: {p.sku})</small>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* רשימת ההזמנה (Cart) עם בחירת כמות */}
    <div style={{ marginTop: '20px' }}>
      {cart.map(item => (
        <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
          <div>
            <div>{item.name}</div>
            <small style={{color: '#666'}}>מק"ט: {item.sku}</small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setCart(cart.map(c => c.sku === item.sku ? {...c, qty: Math.max(0, c.qty - 1)} : c))} style={qtyBtn}>-</button>
            <span style={{ fontWeight: 'bold' }}>{item.qty}</span>
            <button onClick={() => setCart(cart.map(c => c.sku === item.sku ? {...c, qty: c.qty + 1} : c))} style={qtyBtn}>+</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const qtyBtn = { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #075E54', background: 'none', cursor: 'pointer' };
