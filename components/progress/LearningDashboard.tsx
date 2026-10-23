"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { CulturalCategory, CulturalItem } from "@/types/culture";
import {
  clearStoredProgress,
  EMPTY_PROGRESS_DATA,
  getProgressStats,
  getRecommendations,
  getStoredProgress,
  invalidateProgressCache,
  LearnedItemRecord,
  QuizHistoryRecord,
  RecommendationItem,
} from "@/lib/progress/progress-service";
import {
  IconArrowLeft,
  IconBahasa,
  IconMakanan,
  IconMusik,
  IconPakaian,
  IconTarian,
} from "@/components/ui/Icons";

interface LearningDashboardProps {
  culturalItems: CulturalItem[];
}

const CATEGORY_ICONS: Record<CulturalCategory, React.ReactNode> = {
  bahasa: <IconBahasa size={14} />,
  musik: <IconMusik size={14} />,
  makanan: <IconMakanan size={14} />,
  pakaian: <IconPakaian size={14} />,
  tarian: <IconTarian size={14} />,
};

// Safe external store subscription for localStorage updates with cache invalidation
function subscribeProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleUpdate = () => {
    invalidateProgressCache();
    callback();
  };
  window.addEventListener("culture-progress-updated", handleUpdate);
  window.addEventListener("storage", handleUpdate);
  return () => {
    window.removeEventListener("culture-progress-updated", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}

function getServerSnapshot() {
  return EMPTY_PROGRESS_DATA;
}

export function LearningDashboard({ culturalItems }: LearningDashboardProps) {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "materi" | "kuis">("ringkasan");

  const progressData = useSyncExternalStore(
    subscribeProgress,
    getStoredProgress,
    getServerSnapshot
  );

  const stats = getProgressStats(progressData);
  const recommendations: RecommendationItem[] = getRecommendations(culturalItems, progressData);

  const learnedList: LearnedItemRecord[] = Object.values(progressData.learnedItems).sort(
    (a, b) => new Date(b.lastLearnedAt).getTime() - new Date(a.lastLearnedAt).getTime()
  );

  const quizList: QuizHistoryRecord[] = progressData.quizHistory;

  return (
    <div className="min-h-screen w-full bg-[var(--color-paper)] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-[var(--color-rule)] bg-[var(--color-paper-elevated)]/95 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hm-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            title="Kembali ke Peta Budaya"
          >
            <IconArrowLeft size={14} />
            <span>Peta</span>
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
              <h1 className="font-display text-sm font-bold text-[var(--color-ink)] sm:text-base">
                Progres Belajar Budaya Nusantara
              </h1>
              <p className="hidden text-xs text-[var(--color-ink-2)] sm:block">
                Pantau Pemahaman & Riwayat Pembelajaran Budaya Indonesia
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tanya-ai"
            className="hm-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
          >
            <span className="font-bold text-[var(--color-accent)]">AI</span>
            <span>Tanya AI</span>
          </Link>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Header Hero Stats Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Budaya Dipelajari */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-4 shadow-xs">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
              Materi Dipelajari
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.totalLearned}
              </span>
              <span className="font-mono text-xs font-medium text-[var(--color-ink-2)]">
                / 1.722 Budaya
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-paper-2)]">
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-500"
                style={{
                  width: `${Math.min(100, (stats.totalLearned / 1722) * 100 * 20)}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--color-ink-2)]">
              Status: <span className="font-semibold text-[var(--color-accent)]">{stats.masteryTitle}</span>
            </p>
          </div>

          {/* 2. Total Kuis Selesai */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-4 shadow-xs">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
              Kuis Diselesaikan
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.totalQuizzes}
              </span>
              <span className="font-mono text-xs text-[var(--color-ink-2)]">
                Sesi Uji
              </span>
            </div>
            <p className="mt-4 text-[11px] text-[var(--color-ink-2)]">
              {stats.totalAnsweredQuestions > 0
                ? `${stats.totalAnsweredQuestions} soal unik telah dijawab`
                : "Belum ada sesi kuis yang diselesaikan"}
            </p>
          </div>

          {/* 3. Nilai Rata-Rata */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-4 shadow-xs">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
              Nilai Rata-Rata
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.totalQuizzes > 0 ? `${stats.averageScore}%` : "—"}
              </span>
              {stats.totalQuizzes > 0 && (
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    stats.averageScore >= 80
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                      : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                  }`}
                >
                  {stats.averageScore >= 80 ? "Memuaskan" : "Perlu Latihan"}
                </span>
              )}
            </div>
            <p className="mt-4 text-[11px] text-[var(--color-ink-2)]">
              Rerata akurasi jawaban kuis regional
            </p>
          </div>

          {/* 4. Nilai Tertinggi */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-4 shadow-xs">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
              Skor Tertinggi
            </p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-display text-3xl font-extrabold text-[var(--color-accent)]">
                {stats.totalQuizzes > 0 ? `${stats.highestScore}%` : "—"}
              </span>
              <span className="font-mono text-xs text-[var(--color-ink-2)]">
                Pencapaian
              </span>
            </div>
            <p className="mt-4 text-[11px] text-[var(--color-ink-2)]">
              Rekor kuis terbaik Anda sejauh ini
            </p>
          </div>
        </div>

        {/* Category Breakdown Bar */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-4 shadow-xs space-y-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
            Sebaran Domain Budaya yang Dipelajari
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(["bahasa", "musik", "makanan", "pakaian", "tarian"] as CulturalCategory[]).map((cat) => {
              const count = stats.categoryCounts[cat] || 0;
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-[var(--radius-input)] border border-[var(--color-rule-subtle)] bg-[var(--color-paper-2)] p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-accent)]">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs font-bold capitalize text-[var(--color-ink)]">
                      {cat}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--color-ink-2)]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation for History & Details */}
        <div className="flex items-center justify-between border-b border-[var(--color-rule)] pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ringkasan")}
              className={`border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
                activeTab === "ringkasan"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
              }`}
            >
              Rekomendasi & Ikhtisar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("materi")}
              className={`border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
                activeTab === "materi"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
              }`}
            >
              Materi Dipelajari ({learnedList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kuis")}
              className={`border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
                activeTab === "kuis"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
              }`}
            >
              Riwayat Kuis ({quizList.length})
            </button>
          </div>

          {(learnedList.length > 0 || quizList.length > 0) && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset seluruh data progres belajar di peramban ini?")) {
                  clearStoredProgress();
                }
              }}
              className="font-mono text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-error)] underline"
            >
              Reset Data
            </button>
          )}
        </div>

        {/* Tab 1: Rekomendasi & Ikhtisar */}
        {activeTab === "ringkasan" && (
          <div className="space-y-6">
            {/* Smart Recommendations */}
            <section className="space-y-3">
              <div>
                <h2 className="font-display text-base font-bold text-[var(--color-ink)]">
                  Rekomendasi Materi Budaya Berikutnya
                </h2>
                <p className="text-xs text-[var(--color-ink-2)]">
                  Disarankan otomatis berdasarkan domain yang belum Anda kuasai dan provinsi yang belum dijelajahi.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.item.slug}
                    className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-3.5 shadow-xs"
                  >
                    <div>
                      <span className="inline-block rounded bg-[var(--color-paper-2)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-accent)]">
                        {rec.badgeText}
                      </span>
                      <h3 className="mt-2 font-display text-sm font-bold text-[var(--color-ink)]">
                        {rec.item.name}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-2)]">
                        Provinsi {rec.item.provinceName}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-[var(--color-ink-3)]">
                        {rec.item.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-rule-subtle)]">
                      <Link
                        href={`/?focus=${rec.item.slug}&province=${rec.item.provinceId}`}
                        className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
                      >
                        Lihat di Peta
                      </Link>
                      <Link
                        href={`/tanya-ai?budaya=${encodeURIComponent(rec.item.name)}&slug=${rec.item.slug}`}
                        className="hm-interactive rounded-[var(--radius-input)] bg-[var(--color-accent)] px-2.5 py-1 text-xs font-bold text-[var(--color-accent-ink)]"
                      >
                        Tanya AI
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Materi yang Sudah Dipelajari */}
        {activeTab === "materi" && (
          <div className="space-y-3">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--color-ink)]">
                Daftar Materi Budaya yang Telah Dipelajari
              </h2>
              <p className="text-xs text-[var(--color-ink-2)]">
                Tercatat saat Anda membaca dan mengeksplorasi kartu budaya pada peta.
              </p>
            </div>

            {learnedList.length === 0 ? (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule-strong)] p-8 text-center">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  Belum Ada Materi yang Tercatat
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-2)]">
                  Buka halaman Jelajahi Budaya dan klik rincian budaya daerah untuk memulai pembelajaran.
                </p>
                <Link
                  href="/"
                  className="hm-interactive mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-input)] bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-[var(--color-accent-ink)]"
                >
                  Mulai Jelajah Budaya
                </Link>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {learnedList.map((item) => (
                  <div
                    key={item.slug}
                    className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-3 shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {item.thumbnailPath && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.thumbnailPath}
                          alt={item.name}
                          className="h-12 w-12 rounded object-cover border border-[var(--color-rule-subtle)]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[9px] font-bold uppercase text-[var(--color-accent)]">
                          {item.category}
                        </span>
                        <h3 className="truncate font-display text-sm font-bold text-[var(--color-ink)]">
                          {item.name}
                        </h3>
                        <p className="truncate text-xs text-[var(--color-ink-2)]">
                          Provinsi {item.provinceName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--color-rule-subtle)] pt-2 text-[11px] text-[var(--color-ink-3)]">
                      <span>Dilihat {item.viewCount}x</span>
                      <Link
                        href={`/tanya-ai?budaya=${encodeURIComponent(item.name)}&slug=${item.slug}`}
                        className="text-[var(--color-accent)] font-semibold hover:underline"
                      >
                        Diskusi di AI →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Riwayat Hasil Kuis */}
        {activeTab === "kuis" && (
          <div className="space-y-3">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--color-ink)]">
                Riwayat Kuis Budaya Regional
              </h2>
              <p className="text-xs text-[var(--color-ink-2)]">
                Hasil evaluasi dan skor setiap sesi kuis yang telah Anda kerjakan.
              </p>
            </div>

            {quizList.length === 0 ? (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule-strong)] p-8 text-center">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  Belum Ada Riwayat Kuis
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-2)]">
                  Uji pemahaman budaya Anda dengan memulai kuis di provinsi mana pun pada peta.
                </p>
                <Link
                  href="/"
                  className="hm-interactive mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-input)] bg-[var(--color-accent)] px-3 py-1.5 text-xs font-bold text-[var(--color-accent-ink)]"
                >
                  Buka Peta & Kerjakan Kuis
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {quizList.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-3.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-input)] font-display text-base font-extrabold ${
                          q.scorePercent >= 80
                            ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                            : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                        }`}
                      >
                        {q.scorePercent}%
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
                          Kuis Provinsi {q.provinceName}
                        </h3>
                        <p className="text-xs text-[var(--color-ink-2)]">
                          {q.correctAnswers} benar dari {q.totalQuestions} soal · Selesai pada{" "}
                          {new Date(q.completedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/?province=${q.provinceId}&quiz=1`}
                        className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
                      >
                        Ulangi Kuis
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="mt-8 pt-4 border-t border-[var(--color-rule-subtle)] text-center text-xs text-[var(--color-ink-3)]">
          Progres belajar disimpan secara lokal pada peramban perangkat Anda. Tidak memerlukan login pihak ketiga.
        </footer>
      </main>
    </div>
  );
}
