'use client'
import React from 'react';
import Link from 'next/link';
import { Brain, MessageSquare, Database, UserCheck, BarChart3 } from 'lucide-react';

export default function AdminControlCenter() {
  const cards = [
    { title: "הפעלת המוח (Setup)", link: "/seed", icon: <Database />, color: "bg-green-500" },
    { title: "צ'אט וואטסאפ חי", link: "/chat", icon: <MessageSquare />, color: "bg-teal-600" },
    { title: "תיקיית לקוח חכמה", link: "/client/שחר_שאול", icon: <UserCheck />, color: "bg-orange-500" },
    { title: "חיזוק המוח", link: "/admin/rules", icon: <Brain />, color: "bg-purple-600" },
    { title: "לוח בקרה לוגיסטי", link: "/admin/dashboard", icon: <BarChart3 />, color: "bg-slate-700" },
  ];

  return (
    <div className="min-h-screen bg-[#F3F2F1] p-8 rtl" dir="rtl">
      <h1 className="text-3xl font-black text-[#323130] mb-8 text-center uppercase tracking-tighter">
        ח. סבן - מרכז שליטה AI
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {cards.map((c, i) => (
          <Link href={c.link} key={i} className="group transition-all">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDEBE9] hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className={`${c.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 shadow-lg`}>
                {c.icon}
              </div>
              <h2 className="text-xl font-bold text-[#323130]">{c.title}</h2>
              <p className="text-sm text-[#605E5C] mt-2 italic">ניהול ידע ותהליכי לוגיסטיקה מול הלקוח.</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
