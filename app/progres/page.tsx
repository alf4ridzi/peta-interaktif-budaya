import fs from "fs";
import path from "path";
import React, { Suspense } from "react";
import { CulturalItem } from "@/types/culture";
import { LearningDashboard } from "@/components/progress/LearningDashboard";

export const metadata = {
  title: "Progres Belajar Budaya Indonesia — Peta Interaktif Budaya Nusantara",
  description:
    "Pantau riwayat eksplorasi budaya, evaluasi skor kuis regional, dan dapatkan rekomendasi materi pembelajaran budaya Nusantara.",
};

export default function ProgresPage() {
  const root = process.cwd();
  const raw = fs.readFileSync(
    path.join(root, "public/data/normalized/unified-culture.json"),
    "utf8"
  );
  const culturalItems = JSON.parse(raw) as CulturalItem[];

  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center bg-[var(--color-paper)]">
          <p className="font-mono text-xs text-[var(--color-ink-2)] animate-pulse">
            Memuat Dashboard Pembelajaran...
          </p>
        </div>
      }
    >
      <LearningDashboard culturalItems={culturalItems} />
    </Suspense>
  );
}
