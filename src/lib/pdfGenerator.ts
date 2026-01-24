import { PDFDocument, rgb } from 'pdf-lib';

export async function overlayDriverDataOnPDF(originalPdfUrl: string, data: any) {
  // 1. טעינת התעודה המקורית (למשל teast1.pdf)
  const existingPdfBytes = await fetch(originalPdfUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // 2. הזרקת שעת הגעה (לפי הקואורדינטות בתעודות של סבן)
  firstPage.drawText(data.arrivalTime, {
    x: 430, // אזור ה"שעה" בתעודה
    y: 710,
    size: 11,
    color: rgb(0, 0, 0.6),
  });

  // 3. הזרקת מיקום GPS כחותמת אמינות (עין עיוורת)
  firstPage.drawText(`GPS Verified: ${data.coords}`, {
    x: 50,
    y: 15,
    size: 7,
    color: rgb(0.5, 0.5, 0.5),
  });

  // 4. הזרקת חתימה
  if (data.signature) {
    const signatureImage = await pdfDoc.embedPng(data.signature);
    firstPage.drawImage(signatureImage, {
      x: 100, // מעל המילה "חתימה"
      y: 80,
      width: 120,
      height: 40,
    });
  }

  return await pdfDoc.save();
}
