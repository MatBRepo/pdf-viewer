// app/layout.tsx
import "./globals.css";
import TopHeader from "@/components/TopHeader";
import MobileTabBar from "@/components/MobileTabBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <TopHeader />
        {/* Your content wrapper can animate/transform freely */}
        {children}
        {/* Bottom tabs are portaled → true fixed on iOS */}
        <MobileTabBar />
        {/* your SW registration script if you use one */}
      </body>
    </html>
  );
}
