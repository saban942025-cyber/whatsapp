import Papa from 'papaparse';

export const parseSabanCsv = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as any[];
        try {
          // חילוץ לפי השבלונה של סבן (שורות 3, 5, 7 וכו')
          const orderData = {
            date: rows[2]?.[7]?.replace('תאריך:', '').trim() || new Date().toLocaleDateString('he-IL'),
            orderId: rows[4]?.[1]?.split(' ')[0] || '6211340', // מספר הזמנה לדוגמה
            customerName: rows[6]?.[0]?.trim() || 'לקוח כללי',
            // פריטים מתחילים משורה 12 (אינדקס 11)
            items: rows.slice(11)
              .filter(row => row[1] && row[2] && !isNaN(row[1])) // מוודא שיש מק"ט
              .map(row => ({
                sku: row[1],
                name: row[2],
                quantity: row[4],
                unit: row[3]
              }))
          };
          resolve(orderData);
        } catch (e) {
          reject("מבנה קובץ לא תואם לשבלונה");
        }
      },
      error: (err) => reject(err)
    });
  });
};
