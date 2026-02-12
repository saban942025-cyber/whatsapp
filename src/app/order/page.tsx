'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { Truck, Calendar, Activity, Clock, Calculator, ShoppingCart, Send, ArrowRight, Search, Plus, Trash2, ShieldCheck, Package, Info } from 'lucide-react';
import Link from 'next/link';

// --- מוח שחר שאול: נתונים מלוטשים מה-JSON המאוחד ---
const SHAHAR_BRAIN = {
  clientName: "שחר שאול",
  activeProject: "גלגל המזלות 73",
  products: [
    {
      brand: "תרמוקיר",
      name: "פלסטומר 603 (AD 603) C2TE S1",
      category: "דבקים",
      unit: "שק 25 ק״ג",
      formula: { type: "kg_mm", factor: 1.4 },
      expert_tip: "לפורצלן בגלגל המזלות: מומלץ עובי 5 מ״מ עם מריחה כפולה.",
      linked: ["פריימר מקשר", "ספייסרים 3 מ״מ"]
    },
    {
      brand: "נירלט",
      name: "שליכט צבעוני EXTRA M150",
      category: "שליכט",
      unit: "דלי 24 ק״ג",
      formula: { type: "yield", factor: 10.5 },
      expert_tip: "חובה ליישם פריימר X בגוון השליכט 24 שעות מראש.",
      linked: ["פריימר X", "ניילון הגנה (גליל)"]
    },
    {
      brand: "Sika",
      name: "SikaTop Seal-107 איטום",
      category: "איטום",
      unit: "סט 25 ק״ג",
      formula: { type: "kg_mm", factor: 2.0 },
      expert_tip: "איטום בשתי שכבות (4 ק״ג למ״ר סה״כ). הרטב את הבטון מראש.",
      linked: ["מברשת איטום", "סיקה סיל-טייפ"]
    },
    {
      brand: "אורבונד",
      name: "לוח גבס ירוק (עמיד לחות)",
      category: "גבס",
      unit: "לוח (3 מ״ר)",
      formula: { type: "pieces", factor: 3 },
      expert_tip: "במקלחות: השתמש רק בברגים מושחרים וסרט שריון.",
      linked: ["ברגי גבס 25 מ״מ", "סרט שריון פיברגלס"]
    }
  ]
};

export default function ShaharShaulOrder() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [calc, setCalc] = useState({ sqm: '', thick: '5' });
  const [expertMsg, setExpertMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return [];
    return SHAHAR_BRAIN.products.filter(p => p.name.includes(search) || p.brand.includes(search));
  }, [search]);

  const calculateQty = (p: any) => {
    const area = parseFloat(calc.sqm);
    if (!area) return 1;
    if (p.formula.type === "kg_mm") return Math.ceil((area * parseFloat(calc.thick) * p.formula.factor) / 25);
    if (p.formula.type === "yield") return Math.ceil(area / p.formula.factor);
    if (p.formula.type === "pieces") return Math.ceil(area / p.formula.factor);
    return 1;
  };

  const addToCart = (p: any) => {
    const qty = calculateQty(p);
    setCart([...cart, { ...p, qty }]);
    if (p.linked.length) {
      setExpertMsg(`שחר, המוח ממליץ להוסיף ${p.linked.join(', ')} להשלמת הביצוע 🫂`);
      setTimeout(() => setExpertMsg(null), 6000);
    }
    setSearch('');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      {/* Header יוקרתי */}
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800 tracking-tight italic">ח. סבן – {SHAHAR_BRAIN.clientName}</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{SHAHAR_BRAIN.activeProject}</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6">
        {/* מחשבון שטח (לבן-קרם) */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
          <label className="text-xs font-black text-gray-400 mb-3 block flex items-center gap-2">
            <Calculator size={16} className="text-blue-500" /> הזן נתוני שטח למחשבון:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" placeholder="כמות מ״ר" 
              className="p-4 rounded-2xl bg-[#FDFBF7] border-none font-black text-xl text-blue-600 focus:ring-2 focus:ring-blue-100"
              value={calc.sqm} onChange={e => setCalc({...calc, sqm: e.target.value})}
            />
            <input 
              type="number" placeholder="עובי מ״מ" 
              className="p-4 rounded-2xl bg-[#FDFBF7] border-none font-black text-xl text-blue-600 focus:ring-2 focus:ring-blue-100"
              value={calc.thick} onChange={e => setCalc({...calc, thick: e.target.value})}
            />
          </div>
        </div>

        {/* חיפוש */}
        <div className="relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" placeholder="חפש חומר (דבק, שליכט...)" 
            className="w-full p-5 pr-14 bg-white rounded-3xl shadow-sm border-none font-bold text-lg"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* תוצאות חיפוש */}
        {filtered.map((p, i) => (
          <div key={i} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex justify-between items-center animate-in fade-in" onClick={() => addToCart(p)}>
            <div>
              <h4 className="font-black text-gray-800">{p.name}</h4>
              <p className="text-[10px] text-blue-500 font-bold uppercase">{p.brand} | {p.unit}</p>
              {calc.sqm && <p className="text-xs text-green-600 font-black mt-2 animate-pulse"><Package size={14} className="inline ml-1" /> המלצת המוח: {calculateQty(p)} יח׳</p>}
              <p className="text-[10px] text-gray-400 italic mt-1 leading-tight">{p.expert_tip}</p>
            </div>
            <div className="bg-[#1976D2] text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-all"><Plus size={24} /></div>
          </div>
        ))}

        {/* הודעת מומחה */}
        {expertMsg && (
          <div className="bg-[#FFF9E6] p-5 rounded-[25px] border border-yellow-100 flex items-center gap-4 animate-bounce">
            <ShieldCheck className="text-yellow-600" size={24} />
            <p className="text-xs font-bold text-yellow-800 leading-relaxed">{expertMsg}</p>
          </div>
        )}

        {/* סל הזמנה */}
        {cart.length > 0 && (
          <section className="bg-white rounded-[40px] p-8 shadow-2xl border-t-8 border-[#1976D2] space-y-6">
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2"><ShoppingCart size={24} className="text-blue-600" /> סיכום הזמנה לאתר:</h3>
            <div className="space-y-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-xl font-black italic">x{item.qty}</span>
                    <button onClick={() => setCart(cart.filter(c => c.name !== item.name))} className="text-red-300"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => alert("הזמנת שחר שאול נשלחה ל-365 ולנהג! 🎉")} className="w-full bg-[#1976D2] text-white py-5 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
               שלח הזמנה לביצוע <Send size={20} />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
