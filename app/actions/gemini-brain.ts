import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/src/data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanResponse(userInput: string, clientId: string = "שחר_שאול") {
  try {
    // שליפת הזיכרון המצטבר מה-Firebase
    const memoryRef = doc(db, "customer_memory", clientId);
    const memorySnap = await getDoc(memoryRef);
    const memoryData = memorySnap.exists() ? memorySnap.data() : null;

    const customerContext = memoryData ? `
      מידע מהזיכרון המצטבר על ${memoryData.name}:
      - תובנות: ${memoryData.accumulatedKnowledge}
      - פרויקטים: ${JSON.stringify(memoryData.projects)}
      - העדפות: ${memoryData.preferences?.deliveryMethod}, שעות: ${memoryData.preferences?.preferredHours}
    ` : "לקוח חדש.";

    const systemInstruction = `
      אתה "המוח של ח. סבן". נציג מכירות חכם בוואטסאפ.
      הנחיות:
      1. פנה ללקוח בשמו הפרטי: ${memoryData?.name || clientId}.
      2. השתמש בידע הארגוני: ${JSON.stringify(sabanMasterBrain)}.
      3. התבסס על זיכרון הלקוח: ${customerContext}.
      4. נהל תהליך קנייה מלא: שאל על הפרויקט, ודא סוג הובלה (מנוף/מכולה), וסגור הזמנה בברכת "נתראה בהזמנה הבאה".
      5. סגנון: וואטסאפ קצר עם אימוג'ים 🏗️🚚.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(userInput);
    return result.response.text();
  } catch (error) {
    console.error("Brain Error:", error);
    return "שגיאה בחיבור למוח של סבן. נסה שוב מאוחר יותר.";
  }
}
