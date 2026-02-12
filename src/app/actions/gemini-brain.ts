import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
// וודא שהקובץ הזה קיים בנתיב המצוין במאגר שלך
import sabanMasterBrain from "../../data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanResponse(userInput: string, clientId: string = "שחר_שאול") {
  try {
    const docRef = doc(db, "customer_memory", clientId);
    const snap = await getDoc(docRef);
    const memory = snap.exists() ? snap.data() : null;

    const context = memory ? `
      שם הלקוח: ${memory.name}
      ידע מצטבר: ${memory.accumulatedKnowledge}
      פרויקטים: ${JSON.stringify(memory.projects)}
    ` : "לקוח חדש.";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `אתה המוח של ח. סבן. פנה ללקוח בשמו: ${memory?.name || clientId}. 
      השתמש בידע הארגוני: ${JSON.stringify(sabanMasterBrain)}. 
      השתמש בזיכרון הלקוח: ${context}. 
      נהל שיחה בסגנון וואטסאפ קצר וענייני.`
    });

    const result = await model.generateContent(userInput);
    return result.response.text();
  } catch (error) {
    console.error("Error:", error);
    return "שגיאה בחיבור למוח של סבן.";
  }
}
