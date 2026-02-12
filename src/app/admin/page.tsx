'use client'
import React from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const links = [
    { name: "הפעלת זיכרון (Seed)", path: "/seed" },
    { name: "צ'אט וואטסאפ", path: "/chat" },
    { name: "לוח בקרה", path: "/admin/dashboard" },
    { name: "ניתוח איתוראן", path: "/admin/analysis" }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-right" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">מרכז שליטה ח. סבן</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((l, i) => (
          <Link key={i} href={l.path} className="p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all font-bold text-blue-600 text-center">
            {l.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
