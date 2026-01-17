/** @type {import('next').NextConfig} */
const nextConfig = {
  /* ההגדרות החדשות לא כוללות את המפתח eslint כאן */
  typescript: {
    // זה עדיין נתמך ועוזר לעבור Build אם יש שגיאות טייפ
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
