"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { RetrievedReference } from "@/lib/ai/culture-rag";
import { CATEGORY_META, CulturalCategory } from "@/types/culture";
import {
  IconArrowLeft,
  IconClose,
} from "@/components/ui/Icons";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  displayedContent?: string;
  isStreaming?: boolean;
  references?: RetrievedReference[];
  timestamp: string;
}

let chatMsgCounter = 0;
function nextMsgId(prefix: string): string {
  chatMsgCounter += 1;
  return `${prefix}-${chatMsgCounter}`;
}

const DEFAULT_SAMPLE_QUESTIONS = [
  "Apa makna filosofis batik Nusantara?",
  "Bagaimana sejarah Reog Ponorogo?",
  "Apa makanan khas Jawa Timur dan bagaimana asal-usulnya?",
  "Apa makna di balik pakaian adat Bali?",
  "Mengapa masyarakat Indonesia memiliki banyak tradisi yang berbeda?",
];

export function TanyaAIChat() {
  const searchParams = useSearchParams();
  const currentBudaya = searchParams.get("budaya") || "";
  const currentSlug = searchParams.get("slug") || "";

  // Dynamic key causes React to remount TanyaAIChatContent on context changes,
  // guaranteeing fresh state initialization without cascading effect re-renders.
  const chatSessionKey = `${currentBudaya}::${currentSlug}`;

  return (
    <TanyaAIChatContent
      key={chatSessionKey}
      initialBudaya={currentBudaya}
      initialSlug={currentSlug}
    />
  );
}

function TanyaAIChatContent({
  initialBudaya,
  initialSlug,
}: {
  initialBudaya: string;
  initialSlug: string;
}) {
  const router = useRouter();

  const [activeContext, setActiveContext] = useState<{ name: string; slug: string } | null>(
    initialBudaya ? { name: initialBudaya, slug: initialSlug } : null
  );

  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialBudaya) {
      return [
        {
          id: nextMsgId("welcome-seeded"),
          role: "assistant",
          content: `Halo! Saya **Pamong Budaya AI**. Anda sedang membuka materi warisan budaya **${initialBudaya}**.\n\nSilakan tanyakan apa pun mengenai sejarah, asal-usul wilayah, makna simbolis, tata cara pelaksanaan, maupun nilai filosofis di balik tradisi ini.`,
          displayedContent: `Halo! Saya **Pamong Budaya AI**. Anda sedang membuka materi warisan budaya **${initialBudaya}**.\n\nSilakan tanyakan apa pun mengenai sejarah, asal-usul wilayah, makna simbolis, tata cara pelaksanaan, maupun nilai filosofis di balik tradisi ini.`,
          isStreaming: false,
          timestamp: "Sekarang",
        },
      ];
    }
    return [];
  });

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClearContext = () => {
    setActiveContext(null);
    if (
      messages.length <= 1 &&
      (messages.length === 0 || messages[0]?.id.startsWith("welcome-seeded"))
    ) {
      setMessages([]);
    }
    router.replace("/tanya-ai");
  };

  const handleResetChat = () => {
    router.replace("/tanya-ai");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Progressive Typewriter / Streaming Effect for active AI message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant" || !lastMsg.isStreaming) {
      return;
    }

    const fullText = lastMsg.content;
    let currentLength = lastMsg.displayedContent ? lastMsg.displayedContent.length : 0;

    const timer = setInterval(() => {
      // Stream in chunks of ~5 characters for a silky smooth, natural typing flow
      currentLength += 5;
      if (currentLength >= fullText.length) {
        clearInterval(timer);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].id === lastMsg.id) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              displayedContent: fullText,
              isStreaming: false,
            };
          }
          return updated;
        });
      } else {
        const nextSlice = fullText.slice(0, currentLength);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].id === lastMsg.id) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              displayedContent: nextSlice,
            };
          }
          return updated;
        });
      }
      scrollToBottom();
    }, 18);

    return () => clearInterval(timer);
  }, [messages, scrollToBottom]);

  // Complete streaming early if user clicks on bubble
  const handleCompleteStreamingEarly = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.isStreaming
          ? { ...m, displayedContent: m.content, isStreaming: false }
          : m
      )
    );
  };

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputQuery("");

    // Finalize any previously streaming message
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming ? { ...m, displayedContent: m.content, isStreaming: false } : m
      )
    );

    const userMessage: Message = {
      id: nextMsgId("usr"),
      role: "user",
      content: text,
      timestamp: "Baru saja",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.id.startsWith("welcome-seeded"))
        .slice(-4)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          text: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          targetSlug: activeContext?.slug,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mendapatkan respon dari AI.");
      }

      const botMessage: Message = {
        id: nextMsgId("ast"),
        role: "assistant",
        content: data.data.text,
        displayedContent: "",
        isStreaming: true,
        references: data.data.references,
        timestamp: "Baru saja",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--color-paper)]">
      {/* Top App Bar */}
      <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-[var(--color-rule)] bg-[var(--color-paper-elevated)] px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hm-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            title="Kembali ke Peta Budaya"
          >
            <IconArrowLeft size={14} />
            <span className="hidden sm:inline">Peta</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="shrink-0 transition-opacity hover:opacity-90"
              title="Kembali ke Beranda"
            >
              <Image
                src="/logo.png"
                alt="Logo Peta Interaktif Budaya Nusantara"
                width={34}
                height={34}
                priority
                className="h-8 w-8 object-contain"
              />
            </Link>
            <div>
              <Link
                href="/tanya-ai"
                onClick={handleResetChat}
                className="font-display text-sm font-bold text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)] sm:text-base"
                title="Mulai Sesi Baru"
              >
                Tanya AI tentang Budaya Indonesia
              </Link>
              <p className="hidden text-xs text-[var(--color-ink-2)] sm:block">
                Pendamping Cerdas Belajar Warisan Budaya Nusantara & Grounded RAG
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(messages.length > 0 || activeContext) && (
            <button
              type="button"
              onClick={handleResetChat}
              className="hm-interactive inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink-2)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
              title="Bersihkan percakapan dan mulai sesi baru"
            >
              <span>Percakapan Baru</span>
            </button>
          )}
          <Link
            href="/progres"
            className="hm-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            <span>Progres Belajar</span>
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
          </Link>
        </div>
      </header>

      {/* Active Seeded Context Banner if user navigated from a cultural item */}
      {activeContext && (
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-accent-subtle)] bg-[var(--color-accent-subtle)]/70 px-4 py-2 text-xs text-[var(--color-accent)] sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[var(--color-accent)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-accent-ink)] uppercase">
              Konteks Terpilih
            </span>
            <span className="font-semibold">{activeContext.name}</span>
          </div>
          <button
            type="button"
            onClick={handleClearContext}
            className="text-xs hover:underline flex items-center gap-1 text-[var(--color-ink-2)]"
          >
            <span>Hapus Fokus</span>
            <IconClose size={12} />
          </button>
        </div>
      )}

      {/* Chat Conversation Scroll Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Empty State / Welcome Guide */}
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl py-8 text-center space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-rule-strong)] bg-[var(--color-paper-2)] text-2xl shadow-xs">
              🏛️
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
                Eksplorasi Kebudayaan Indonesia bersama AI
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
                Tanyakan sejarah, filosofi busana adat, rahasia bumbu kuliner Nusantara, makna tarian sakral,
                hingga instrumen musik tradisional. Didukung penelusuran 1.727 data warisan budaya terverifikasi.
              </p>
            </div>

            {/* Quick Sample Questions */}
            <div className="space-y-2 text-left">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-3)] text-center">
                Pilih Pertanyaan Pembuka:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEFAULT_SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="hm-interactive flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-3 text-left text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:shadow-xs"
                  >
                    <span className="text-[var(--color-accent)] font-bold">›</span>
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Header: displays user or assistant name without internal model identifiers */}
            <div className="flex items-center gap-1.5 px-1 pb-1 font-mono text-[10px] text-[var(--color-ink-3)]">
              <span>{msg.role === "user" ? "Anda" : "Pamong Budaya AI"}</span>
              <span>·</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              onClick={() => msg.isStreaming && handleCompleteStreamingEarly(msg.id)}
              className={`max-w-[88%] sm:max-w-2xl rounded-[var(--radius-card)] p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)] rounded-tr-xs"
                  : "border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] text-[var(--color-ink)] shadow-xs rounded-tl-xs"
              } ${msg.isStreaming ? "cursor-pointer" : ""}`}
            >
              {/* Formatted Markdown Content with progressive streaming text reveal */}
              {msg.role === "assistant" ? (
                <div className="relative">
                  <MarkdownContent content={msg.displayedContent ?? msg.content} />
                  {msg.isStreaming && (
                    <span
                      className="inline-block h-3.5 w-1.5 ml-0.5 rounded-xs bg-[var(--color-accent)] animate-pulse align-middle"
                      title="Sedang menjawab..."
                    />
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              {/* Verified Cultural References & Citations (Show after streaming completes) */}
              {!msg.isStreaming && msg.references && msg.references.length > 0 && (
                <div className="mt-4 border-t border-[var(--color-rule-subtle)] pt-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
                    Referensi Data Budaya Terverifikasi (Arsip Platform):
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {msg.references.map((ref) => {
                      const catMeta = CATEGORY_META[ref.category as CulturalCategory];
                      return (
                        <div
                          key={ref.id}
                          className="flex items-center gap-2.5 rounded-[var(--radius-input)] border border-[var(--color-rule-subtle)] bg-[var(--color-paper-2)] p-2"
                        >
                          {ref.localImagePath && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={ref.localImagePath}
                              alt={ref.name}
                              className="h-10 w-10 shrink-0 rounded object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-xs text-[var(--color-ink)]">
                              {ref.name}
                            </p>
                            <p className="truncate text-[10px] text-[var(--color-ink-2)]">
                              {ref.provinceName}
                            </p>
                          </div>
                          {catMeta && (
                            <span
                              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase"
                              style={{
                                backgroundColor: "var(--color-paper)",
                                color: catMeta.accentVar,
                              }}
                            >
                              {catMeta.shortLabel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator without text (clean, modern animated pulsing dots) */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 px-1 pb-1 font-mono text-[10px] text-[var(--color-ink-3)]">
              <span>Pamong Budaya AI</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-[var(--radius-card)] rounded-tl-xs border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] px-4 py-3.5 shadow-xs">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--color-accent)] [animation-duration:800ms]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--color-accent)] [animation-duration:800ms] [animation-delay:180ms]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--color-accent)] [animation-duration:800ms] [animation-delay:360ms]" />
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-error)] bg-[var(--color-error-bg)] p-3 text-xs text-[var(--color-error)] flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="font-bold underline hover:no-underline"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Bar */}
      <footer className="shrink-0 border-t border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeContext
                  ? `Tanyakan sesuatu tentang ${activeContext.name}...`
                  : "Tanyakan makna, sejarah, tarian, makanan, atau pakaian adat Nusantara..."
              }
              className="hm-interactive block h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3.5 text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-accent)] sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="hm-interactive flex h-10 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-accent)] px-4 font-bold text-xs text-[var(--color-accent-ink)] shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Kirim</span>
          </button>
        </form>
        <p className="mt-2 text-center font-mono text-[10px] text-[var(--color-ink-3)]">
          Pamong Budaya AI adalah chatbot dan dapat membuat kesalahan.
        </p>
      </footer>
    </div>
  );
}
