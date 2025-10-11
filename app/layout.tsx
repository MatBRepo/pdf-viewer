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

const appLoaderScript = `
(function(){
  if (typeof window==='undefined') return;
  var body = document.body;
  var root = null, bar = null, pageTurn = null;
  var pct = 0, t = null, startAt = 0, didFirstLoad = false;

  function sel(){
    root = root || document.querySelector('.app-loader');
    bar  = bar  || (root && root.querySelector('.app-loader__bar'));
    pageTurn = pageTurn || document.querySelector('.page-turn');
  }
  function setPct(p){ pct = Math.max(0, Math.min(100, p)); if(bar){ bar.style.transform = 'scaleX('+(pct/100)+')'; } }
  function tick(){ setPct(pct + (100-pct)*0.018); t = requestAnimationFrame(tick); } // smooth & slow
  function startOverlay(){ sel(); if(!root) return; cancelAnimationFrame(t); setPct(1); startAt = performance.now(); body.removeAttribute('data-ready'); root.removeAttribute('data-hidden'); tick(); }
  function doneOverlay(){ sel(); if(!root) return; cancelAnimationFrame(t); setPct(100); var elapsed = performance.now() - startAt; var MIN = 6200; var wait = Math.max(0, MIN - elapsed); setTimeout(function(){ body.setAttribute('data-ready','1'); didFirstLoad = true; setTimeout(function(){ root.setAttribute('data-hidden',''); }, 600); }, wait + 360); }

  // navigation flip (no overlay on nav)
  function flipOnce(){ sel(); if(!pageTurn) return; pageTurn.classList.add('is-turning'); setTimeout(function(){ pageTurn.classList.remove('is-turning'); }, 850); }

  document.addEventListener('DOMContentLoaded', function(){ startOverlay(); });
  window.addEventListener('load', function(){ doneOverlay(); });

  // SPA route-change hooks -> only the 3D flip
  var _ps = history.pushState; var _rs = history.replaceState;
  function navStart(){ if(didFirstLoad) { flipOnce(); } }
  history.pushState = function(){ var r = _ps.apply(this, arguments); navStart(); return r; };
  history.replaceState = function(){ var r = _rs.apply(this, arguments); navStart(); return r; };
  window.addEventListener('popstate', navStart);

  // expose for debugging
  window.__appLoader = { startOverlay: startOverlay, doneOverlay: doneOverlay, flip: flipOnce, set: setPct };
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <style>{`
          html,body{height:100%}
          body{margin:0}

          /* LOADER overlay — dark gradient only while visible */
          .app-loader{
            position:fixed; inset:0; z-index:9999; display:grid; place-items:center;
            transition:opacity .6s ease;
            background:#000;
            background-image:radial-gradient(1100px 600px at 50% 15%, rgba(255,255,255,.12), rgba(255,255,255,.06) 35%, rgba(0,0,0,0) 70%);
          }
          [data-ready="1"] .app-loader{opacity:0; pointer-events:none}
          .app-loader[data-hidden]{display:none}

          /* Vertical loader card — NO borders */
          .app-loader__box{
            position:relative; width:min(560px,92vw); padding:32px; border-radius:22px;
            background:rgba(255,255,255,.06);
            backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
            box-shadow:0 28px 72px rgba(0,0,0,.5);
            display:flex; flex-direction:column; align-items:center; text-align:center;
          }

          /* Floating page card behind the icon (no borders) */
          .pagecard{
            position:absolute; inset:10px; border-radius:18px;
            background:linear-gradient(to right, rgba(255,255,255,.05) 0, rgba(255,255,255,.12) 35%, rgba(255,255,255,.05) 75%);
            box-shadow:0 30px 60px rgba(0,0,0,.45);
            transform-style:preserve-3d; transform-origin:left center;
            animation:pagefloat 7s ease-in-out infinite;
          }
          @keyframes pagefloat{
            0%{ transform:rotateY(-18deg) translateY(0) }
            50%{ transform:rotateY(-12deg) translateY(-3px) }
            100%{ transform:rotateY(-18deg) translateY(0) }
          }

          .app-loader__svg{ width:148px; height:148px; color:#fff; margin:10px 0 14px 0 }
          .app-loader__title{ font:600 18px/1.3 ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial; letter-spacing:.2px; color:#fff }
          .app-loader__desc{ margin-top:8px; color:rgba(255,255,255,.82); font:400 14px/1.45 ui-sans-serif,system-ui }
          .app-loader__barwrap{ margin-top:20px; width:100%; height:7px; background:rgba(255,255,255,.12); border-radius:999px; overflow:hidden }
          .app-loader__bar{ height:100%; width:100%; transform-origin:left; background:linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,.7)); transform:scaleX(0) }

          /* WHOLE-PAGE 3D BOOK FLIP on navigation (no overlay) */
          .page-stage{ perspective:1400px }
          .page-turn{
            position:relative; transform-style:preserve-3d; transform-origin:left center;
            transition:transform .9s cubic-bezier(.22,.61,.36,1), filter .9s ease;
            will-change:transform;
          }
          .page-turn.is-turning{ animation:flip3d .85s cubic-bezier(.3,.7,.2,1) both }
          .page-turn::after{
            content:""; position:absolute; inset:0; pointer-events:none; opacity:0;
            transition:opacity .9s;
            /* subtle page sheen while turning */
            background:linear-gradient(90deg, rgba(0,0,0,.18), rgba(0,0,0,0) 38%);
          }
          .page-turn.is-turning::after{ opacity:.28 }
          @keyframes flip3d{
            0%   { transform: rotateY(0deg) translateX(0) scale(1) }
            40%  { transform: rotateY(-12deg) translateX(-1.2%) scale(.993) }
            100% { transform: rotateY(0deg) translateX(0) scale(1) }
          }

          @media (prefers-reduced-motion: reduce){
            .app-loader__bar,.pagecard{transition:none; animation:none}
            .page-turn{transition:none}
            .page-turn.is-turning{animation:none}
            .book-draw{animation:none}
          }

          /* Ultra-thin, slow hand-drawn book outline (white) */
          .book-draw{
            stroke:currentColor; stroke-width:.5; fill:none;
            stroke-linecap:round; stroke-linejoin:round;
            stroke-dasharray:420; stroke-dashoffset:420;
            animation:bookdraw 6.4s ease-out forwards;
          }
          @keyframes bookdraw{ to{ stroke-dashoffset:0 } }
        `}</style>
      </head>
      <body>
        {/* Loader overlay (visible ONLY on first load) */}
        <div className="app-loader" aria-hidden>
          <div className="app-loader__box">
            <div className="pagecard" aria-hidden></div>
            <svg
              className="app-loader__svg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              aria-hidden
            >
              <path
                className="book-draw"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <div className="app-loader__title">Ładowanie aplikacji…</div>
            <div className="app-loader__desc">
              Inicjalizacja, rejestrowanie offline i przygotowanie biblioteki.
            </div>
            <div
              className="app-loader__barwrap"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="app-loader__bar" />
            </div>
          </div>
        </div>

        {/* App content — flips in 3D on each navigation */}
        <div className="page-stage">
          <div className="page-turn">
            <NavBar />
            {children}
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: appLoaderScript }} />
        <script dangerouslySetInnerHTML={{ __html: swRegisterScript }} />
      </body>
    </html>
  );
}
