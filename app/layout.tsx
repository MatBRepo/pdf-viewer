import "./globals.css";
import TopHeader from "@/components/TopHeader";
import MobileTabBar from "@/components/MobileTabBar";
import RouteTransition from "@/components/RouteTransition";
import { InstallProvider } from "@/components/install/InstallProvider";
import InstallPushup from "@/components/install/InstallPushup";

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
        <link rel="manifest" href="/manifest.webmanifest" />
        <style>{`
          :root{
            --loader-color:#4f46e5;
            --loader-draw:3.4s;      /* a touch quicker but still calm */
            --loader-breathe:3.0s;   /* gentle loop */
            --loader-tilt:6deg;
          }
          @media (max-width:480px){
            :root{ --loader-draw:3.8s; --loader-breathe:3.2s; }
          }

          html,body{height:100%}
          body{margin:0}

          /* -------- First-load overlay (clean & professional) -------- */
          .app-loader{
            position:fixed; inset:0; z-index:9999; display:grid; place-items:center;
            background:transparent; transition:opacity .45s ease;
            padding:max(env(safe-area-inset-top),16px) 16px max(env(safe-area-inset-bottom),16px);
            color:var(--loader-color);
          }
          [data-ready="1"] .app-loader{opacity:0; pointer-events:none}
          .app-loader[data-hidden]{display:none}

          .app-loader__box{
            display:flex; flex-direction:column; align-items:center; text-align:center;
            gap:12px; min-width:200px;
          }

          /* Smaller, tidy icon */
          .app-loader__svg{
            width: clamp(44px, 12vw, 84px);
            height: clamp(44px, 12vw, 84px);
            position: relative;
          }
          /* very subtle halo */
          .app-loader__svg::before{
            content:""; position:absolute; inset:-18%;
            border-radius:999px; filter:blur(14px);
            background: radial-gradient(closest-side, color-mix(in oklab, var(--loader-color) 40%, transparent), transparent 70%);
            opacity:.16; pointer-events:none;
          }

          .app-loader__title{
            font-weight:600; font-size:14px; line-height:1.25; letter-spacing:.2px; color:#0f172a;
          }
          .app-loader__caption{
            font-size:12px; color:#475569;
          }

          /* Book stroke animation (thin & crisp) */
          .book-icon{
            transform-style:preserve-3d;
            animation:
              bookbreathe var(--loader-breathe) ease-in-out calc(var(--loader-draw) + .4s) infinite,
              booktilt var(--loader-breathe) ease-in-out calc(var(--loader-draw) + .4s) infinite;
          }
          .book-path{
            stroke: currentColor; stroke-width: .5;
            fill: none; stroke-linecap: round; stroke-linejoin: round;
            stroke-dasharray: 240; stroke-dashoffset: 240;
            animation: bookdraw var(--loader-draw) ease-out forwards;
          }
          @keyframes bookdraw { to { stroke-dashoffset: 0; } }
          @keyframes bookbreathe {
            0%   { transform: translateY(0)    scale(1);     opacity:1 }
            50%  { transform: translateY(-1.5px) scale(1.012); opacity:.98 }
            100% { transform: translateY(0)    scale(1);     opacity:1 }
          }
          @keyframes booktilt {
            0%   { transform: rotateX(0) rotateY(0) }
            50%  { transform: rotateX(.5deg) rotateY(calc(var(--loader-tilt) * -0.1)) }
            100% { transform: rotateX(0) rotateY(0) }
          }

          /* Professional progress bar */
          .app-loader__bar{
            width:min(280px, 70vw); height:3px; border-radius:999px;
            background: color-mix(in oklab, var(--loader-color) 18%, transparent);
            overflow:hidden; position:relative; margin-top:2px;
          }
          .app-loader__bar::after{
            content:""; position:absolute; inset:0; width:42%;
            background: linear-gradient(90deg, transparent, var(--loader-color), transparent);
            transform:translateX(-100%); border-radius:inherit; opacity:.9;
            animation: loaderbar 1.6s ease-in-out .2s infinite;
          }
          @keyframes loaderbar{
            0%{ transform:translateX(-100%) }
            55%{ transform:translateX(160%) }
            100%{ transform:translateX(160%) }
          }

          /* Blur app under loader once */
          .app-root{ transition:filter .45s ease, transform .45s ease }
          body:not([data-ready="1"]) .app-root{
            filter: blur(10px) saturate(.95) brightness(.98);
            transform: scale(.992);
            pointer-events: none;
          }

          /* -------- Route enter animation (no overlay) -------- */
          .rt{ will-change: opacity, transform, filter }
          .rt-enter{ animation: rtFadeLift .34s ease both }
          @keyframes rtFadeLift{
            0%   { opacity:0; transform: translateY(8px) scale(.995); filter: saturate(.98) }
            100% { opacity:1; transform: translateY(0)   scale(1);    filter: none }
          }

          @media (prefers-reduced-motion:reduce){
            .app-root{ transition:none }
            .rt-enter{ animation:none }
            .book-icon{ animation:none }
            .book-path{ animation:none; stroke-dashoffset:0 }
            .app-loader__svg::before{ display:none }
            .app-loader__bar::after{ animation:none; transform:none; background: var(--loader-color) }
          }
        `}</style>
      </head>
      <body>
        {/* First-load only */}
        <div className="app-loader" aria-hidden data-hidden>
          <div className="app-loader__box" role="status" aria-live="polite" aria-label="Ładowanie aplikacji">
            <svg className="app-loader__svg" viewBox="0 0 24 24" fill="none" aria-hidden>
              <g className="book-icon">
                <path
                  className="book-path"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </g>
            </svg>
            <div className="app-loader__title">Ładowanie…</div>
            <div className="app-loader__bar" />
            <div className="app-loader__caption" aria-hidden>Proszę czekać</div>
          </div>
        </div>

        {/* App content (blurred until ready) */}
        <InstallProvider>
          <div className="app-root">
            <TopHeader />
            <RouteTransition>{children}</RouteTransition>
          </div>

          {/* Mobile bottom tabs (portaled; truly fixed) */}
          <MobileTabBar />

          {/* First-visit push-up to trigger native install (Android/Chrome) */}
          <InstallPushup />
        </InstallProvider>

        <script dangerouslySetInnerHTML={{ __html: firstLoadScript }} />
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </body>
    </html>
  );
}
