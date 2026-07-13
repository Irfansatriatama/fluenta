"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Sparkles } from "lucide-react";
import { KeiSigil } from "@/components/mentor/Mentor";
import { tutorReply, type ChatTurn } from "@/lib/aiActions";

const CHIPS = ["Jelaskan satu pola grammar", "Beri aku contoh", "Kuis aku"];

export function TutorChat({
  lang,
  languageName,
  greeting,
}: {
  lang: string;
  languageName: string;
  greeting: string;
}) {
  const [messages, setMessages] = useState<ChatTurn[]>([{ role: "assistant", text: greeting }]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const history: ChatTurn[] = [...messages, { role: "user", text: trimmed }];
    setMessages(history);
    setInput("");
    startTransition(async () => {
      const res = await tutorReply({ languageName, history });
      setMessages((m) => [...m, { role: "assistant", text: res.text }]);
    });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col md:h-[calc(100vh-7rem)]">
      <div className="flex items-center gap-2.5 pb-3">
        <KeiSigil size={34} />
        <div>
          <p className="font-display text-sm font-bold text-ink">Kei</p>
          <p className="text-xs text-ink-soft">Pemandu paspormu — tanya apa saja</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border hairline bg-paper/40 p-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold"
                style={
                  isUser
                    ? { backgroundColor: "var(--accent)", color: "#fff" }
                    : { backgroundColor: "var(--color-ivory)", color: "var(--color-gold)", boxShadow: "inset 0 0 0 1px var(--color-edge)" }
                }
              >
                {isUser ? "You"[0] : <Sparkles className="h-3.5 w-3.5" />}
              </span>
              <div
                className="max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft"
                style={
                  isUser
                    ? { backgroundColor: "var(--accent)", color: "#fff" }
                    : { backgroundColor: "var(--color-paper)", color: "var(--color-ink)" }
                }
                lang={isUser ? undefined : lang}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {pending && (
          <p className="pl-9 text-xs text-ink-faint">Kei sedang mengetik…</p>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-gold/60 hover:text-ink disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {c}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya apa saja ke Kei…"
          className="flex-1 rounded-2xl border border-edge bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[color:var(--accent)]"
        />
        <button
          type="submit"
          disabled={pending || input.trim().length === 0}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}
          aria-label="Kirim"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
