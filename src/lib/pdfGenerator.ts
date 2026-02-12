import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateDeliveryNote = async (order: any) => {
  // 1. יצירת המסמך (A4)
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  // 2. הגדרת פונט עברי (חשוב: וודא שיש לך קובץ NotoSansHebrew-Regular.ttf בתיקיית public/fonts)
  // הערה: בגרסה הבסיסית jsPDF משתמש בפונטים מובנים. לעברית מלאה מומלץ להטעין פונט TTF.
  // כרגע נשתמש בהגדרות יישור לימין.
  
  const pageWidth = doc.internal.pageSize.width;
  
  // 3. כותרת עליונה
  doc.setFontSize(22);
  doc.setTextColor(7, 94, 84); // צבע ירוק "סבן"
  doc.text("ח. סבן - תעודת משלוח", pageWidth / 2, 20, { align: "center" });

  // 4. פרטי הזמנה
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const rightAlign = pageWidth - 20;

  doc.text(`לקוח: ${order.customerName}`, rightAlign, 40, { align: "right" });
  doc.text(`מספר הזמנה: ${order.orderId}`, rightAlign, 48, { align: "right" });
  doc.text(`תאריך: ${order.date}`, rightAlign, 56, { align: "right" });
  doc.text(`פרויקט: ${order.project || 'כללי'}`, rightAlign, 64, { align: "right" });

  // 5. יצירת טבלת מוצרים
  const columns = [
    { header: 'סה"כ', dataKey: 'total' },
    { header: 'כמות', dataKey: 'quantity' },
    { header: 'תיאור מוצר', dataKey: 'name' },
    { header: 'מק"ט', dataKey: 'sku' },
  ];

  const rows = order.items.map((item: any) => ({
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    total: "" // מקום לחתימה או הערה
  }));

  (doc as any).autoTable({
    startY: 75,
    margin: { horizontal: 20 },
    body: rows,
    columns: columns,
    styles: {
      font: "helvetica", // לעברית מלאה יש להחליף לפונט המוטען
      halign: 'right',
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [7, 94, 84],
      textColor: [255, 255, 255],
      fontSize: 11,
      halign: 'right',
    },
    columnStyles: {
      sku: { cellWidth: 30 },
      quantity: { cellWidth: 20, halign: 'center' },
    }
  });

  // 6. חתימה בתחתית הדף
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.text("_________________ :חתימת הלקוח", rightAlign, finalY, { align: "right" });
  doc.text("_________________ :חתימת הנהג", 20, finalY, { align: "left" });

  // 7. שמירה/הורדה של הקובץ
  doc.save(`Delivery_Note_${order.orderId}.pdf`);
};
