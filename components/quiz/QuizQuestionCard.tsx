"use client";

import React from "react";
import { CATEGORY_META } from "@/types/culture";
import { QuizQuestion } from "@/types/quiz";
import { IconCheck, IconClose } from "@/components/ui/Icons";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export function QuizQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNextQuestion,
  isLastQuestion,
}: QuizQuestionCardProps) {
  const hasAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctIndex;
  const catMeta = CATEGORY_META[question.category];
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="space-y-4">
      {/* Category & Progress Pill */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider"
          style={{ color: catMeta.accentVar }}
        >
          Kategori: {catMeta.label}
        </span>
        <span className="font-mono text-xs font-semibold text-[var(--color-ink-2)]">
          Pertanyaan {questionNumber} dari {totalQuestions}
        </span>
      </div>

      {/* Question Prompt */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4">
        <h3 className="font-display text-base font-bold leading-snug text-[var(--color-ink)] sm:text-lg">
          {question.question}
        </h3>
      </div>

      {/* 4 Answer Choices (Strict 8-State Styling) */}
      <div className="space-y-2.5" role="radiogroup" aria-label="Pilihan Jawaban">
        {question.options.map((optText, idx) => {
          const isSelected = selectedOption === idx;
          const isTrueAnswer = idx === question.correctIndex;

          let dataState: "success" | "error" | undefined = undefined;
          if (hasAnswered) {
            if (isTrueAnswer) dataState = "success";
            else if (isSelected && !isTrueAnswer) dataState = "error";
          }

          return (
            <button
              key={`${question.id}-opt-${idx}`}
              type="button"
              disabled={hasAnswered && !isSelected && !isTrueAnswer}
              data-state={dataState}
              onClick={() => {
                if (!hasAnswered) onSelectOption(idx);
              }}
              className="hm-interactive flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-3 text-left text-sm font-medium text-[var(--color-ink)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-rule-strong)] bg-[var(--color-paper-2)] font-mono text-xs font-bold">
                  {optionLetters[idx]}
                </span>
                <span className="font-semibold">{optText}</span>
              </div>

              {hasAnswered && isTrueAnswer && (
                <span className="flex items-center gap-1 font-mono text-xs font-bold text-[var(--color-success)]">
                  <IconCheck size={16} />
                  <span>Benar</span>
                </span>
              )}
              {hasAnswered && isSelected && !isTrueAnswer && (
                <span className="flex items-center gap-1 font-mono text-xs font-bold text-[var(--color-error)]">
                  <IconClose size={16} />
                  <span>Kurang Tepat</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Instant Cultural Trivia Box upon Answering (REQ-QZ-003) */}
      {hasAnswered && (
        <div
          className={`rounded-[var(--radius-card)] border p-4 ${
            isCorrect
              ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
              : "border-[var(--color-error)] bg-[var(--color-error-bg)]"
          }`}
        >
          <p className="font-display text-sm font-bold text-[var(--color-ink)]">
            {isCorrect
              ? "Jawaban Anda Tepat!"
              : `Jawaban yang Benar: ${question.options[question.correctIndex]}`}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
            {question.explanationTrivia}
          </p>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onNextQuestion}
              className="hm-interactive rounded-[var(--radius-input)] bg-[var(--color-ink)] px-4 py-2 text-xs font-bold text-[var(--color-paper)] hover:opacity-90"
            >
              {isLastQuestion
                ? "Lihat Hasil Akhir Kuis →"
                : "Pertanyaan Selanjutnya →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

