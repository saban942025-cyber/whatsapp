// פונקציה לשליפת היסטוריה וחיזוי
const fetchCustomerBrain = async (phone) => {
  const q = query(collection(db, "orders"), where("phone", "==", phone), orderBy("timestamp", "desc"), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const lastOrder = querySnapshot.docs[0].data();
    // עדכון הממשק עם הצעות חכמות מבוססות עבר
    setFormData({
      ...formData,
      address: lastOrder.address, // מילוי אוטומטי של הכתובת האחרונה
      orderType: lastOrder.orderType // הצעה לסוג הזמנה זהה
    });
    return lastOrder;
  }
};
