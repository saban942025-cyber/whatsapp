/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // <--- חובה! זה מייצר את תיקיית "out" הסטטית
  images: {
    unoptimized: true,   // חובה! מונע שבירת תמונות בייצוא סטטי
  },
  eslint: {
    ignoreDuringBuilds: true, // מונע עצירה של הבנייה בגלל שטויות
  },
};

export default nextConfig;
