import type { Metadata } from "next";
import Script from "next/script"; // חשוב להשתמש בזה ב-Next.js

export const metadata: Metadata = {
  title: "סבן 94 - הזמנה חכמה",
  description: "מערכת הזמנות חומרי בניין ומכולות",
  manifest: "/manifest.json", // מוודא שהאפליקציה ניתנת להתקנה
  icons: {
    icon: "/logo.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* טעינת ה-SDK של OneSignal */}
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "673ca43a-a57e-4859-a111-878c87e696c0",
                safari_web_id: "optional_id_if_needed",
                notifyButton: {
                  enable: true,
                },
              });
            });
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
