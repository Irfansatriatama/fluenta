# Fluenta — Platform Design Spec

- Date: 2026-07-07
- Status: Approved (design), pending implementation plan
- Repo: github.com/Irfansatriatama/fluenta

## 1. Vision

Fluenta adalah **satu platform payung** untuk belajar banyak bahasa (Jepang, Korea, China, Inggris + soon lainnya) — gamified, bertenaga AI (Claude), dengan konsistensi visual "Warm Premium Gamified". Dua ruang berbeda:

- **Hub (rumah user)** — netral (ivory + gold-leaf). Rumah lintas-bahasa: ringkasan, akses modul, report, kompetisi, achievement, profil.
- **Modul (per-bahasa)** — themed. Klik masuk sebuah bahasa → seluruh tema warna berubah ikut bahasa itu; materi di-scope ke bahasa tersebut. Tidak ada satu halaman yang menyajikan semua bahasa sekaligus.

## 2. Information Architecture

- `/home` — Hub netral. Berisi **Access Modules / My Languages** (hanya bahasa yang diaktifkan user), overview global (streak, total XP, level), report ringkas, recent achievements.
- `/learn/[lang]` — Ruang modul themed (journey, lesson, practice, AI, scoped ke satu bahasa).
- Aktivasi bahasa lewat **placement test** → membuat `Enrollment`. Hanya `Enrollment` aktif yang muncul di Access Modules; kartu "Add a language" memulai placement.

## 3. Theming (satu kode, banyak warna)

Satu set komponen dipakai ulang untuk semua bahasa. Warna tema di-swap via CSS variable `--accent` yang di-set di root ruang modul (`data-lang="ja|ko|zh|en"`). Komponen modul memakai `var(--accent)`, bukan warna hardcode. Hub selalu netral (gold-leaf). Peta aksen: JP `#B23A2E`, KR `#3B5C99`, CN `#2F7D53`, EN `#5B4B9E`.

## 4. Feature Pillars (Rich MVP — keempat pilar masuk, matang bertahap)

1. **Core learning (modul):** placement, learning path (unit→lesson), tipe lesson kaya — flashcard SRS, reading, listening, writing (AI-graded), speaking/pronunciation, dialog/roleplay, grammar drill, dictation, cloze, sentence-building, script/stroke (kana/kanji/hanzi/hangul), tone & pinyin (CN). Materi tiap bahasa berbeda (data + metadata), kode satu set.
2. **Gamifikasi:** XP + level (global & per-bahasa), streak + freeze/repair, daily/weekly goal, daily quests, chest/reward, badge = **stempel paspor** koleksi, milestone + sertifikat kelulusan level.
3. **Kompetisi & sosial:** weekly leagues (Bronze→Gold, promosi/degradasi), leaderboard global + per-bahasa, friends/follow + friend leaderboard, challenge teman.
4. **AI (Claude):** conversation partner (roleplay), writing auto-grading + koreksi, AI tutor (tanya grammar), adaptive review (fokus kelemahan), smart SRS.

## 5. Screen Map & Mockup Status

**Publik/Auth:** Landing ✅ dibangun · Login/Register (standar) · Onboarding (standar) · Placement test (standar).

**Hub (netral):** Home + Access Modules ✅ · Reports/Analytics ⚠️ mockup · Leaderboard+Leagues ✅ · Achievements/Paspor ⚠️ mockup (signature) · Friends/Social ⚠️ mockup · Profile/Settings/Premium (standar).

**Modul (themed):** Module home ✅ · Journey ✅ · Flashcard ✅ · Quiz ✅ · Reading/Listening ⚠️ mockup · Writing-AI ⚠️ mockup · Dialog/AI-tutor ⚠️ mockup · Speaking/Script/Tone (reuse pola) · Lesson complete ⚠️ mockup.

**Prinsip efektif:** semua lesson memakai satu **"lesson shell"** (header progress + area konten + aksi). Hanya screen yang beda visual signifikan yang di-mockup; sisanya turunan.

## 6. Route Structure (rencana)

```
/                       landing (publik)
/login /register        auth
/onboarding             goal + komitmen (sesudah register)
/home                   Hub netral (default sesudah login)
/home/reports           analytics lintas bahasa
/home/leaderboard       leagues + ranking
/home/achievements      paspor stempel
/home/friends           sosial
/home/profile /settings
/learn/[lang]           module home (themed)
/learn/[lang]/journey   path
/learn/[lang]/lesson/[id]  lesson shell (semua tipe)
/learn/[lang]/placement    placement test
/learn/[lang]/tutor        AI tutor chat
```

## 7. Data Model

Basis sudah ada di `prisma/schema.prisma` (Language, Track, Unit, Lesson, Question, Deck, Card, CardReview, Enrollment, LessonProgress, XpEvent, Streak, Badge, UserBadge, PlacementTest/Attempt + model Better Auth).

**Penambahan untuk pilar (dibuat saat implementasi, via edit schema + `prisma migrate dev`):**
- Sosial/kompetisi: `Friendship`, `League`, `LeagueMembership`.
- AI: `WritingSubmission` (feedback JSON), `AiConversation` + `AiMessage` (atau messages JSON).
- Engagement: `DailyQuest`, `UserQuest`, `Certificate`.
- Semua tanpa enum & tanpa FK DB (String + `relationMode="prisma"` + `@@index`).

## 8. Phasing Roadmap

- **Fase 0 — Fondasi (tanpa mockup baru):** route `/home` + `/learn/[lang]` + theme-swap `--accent`; Access Modules baca Enrollment; auth (login/register); onboarding; placement; wire hub + module home ke data real. Pindahkan dashboard eksisting → module home `/learn/ja`.
- **Fase 1 — Loop belajar inti (mockup: Reading, Listening, Writing-AI, Lesson-complete):** lesson shell + tipe lesson; SRS; XP/streak update nyata.
- **Fase 2 — AI & engagement (mockup: Dialog/AI-tutor, Achievements/Paspor, Reports):** Claude writing-grading + tutor + roleplay; paspor stempel; analytics.
- **Fase 3 — Sosial & kedalaman (mockup: Friends, Speaking, Script/stroke, Premium/Certificate):** leagues, friends, speaking, sertifikat, freemium gating.

## 9. Constraints & Rules

- Stack: Next.js 16 (App Router) · Better Auth · Supabase (Postgres) · Prisma 7 (driver adapter pg) · Cloudinary (audio/gambar) · Vercel · Claude API.
- Prisma: **no enum, no FK DB** (`relationMode="prisma"`, String + konstanta), migrasi **hanya** via `prisma migrate dev` (tanpa file SQL manual).
- Authorization: **PBAC** (template + override).
- UI: **tanpa emoji** (SVG/lucide), konsisten dengan design system, responsive web + web-on-mobile.
- Git: auto commit + push, author Irfansatriatama, tanpa co-author.
- Kode efektif, tanpa duplikasi/sisa.

## 10. Non-Goals v1 (YAGNI)

Native mobile app, offline mode, user-generated content marketplace, live tutoring manusia, payment integration nyata (Premium = gating dulu).
