# Fluenta Fase 0 (Fondasi) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline). Steps use checkbox (`- [ ]`).

**Goal:** Restrukturisasi jadi Hub netral (`/home`) + Modul themed (`/learn/[lang]`) dengan theme-swap per bahasa, auth, onboarding, placement, dan Access Modules dari Enrollment.

**Architecture:** Dua route group — `(hub)` netral gold dengan menu umum, dan `(module)` `/learn/[lang]` yang me-render satu set komponen dengan `--accent` di-swap per bahasa. Data bahasa & progress dari Prisma/Supabase; auth via Better Auth.

**Tech Stack:** Next.js 16 App Router, Prisma 7 (driver adapter pg), Better Auth, Tailwind v4, lucide-react.

## Global Constraints

- Prisma: no enum, no FK DB (`relationMode="prisma"`, String + konstanta), migrasi hanya `prisma migrate dev`.
- UI tanpa emoji (SVG/lucide), design system "Warm Premium Gamified" (token di `globals.css`).
- Verifikasi per task: `npm run build` sukses (compile + TS) + cek visual. Commit + push (author Irfansatriatama, tanpa co-author) tiap task selesai.
- Aksen bahasa: ja `#B23A2E`, ko `#3B5C99`, zh `#2F7D53`, en `#5B4B9E`. Hub netral gold `#C1912E`.

---

### Task 1: Seed bahasa + Prisma seed

**Files:** Create `prisma/seed.ts`; Modify `package.json` (script `db:seed`), `prisma.config.ts` (migrations.seed).

- [ ] Tulis seed 4 Language (ja/ko/zh/en) + 1 Track contoh per bahasa (JLPT N5 dst) idempotent (`upsert` by `code`).
- [ ] Jalankan `npm run db:seed`, verifikasi row masuk (prisma studio / query).
- [ ] Commit.

### Task 2: Theming per bahasa

**Files:** Create `src/lib/theme.ts` (map code→accent + helper `accentVars(code)`); dipakai di module layout.

- [ ] `accentVars(code)` mengembalikan style object `{ ["--accent"]: hex }`.
- [ ] Komponen modul memakai `var(--accent)` (bukan hardcode).

### Task 3: Nav split

**Files:** Create `src/components/hub/HubSidebar.tsx`, `HubMobileNav.tsx` (menu: Home, Reports, Leaderboard, Achievements, Profile). Create `src/components/module/ModuleSidebar.tsx`, `ModuleMobileNav.tsx` (menu: Home modul, Journey, Practice, Tutor, + Back to hub), pakai `var(--accent)` untuk state aktif. Modify `src/lib/nav.ts` (pisah HUB_NAV & MODULE_NAV). Hapus `src/components/app/*` lama bila tak terpakai.

- [ ] Build pass.

### Task 4: Hub `/home` (umbrella)

**Files:** Create `src/app/(hub)/layout.tsx` (HubSidebar + mobile), `src/app/(hub)/home/page.tsx`. Bangun sesuai mockup umbrella: greeting + global streak/XP/level ring, **Access Modules** (kartu per bahasa aktif + Add a language), This Week (activity/accuracy/sessions), Recent achievements.

- [ ] Access Modules ambil dari Enrollment user (Task 8); sementara fallback ke daftar Language + progress dummy bila belum login.
- [ ] Build pass + commit.

### Task 5: Modul `/learn/[lang]` themed home

**Files:** Create `src/app/(module)/learn/[lang]/layout.tsx` (ModuleSidebar + set `--accent` via `accentVars`), `.../[lang]/page.tsx` (pindahan dari dashboard lama: streak, level ring, daily goal, continue learning, today's plan, stats — pakai `var(--accent)`). Delete `src/app/(app)/*` lama.

- [ ] `[lang]` divalidasi ke Language.code; 404 bila tidak ada.
- [ ] Build pass + commit + push.

### Task 6: Auth pages

**Files:** Create `src/app/(auth)/login/page.tsx`, `.../register/page.tsx`, `src/lib/session.ts` (helper `getSession()` server-side). Wire `authClient.signIn/signUp` → redirect `/home`.

- [ ] Build pass + commit.

### Task 7: Onboarding + Profile

**Files:** Create `src/app/onboarding/page.tsx` (tujuan + komitmen harian) → buat `Profile` (server action). 

- [ ] Redirect ke `/home` sesudah selesai.

### Task 8: Placement + Enrollment

**Files:** Create `src/app/(module)/learn/[lang]/placement/page.tsx` (flow ringkas) → buat `Enrollment` + `resultLevel`. Access Modules (Task 4) kini baca Enrollment nyata.

- [ ] Build pass + commit + push.

## Self-Review

- Coverage: IA (`/home` + `/learn/[lang]`), theming, auth, onboarding, placement, Access Modules — semua ada task. ✅
- Fase 1 (lesson shell + Reading/Listening/Writing/Complete) di plan terpisah setelah Fase 0.
