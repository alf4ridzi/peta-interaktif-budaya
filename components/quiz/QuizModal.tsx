"use client";

import React, { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizSummary } from "./QuizSummary";
import { IconClose, IconQuiz } from "@/components/ui/Icons";
import { recordQuizAttempt } from "@/lib/progress/progress-service";

interface QuizModalProps {
  isOpen: boolean;
  regionName: string;
  questions: QuizQuestion[];
  onClose: () => void;
}

export function QuizModal({
  isOpen,
  regionName,
  questions,
  onClose,
}: QuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const progressPercent = isComplete
    ? 100
    : Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    if (index === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsComplete(true);
      const total = questions.length;
      recordQuizAttempt({
        provinceId: questions[0]?.provinceId || "31",
        provinceName: regionName,
        totalQuestions: total,
        correctAnswers: score,
        scorePercent: total > 0 ? Math.round((score / total) * 100) : 0,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsComplete(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-paper-elevated)] shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <IconQuiz size={18} className="text-[var(--color-accent)]" />
            <div>
              <h2
                id="quiz-modal-title"
                className="font-display text-sm font-bold text-[var(--color-ink)] sm:text-base"
              >
                Kuis Budaya Daerah: {regionName}
              </h2>
              <p className="font-mono text-[11px] text-[var(--color-ink-2)]">
                Skor Sementara: {score} Benar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Kuis Budaya"
            className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-1.5 text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-[var(--color-paper-3)]">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="max-h-[80vh] overflow-y-auto p-5">
          {!isComplete ? (
            <QuizQuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedOption={selectedOption}
              onSelectOption={handleSelectOption}
              onNextQuestion={handleNext}
              isLastQuestion={currentIndex + 1 === questions.length}
            />
          ) : (
            <QuizSummary
              regionName={regionName}
              score={score}
              totalQuestions={questions.length}
              onRetry={handleRetry}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

