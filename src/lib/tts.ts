// Shared browser text-to-speech. Real audio would be better (see roadmap), but
// this is the current voice everywhere. Kept in one place so every study mode
// speaks consistently.
const TTS_LANG: Record<string, string> = { ja: "ja-JP", ko: "ko-KR", zh: "zh-CN", en: "en-US" };

export function speak(text: string, lang = "ja") {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = TTS_LANG[lang] ?? "ja-JP";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}
