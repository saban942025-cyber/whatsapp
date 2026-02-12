import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGYsZylsIyeWudp8_SlnLBelkgoNXjU60",
  authDomain: "app-saban94-57361.firebaseapp.com",
  databaseURL: "https://app-saban94-57361-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.firebasestorage.app",
  messagingSenderId: "275366913167",
  appId: "1:275366913167:web:f0c6f808e12f2aeb58fcfa",
  measurementId: "G-E297QYKZKQ"
};

// אתחול Singleton למניעת קריסות ב-Next.js ו-Vercel
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ייצוא השירותים
export const db = getFirestore(app);           // עבור "המוח", זיכרון לקוחות והזמנות
export const database = getDatabase(app);     // עבור נתוני איתוראן ודוחות יומיים
export const storage = getStorage(app);       // עבור סריקת תעודות משלוח (OCR)
