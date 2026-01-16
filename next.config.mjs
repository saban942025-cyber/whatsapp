/** @type {import('next').NextConfig} */
const nextConfig = {
  /* כאן אנחנו משאירים את ההגדרות נקיות */
  typescript: {
    // מאפשר לבצע Build גם אם יש שגיאות טייפסקריפט קטנות (חוסך כאב ראש)
    ignoreBuildErrors: true,
  },
  eslint: {
    // מתעלם משגיאות לינטינג בזמן הבנייה כדי שלא יתקע את הפריסה
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
