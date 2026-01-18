'use client';
import { useState } from 'react';

export default function MobileOrderForm() {
  const [isOpen, setIsOpen] = useState(false); // מצב תפריט המבורגר
  const [orderType, setOrderType] = useState('חומרים');
  const [formData, setFormData] = useState({ customer: '', details: '', address: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // שליחה ישירה ל-Power Automate (הגשר שבנינו)
    const flowUrl = "YOUR_POWER_AUTOMATE_URL";
    await fetch(flowUrl, {
      method: 'POST',
      body: JSON.stringify({ ...formData, type: orderType }),
    });
    alert("ההזמנה נשלחה בהצלחה!");
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* --- תפריט המבורגר עליון --- */}
      <nav style={navStyle}>
        <button onClick={() => setIsOpen(!isOpen)} style={hamburgerBtn}>
          ☰
        </button>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ח.סבן - הזמנה חדשה</div>
        <div style={{ width: '30px' }}></div> {/* לאיזון ויזואלי */}
      </nav>

      {/* --- תוכן התפריט הנפתח --- */}
      {isOpen && (
        <div style={menuOverlay} onClick={() => setIsOpen(false)}>
          <div style={menuContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>תפריט מהיר</h3>
            <button style={menuItem} onClick={() => window.location.href='/track'}>📦 מעקב משלוחים</button>
            <button style={menuItem} onClick={() => window.location.href='/admin/studio'}>🎨 סטודיו ניהול</button>
            <button style={menuItem} onClick={() => setIsOpen(false)}>❌ סגור</button>
          </div>
        </div>
      )}

      {/* --- טופס ההזמנה --- */}
      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={formCard}>
          <label style={labelS}>1. שם לקוח</label>
          <input 
            required 
            style={inputS} 
            placeholder="הזן שם מלא" 
            onChange={e => setFormData({...formData, customer: e.target.value})} 
          />

          <label style={labelS}>2. סוג שירות</label>
          <div style={btnGroup}>
            {['חומרים', 'מכולה', 'מנוף'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                style={orderType === type ? activeTypeBtn : typeBtn}
              >
                {type === 'חומרים' && '🏗️ '}
                {type === 'מכולה' && '🗑️ '}
                {type === 'מנוף' && '🏗️ '}
                {type}
              </button>
            ))}
          </div>

          <label style={labelS}>3. פירוט הזמנה</label>
          <textarea 
            rows={4} 
            style={inputS} 
            placeholder="מה לשלוח לך?" 
            onChange={e => setFormData({...formData, details: e.target.value})}
          />

          <label style={labelS}>4. כתובת לאספקה</label>
          <input 
            required 
            style={inputS} 
            placeholder="רחוב, עיר, מספר פרויקט" 
            onChange={e => setFormData({...formData, address: e.target.value})}
          />

          <button type="submit" style={submitBtn}>שלח הזמנה לסידור 🚀</button>
        </form>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '0.8rem' }}>
        סבן חומרי בניין 1994 ©
      </footer>
    </div>
  );
}

// --- עיצובים (Styles) ---
const navStyle = { background: '#075E54', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as 'sticky', top: 0, zIndex: 100 };
const hamburgerBtn = { background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer' };
const menuOverlay = { position: 'fixed' as 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 200 };
const menuContent = { background: '#fff', width: '250px', height: '100%', padding: '20px', boxShadow: '2px 0 10px rgba(0,0,0,0.2)' };
const menuItem = { width: '100%', padding: '15px', textAlign: 'right' as 'right', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontSize: '1rem' };
const formCard = { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const labelS = { display: 'block', marginBottom: '8px', fontWeight: 'bold' as 'bold', color: '#333' };
const inputS = { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' };
const btnGroup = { display: 'flex', gap: '10px', marginBottom: '20px' };
const typeBtn = { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' };
const activeTypeBtn = { ...typeBtn, background: '#25D366', color: '#fff', borderColor: '#25D366', fontWeight: 'bold' as 'bold' };
const submitBtn = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold' as 'bold', cursor: 'pointer' };
