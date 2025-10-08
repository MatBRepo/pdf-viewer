import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Entriso PDF Viewer",
  description: "Secure preview of purchased PDFs with multi-source tokens",
  manifest: "/manifest.webmanifest",
  themeColor: "#4f46e5",
};

const swRegisterScript = `
(function() {
  if (typeof window==='undefined') return;
  var enable = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_ENABLE_SW) || '0';
  if (enable !== '1') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    }
    return;
  }
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    });
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <NavBar />
        {children}
        <script dangerouslySetInnerHTML={{__html: swRegisterScript}} />
      </body>
    </html>
  );
}
