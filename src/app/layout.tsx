export const metadata = {
  title: 'סבן 94 - הזמנות',
  description: 'מערכת הזמנות חכמה',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
