import "./globals.css";
import TopHeader from "@/components/TopHeader";
import MobileTabBar from "@/components/MobileTabBar";
import RouteTransition from "@/components/RouteTransition";
import { InstallProvider } from "@/components/install/InstallProvider";
import InstallPushup from "@/components/install/InstallPushup";
import ToasterClient from "@/components/ui/ToasterClient";

export const metadata = {
  title: "Entriso PDF Viewer",
  description: "Secure preview of purchased PDFs with multi-source tokens",
  manifest: "/manifest.webmanifest",
  themeColor: "#4f46e5",
  robots: "index, follow",
  keywords: "PDF viewer, secure, ebook, document, reader",
  authors: [{ name: "Entriso" }],
  openGraph: {
    title: "Entriso PDF Viewer",
    description: "Secure preview of purchased PDFs with multi-source tokens",
    type: "website",
    locale: "pl_PL",
  },
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

const firstLoadScript = `
(function(){
  if (typeof window==='undefined') return;
  var body = document.body;
  var loader = null;
  function sel(){ loader = loader || document.querySelector('.app-loader'); }
  document.addEventListener('DOMContentLoaded', function(){ sel(); if (loader) loader.removeAttribute('data-hidden'); });
  window.addEventListener('load', function(){
    setTimeout(function(){
      body.setAttribute('data-ready','1');
      setTimeout(function(){ sel(); if (loader) loader.setAttribute('data-hidden',''); }, 420);
    }, 300);
  });
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Entriso PDF" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style>{`
          :root{
            --loader-color:#4f46e5;
            --loader-draw:2.8s;      /* Faster but smooth */
            --loader-breathe:2.4s;   /* Gentle loop */
            --loader-tilt:8deg;
            --loader-glow: rgba(99, 102, 241, 0.15);
          }
          @media (max-width:480px){
            :root{ 
              --loader-draw:3.2s; 
              --loader-breathe:2.8s; 
              --loader-glow: rgba(99, 102, 241, 0.12);
            }
          }

          html,body{
            height:100%;
            background: 
              /* Base gradient */
              radial-gradient(ellipse at top left, rgba(99,102,241,0.08), transparent 40%),
              radial-gradient(ellipse at bottom right, rgba(139,92,246,0.06), transparent 40%),
              /* Solid background */
              hsl(var(--background));
          }
          body{
            margin:0;
            position:relative;
          }

          /* Enhanced background effects for entire app */
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            z-index: -10;
            pointer-events: none;
            background-image: 
              /* Subtle grid */
              linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px),
              /* Grain texture */
              url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.4"/></feComponentTransfer></filter><rect width="100" height="100" filter="url(%23grain)"/></svg>');
            background-size: 32px 32px, 32px 32px, 100px 100px;
            opacity: 0.4;
          }

          @media (prefers-color-scheme: dark) {
            body::before {
              background-image: 
                linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px),
                url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer></filter><rect width="100" height="100" filter="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
          }

          /* -------- Enhanced First-load overlay -------- */
          .app-loader{
            position:fixed; 
            inset:0; 
            z-index:9999; 
            display:grid; 
            place-items:center;
            background: hsl(var(--background));
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            padding: max(env(safe-area-inset-top),20px) 20px max(env(safe-area-inset-bottom),20px);
            color: var(--loader-color);
          }
          [data-ready="1"] .app-loader{
            opacity:0; 
            pointer-events:none;
            transform: translateY(-10px);
          }
          .app-loader[data-hidden]{ display:none }

          .app-loader__box{
            display:flex; 
            flex-direction:column; 
            align-items:center; 
            text-align:center;
            gap:16px; 
            min-width:240px;
            position: relative;
          }

          /* Enhanced loader with glow effect */
          .app-loader__svg{
            width: clamp(56px, 14vw, 96px);
            height: clamp(56px, 14vw, 96px);
            position: relative;
            filter: drop-shadow(0 4px 12px var(--loader-glow));
          }

          /* Animated gradient background for loader */
          .app-loader__svg::before{
            content:""; 
            position:absolute; 
            inset:-25%;
            border-radius: 50%;
            background: conic-gradient(
              from 0deg at 50% 50%,
              var(--loader-color) 0deg,
              rgba(99,102,241,0.8) 120deg,
              rgba(139,92,246,0.6) 240deg,
              var(--loader-color) 360deg
            );
            opacity: 0.1;
            animation: loaderRotate 8s linear infinite;
            pointer-events:none;
          }

          .app-loader__title{
            font-weight: 600; 
            font-size: 16px; 
            line-height: 1.3; 
            letter-spacing: 0.3px; 
            color: hsl(var(--foreground));
            background: linear-gradient(135deg, hsl(var(--foreground)), color-mix(in oklab, hsl(var(--foreground)) 70%, transparent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .app-loader__caption{
            font-size: 13px; 
            color: hsl(var(--muted-foreground));
            font-weight: 400;
          }

          /* Enhanced book stroke animation */
          .book-icon{
            transform-style: preserve-3d;
            animation:
              bookbreathe var(--loader-breathe) ease-in-out calc(var(--loader-draw) + 0.3s) infinite,
              booktilt var(--loader-breathe) ease-in-out calc(var(--loader-draw) + 0.3s) infinite;
          }
          .book-path{
            stroke: currentColor; 
            stroke-width: 0.6;
            fill: none; 
            stroke-linecap: round; 
            stroke-linejoin: round;
            stroke-dasharray: 280; 
            stroke-dashoffset: 280;
            animation: bookdraw var(--loader-draw) cubic-bezier(0.65, 0, 0.35, 1) forwards;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          }
          @keyframes bookdraw { 
            to { 
              stroke-dashoffset: 0; 
            } 
          }
          @keyframes bookbreathe {
            0%   { transform: translateY(0) scale(1); opacity: 1 }
            50%  { transform: translateY(-2px) scale(1.02); opacity: 0.95 }
            100% { transform: translateY(0) scale(1); opacity: 1 }
          }
          @keyframes booktilt {
            0%   { transform: rotateX(0) rotateY(0) }
            33%  { transform: rotateX(1deg) rotateY(calc(var(--loader-tilt) * -0.15)) }
            66%  { transform: rotateX(-0.5deg) rotateY(calc(var(--loader-tilt) * 0.1)) }
            100% { transform: rotateX(0) rotateY(0) }
          }
          @keyframes loaderRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* Enhanced progress bar with gradient */
          .app-loader__bar{
            width: min(300px, 75vw); 
            height: 4px; 
            border-radius: 999px;
            background: color-mix(in oklab, var(--loader-color) 12%, transparent);
            overflow: hidden; 
            position: relative; 
            margin-top: 4px;
            backdrop-filter: blur(8px);
          }
          .app-loader__bar::after{
            content: ""; 
            position: absolute; 
            inset: 0; 
            width: 35%;
            background: linear-gradient(
              90deg, 
              transparent, 
              var(--loader-color), 
              color-mix(in oklab, var(--loader-color) 80%, white), 
              transparent
            );
            transform: translateX(-100%); 
            border-radius: inherit; 
            opacity: 0.8;
            animation: loaderbar 1.8s ease-in-out 0.3s infinite;
          }
          @keyframes loaderbar{
            0%{ transform: translateX(-100%) }
            60%{ transform: translateX(200%) }
            100%{ transform: translateX(200%) }
          }

          /* Enhanced blur and scale effect for app root */
          .app-root{ 
            transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: 100vh;
            position: relative;
          }
          body:not([data-ready="1"]) .app-root{
            filter: blur(12px) saturate(0.9) brightness(0.97);
            transform: scale(0.988);
            pointer-events: none;
            opacity: 0.8;
          }

          /* Enhanced Route enter animation */
          .rt{ 
            will-change: opacity, transform, filter;
            position: relative;
          }
          .rt-enter{ 
            animation: rtFadeLift 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
          }
          @keyframes rtFadeLift{
            0%   { 
              opacity: 0; 
              transform: translateY(12px) scale(0.99); 
              filter: saturate(0.9) brightness(0.98);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
              filter: none;
            }
          }

          /* Enhanced focus states for accessibility */
          .focus-enhanced:focus-visible {
            outline: 2px solid hsl(var(--primary));
            outline-offset: 2px;
            border-radius: 4px;
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Enhanced selection */
          ::selection {
            background-color: color-mix(in oklab, hsl(var(--primary)) 20%, transparent);
            color: hsl(var(--primary-foreground));
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce){
            .app-root{ 
              transition: opacity 0.3s ease;
            }
            .rt-enter{ 
              animation: none;
              opacity: 1;
            }
            .book-icon{ 
              animation: none;
            }
            .book-path{ 
              animation: none; 
              stroke-dashoffset: 0;
            }
            .app-loader__svg::before{ 
              display: none;
            }
            .app-loader__bar::after{ 
              animation: none; 
              transform: translateX(0); 
              background: var(--loader-color);
              width: 100%;
            }
            html {
              scroll-behavior: auto;
            }
            @keyframes rtFadeLift{
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          }

          /* Enhanced mobile optimizations */
          @media (max-width: 768px) {
            .app-loader__box {
              gap: 14px;
              min-width: 200px;
            }
            .app-loader__title {
              font-size: 15px;
            }
            .app-loader__caption {
              font-size: 12px;
            }
          }

          /* Dark mode enhancements */
          @media (prefers-color-scheme: dark) {
            body:not([data-ready="1"]) .app-root{
              filter: blur(12px) saturate(0.85) brightness(0.95);
            }
            .app-loader__title {
              background: linear-gradient(135deg, hsl(var(--foreground)), color-mix(in oklab, hsl(var(--foreground)) 80%, transparent));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
          }
        `}</style>
      </head>
      <body className="antialiased">
        {/* Enhanced First-load overlay */}
        <div className="app-loader" aria-hidden data-hidden>
          <div className="app-loader__box" role="status" aria-live="polite" aria-label="Ładowanie aplikacji Entriso PDF">
            <svg className="app-loader__svg" viewBox="0 0 24 24" fill="none" aria-hidden>
              <g className="book-icon">
                <path
                  className="book-path"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </g>
            </svg>
            <div className="app-loader__title">Inicjalizacja Entriso PDF</div>
            <div className="app-loader__bar" aria-hidden="true" />
            <div className="app-loader__caption" aria-hidden>Przygotowywanie bezpiecznego środowiska...</div>
          </div>
        </div>

        {/* Enhanced App content */}
        <InstallProvider>
          <div className="app-root">
            <TopHeader />
            <main className="min-h-screen">
              <RouteTransition>{children}</RouteTransition>
            </main>
          </div>

          {/* Mobile bottom tabs */}
          <MobileTabBar />

          {/* Enhanced install prompt */}
          <InstallPushup />
        </InstallProvider>

        <ToasterClient />

        <script 
          dangerouslySetInnerHTML={{ __html: firstLoadScript }} 
          suppressHydrationWarning
        />
        <script 
          dangerouslySetInnerHTML={{ __html: swRegisterScript }} 
          suppressHydrationWarning
        />
      </body>
    </html>
  );
}