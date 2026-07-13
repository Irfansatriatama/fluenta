// ============================================================
//  Kei — Sang Mentor Fluenta (persona canon + voice)
// ------------------------------------------------------------
//  Kei (慧, "kebijaksanaan") adalah pemandu yang KONSTAN di tiap
//  paspor — indah, cerdas, tegas-tapi-peduli, dan tidak pernah
//  meninggalkanmu. Dia hadir sebagai SUARA (serif), bukan maskot.
//
//  Aturan suara:
//   • Bahasa Indonesia, sapa "kamu" — dia menemuimu di bahasa ibumu.
//   • Ritme dua-ketukan: fakta pendek → makna.
//   • Firmness selalu terikat DATA NYATA (streak, hari absen, jawaban).
//     Tidak ada pujian kosong, tidak ada rasa takut buatan.
//
//  SEMUA teks Kei tinggal di file ini. Ganti nama/kata = satu file.
// ============================================================

export const KEI = {
  name: "Kei",
  meaning: "慧 — kebijaksanaan",
  epithet: "pemandu paspormu",
} as const;

function firstName(name?: string | null): string {
  const n = (name ?? "").trim().split(/\s+/)[0];
  return n || "kamu";
}

// pick a deterministic variant (no RNG → no hydration surprises)
function pick<T>(arr: readonly T[], seed = 0): T {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

export type MentorLine = { line: string; sub?: string };

// Whole days since a timestamp (0 if absent). Reads the clock here so the
// server component stays free of impure calls in its render body.
export function daysSince(date: Date | null | undefined): number {
  if (!date) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

// -- Sapaan /home. Dirancang dari kondisi TERLEMAH dulu: user baru
//    (0 langkah) dan user yang kembali setelah pergi. ---------------
export function keiGreeting(input: {
  name?: string | null;
  isNew: boolean;
  daysAway: number; // 0 = aktif hari ini
  streak: number;
}): MentorLine {
  const you = firstName(input.name);

  // Baru — belum ada langkah. Rumah sudah siap; kekosongan = awal, bukan kegagalan.
  if (input.isNew) {
    return {
      line: `Selamat datang, ${you}. Rumahmu sudah siap.`,
      sub: "Belum ada langkah — dan itu awal yang paling kusuka. Kita mulai dari satu kata?",
    };
  }

  // Kembali setelah pergi ≥2 hari — janji "tidak pernah meninggalkanmu", angka jujur.
  if (input.daysAway >= 2) {
    return {
      line: `${you}, ${input.daysAway} hari kamu pergi.`,
      sub: "Tempatmu masih persis di sini. Kita lanjut dari tempat kita berhenti?",
    };
  }

  // Aktif hari ini dengan ritme — akui ritmenya, tanpa menakut-nakuti.
  if (input.daysAway === 0 && input.streak >= 2) {
    return {
      line: `Halo lagi, ${you}.`,
      sub: `${input.streak} hari berturut kamu datang. Ritme ini yang pelan-pelan mengubahmu.`,
    };
  }

  // Kembali normal (kemarin aktif / streak tipis).
  return pick(
    [
      { line: `Selamat datang kembali, ${you}.`, sub: "Satu langkah hari ini sudah cukup untuk menjaga jalannya." },
      { line: `Senang kamu kembali, ${you}.`, sub: "Kita teruskan perjalanan yang sudah kamu mulai." },
    ],
    input.streak,
  );
}

// -- Empty-state generik untuk permukaan lain (deck kosong, dsb). ---
export function keiEmpty(context: "deck" | "journey" | "generic" = "generic"): string {
  switch (context) {
    case "deck":
      return "Belum ada kartu di sini. Tak apa — koleksi terbaik selalu mulai dari satu.";
    case "journey":
      return "Jalannya masih lengang. Langkah pertamamu yang akan membukanya.";
    default:
      return "Masih kosong di sini — dan setiap hal baik memang mulai dari kosong.";
  }
}

// -- Koreksi jawaban di lesson. Salah → tegas tapi menemani; benar →
//    afirmasi yang menyebut apa yang SEDANG kamu kuasai (bukan "Hebat!"). --
export function keiCorrection(correct: boolean, seed = 0): string {
  if (correct) {
    return pick(
      [
        "Tepat. Perlahan ini jadi milikmu, bukan sekadar hafalan.",
        "Benar — dan kamu membacanya, bukan menebaknya.",
        "Pas. Satu simpul lagi terurai.",
      ],
      seed,
    );
  }
  return pick(
    [
      "Bukan itu — tapi kamu dekat. Baca sekali lagi, pelan.",
      "Belum tepat. Aku tunjukkan letaknya, lalu kita coba lagi.",
      "Salah di sini — dan itu bagian dari belajar. Perhatikan:",
    ],
    seed,
  );
}
