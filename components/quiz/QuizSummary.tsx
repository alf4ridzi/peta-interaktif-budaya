"use client";

import React from "react";
import Link from "next/link";
import { getMasteryRank } from "@/types/quiz";
import { IconQuiz } from "@/components/ui/Icons";

interface QuizSummaryProps {
  regionName: string;
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onClose: () => void;
}

export function QuizSummary({
  regionName,
  score,
  totalQuestions,
  onRetry,
  onClose,
}: QuizSummaryProps) {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const { rank, description } = getMasteryRank(percentage);

  return (
    <div className="space-y-5 py-2 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
        <IconQuiz size={30} />
      </div>

      <div>
        <span className="rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
          Gelar Apresiasi Budaya
        </span>
        <h3 className="mt-2 font-display text-2xl font-extrabold text-[var(--color-ink)]">
          {rank}
        </h3>
        <p className="mt-1 text-xs font-medium text-[var(--color-ink-2)]">
          Wilayah Uji: {regionName}
        </p>
      </div>

      {/* Score Card */}
      <div className="mx-auto grid max-w-xs grid-cols-2 gap-3 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4">
        <div>
          <p className="font-mono text-[11px] uppercase text-[var(--color-ink-3)]">
            Jawaban Benar
          </p>
          <p className="mt-0.5 font-display text-2xl font-extrabold text-[var(--color-ink)]">
            {score} / {totalQuestions}
          </p>
        </div>
        <div className="border-l border-[var(--color-rule)] pl-3">
          <p className="font-mono text-[11px] uppercase text-[var(--color-ink-3)]">
            Akurasi
          </p>
          <p className="mt-0.5 font-display text-2xl font-extrabold text-[var(--color-accent)]">
            {percentage}%
          </p>
        </div>
      </div>

      <p className="mx-auto max-w-md text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-5 py-2.5 text-xs font-bold text-[var(--color-accent-ink)] hover:bg-[var(--color-accent-hover)]"
        >
          Ulangi Kuis Daerah Ini
        </button>
        <Link
          href="/progres"
          onClick={onClose}
          className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-rule-strong)] bg-[var(--color-paper-2)] px-5 py-2.5 text-xs font-bold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
        >
          Lihat Progres Belajar →
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-5 py-2.5 text-xs font-bold text-[var(--color-ink-2)]"
        >
          Kembali ke Peta
        </button>
      </div>
    </div>
  );
}

