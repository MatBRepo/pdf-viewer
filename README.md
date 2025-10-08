# Entriso PDF Viewer — Pro UI + Accounts + PWA Push

End-to-end app for your flow:
1) User buys on WordPress (plugin sends email code)
2) User signs in (Supabase) and **redeems** code
3) App lists PDFs from that order (and any others)
4) User opens a **secure preview** (no direct file URLs, tickets, no-store)
5) Add more tokens anytime (merge libraries)
6) Reader modes: **Dark**, **Low contrast**, **Paper**, Zoom + watermark
7) Installable **PWA** + **Web Push** notifications

## Quick start
```bash
npm i
cp .env.example .env.local
# Fill SUPABASE vars
# Generate VAPID keys: npx web-push generate-vapid-keys
# paste VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and NEXT_PUBLIC_VAPID_PUBLIC_KEY (same as VAPID_PUBLIC_KEY)
npm run dev
```

### Production (PWA on phones)
- Set `NEXT_PUBLIC_ENABLE_SW=1` (in `.env.production`)
- Build: `npm run build && npm start`
- Serve over **HTTPS**

## Database (Supabase)
```sql
-- Sources (token storage per user)
create table if not exists public.pdf_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  wp_base_url text not null,
  source_label text not null,
  source_token text not null,
  created_at timestamptz default now()
);
alter table public.pdf_sources enable row level security;
create policy "sel" on public.pdf_sources for select using (auth.uid() = user_id);
create policy "ins" on public.pdf_sources for insert with check (auth.uid() = user_id);
create policy "del" on public.pdf_sources for delete using (auth.uid() = user_id);

-- Web Push subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
create policy "sel" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "ins" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "del" on public.push_subscriptions for delete using (auth.uid() = user_id);
```

## Push notifications
- This app stores browser subscriptions in `push_subscriptions`.
- Use `/api/push/test` (Account page button) to send a test to the current user.
- From external systems (e.g., WordPress), you can call a new backend endpoint you add to broadcast to a user. (Or trigger via Supabase Edge Functions.)

## Security notes
- Viewer uses **short-lived tickets** and server-side proxy (`/api/pdf/[ticket]`) and sets `no-store` headers.
- Service Worker **does not cache PDFs**.
- Client deterrents: disable context menu, block common print/save keys, blur on window blur, watermark overlay.
  > Note: no web app can absolutely block screenshots or screen recording on user devices. This design focuses on deterrence and access control.

## UI Kit
- Tailwind CSS with small local components (`/components/ui`) and **lucide-react** icons for a clean, modern look.

## Routes
- `/redeem` — enter emailed code
- `/library` — your PDFs from all added sources
- `/account` — login, add code, manage push
- `/viewer/[ticket]` — reader with modes
- `/api/*` — redeem/list/ticket/pdf proxy + push subscribe/test
