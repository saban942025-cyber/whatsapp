'use client'
import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Howl } from 'howler';
import { 
  Send, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  BellRing, 
  AlertTriangle 
} from 'lucide-react';

export default function ChatPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const soundRef = useRef<Howl | null>(null);

  // 1. אתחול הצלצול
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/notification.mp3'], // וודא שהקובץ נמצא בתיקיית public
      html5: true,
      volume: 1.0,
      preload: true
    });

    return () => {
      if (soundRef.current) soundRef.current.unload();
    };
  }, []);

  // 2. פונקציית השמעת הצלצול
  const playNotification = () => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  };

  // 3. האזנה לשינויים ב-Firebase והפעלת צלצול בחריגה
  useEffect(() => {
    const clientId = params.id || 'שחר_שאול';
    const unsub = onSnapshot(doc(db, 'customer_memory', clientId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomer(data);

        // בדיקה אם יש מכולה בחריגה (overdue)
        const hasOverdue = data.rentals?.containers?.some((c: any) => c.status === 'overdue');
        if (hasOverdue) {
          playNotification(); // הצלצול יופעל כשיש חריגה
        }
      }
    });

    return () => unsub();
  }, [params.id]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    // כאן תבוא הלוגיקה של שליחת הודעה
    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white/20">
            <img src={customer?.profileImage || "/default-avatar.png"} alt="profile" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{customer?.name || 'טוען...'}</h2>
            <span className="text-xs text-green-200">מחובר (המוח של סבן פעיל)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <BellRing size={20} className="cursor-pointer hover:text-green-300" onClick={playNotification} />
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* התראת חריגה מעוצבת */}
        {customer?.rentals?.containers?.some((c: any) => c.status === 'overdue') && (
          <div className="bg-red-100 border-r-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center gap-3 animate-pulse">
            <AlertTriangle className="text-red-600" />
            <div>
              <p className="text-red-800 font-bold text-sm">חריגת זמן מכולה!</p>
              <p className="text-red-700 text-xs">מכולה 8 קוב (82002) חורגת מ-10 ימים בווילה רעננה.</p>
            </div>
          </div>
        )}

        {/* בועות הודעה (דוגמה) */}
        <div className="bg-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] self-start">
          <p className="text-sm">שלום {customer?.name}, כאן המוח של סבן. זיהיתי שההזמנה שלך מהאקסל (גבס וסומסום) בהכנה במחסן.</p>
          <span className="text-[10px] text-gray-400 block text-left">09:00</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#F0F2F5] p-3 flex items-center gap-2">
        <Smile className="text-gray-500 cursor-pointer" />
        <Paperclip className="text-gray-500 cursor-pointer" />
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="הקלד הודעה..."
          className="flex-1 p-3 bg-white rounded-full outline-none text-sm shadow-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <div 
          onClick={handleSend}
          className="bg-[#128C7E] p-3 rounded-full text-white cursor-pointer hover:bg-[#075E54] transition-all"
        >
          <Send size={20} />
        </div>
      </div>
    </div>
  );
}
