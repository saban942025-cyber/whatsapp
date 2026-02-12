import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
// וודא שהקובץ קיים בנתיב המצוין
import sabanMasterBrain from "@/data/saban_master_brain.json";
// אתחול ה-AI עם המפתח והמודל העדכני ביותר (Gemini 3 Flash Preview)
const genAI = new GoogleGenerativeAI("AIzaSyB2dWSf3LChRP1dVhOVKIoprUBnX8M5PA8");
/**
 * פונקציה לשליפת הזיכרון המצטבר של הלקוח מה-Firebase
 */
async function fetchCustomerContext(clientId: string) {
  try {
    const docRef = doc(db, "customer_memory", clientId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return `
        מידע מצטבר על הלקוח מהזיכרון:
        - שם: ${data.name}
        - תובנות למידה: ${data.accumulatedKnowledge}
        - פרויקטים פעילים: ${JSON.stringify(data.projects)}
        - העדפות לוגיסטיות: ${data.preferences?.deliveryMethod || "לא הוגדר"}
      `;
    }
    return "לקוח חדש במערכת. יש ללמוד את צרכיו במהלך השיחה.";
  } catch (error) {
    console.error("Error fetching context:", error);
    return "שגיאה בשליפת נתונים.";
  }
}

/**
 * המוח המרכזי - מבוסס Gemini 3 Flash
 */
export async function getSabanResponse(userInput: string, clientId: string = "שחר_שאול") {
  try {
    const customerMemory = await fetchCustomerContext(clientId);

    const systemInstruction = `
      אתה "המוח של ח. סבן" - עוזר אישי חכם מבוסס Gemini 3.
      תפקידך לנהל תהליך מכירה ושירות לוגיסטי מלא ב-100% אוטונומיה.

      חוקי עבודה:
      1. אישיות: פנה ללקוח בשמו (${clientId}). השתמש באימוג'ים 🏗️🚚.
      2. ידע ארגוני: התבסס על מחירוני סבן: ${JSON.stringify(sabanMasterBrain)}.
      3. זיכרון לקוח: השתמש בידע שנצבר על הלקוח: ${customerMemory}.
      4. לוגיקה: אם הלקוח מזמין לאתר בנייה, ודא בזיכרון אם יש מגבלות גישה (למשל רחוב צר הדורש מנוף ספציפי).
      5. סגנון: וואטסאפ מהיר, מקצועי ומניע לפעולה.
    `;

    // שימוש במודל החדש ביותר שהושק ב-21 בינואר 2026
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", 
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini 3 Error:", error);
    return "מצטער, המוח של סבן זקוק לאתחול קל. נסה שוב בעוד רגע.";
  }
}
