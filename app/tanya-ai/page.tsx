import React, { Suspense } from "react";
import { TanyaAIChat } from "@/components/ai/TanyaAIChat";

export const metadata = {
  title: "Tanya AI tentang Budaya Indonesia — Peta Interaktif Budaya Nusantara",
  description:
    "Diskusikan sejarah, makna filosofis, dan ragam kebudayaan Nusantara bersama Pamong Budaya AI berbasis 1.722 arsip data terverifikasi.",
};

export default function TanyaAIPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center bg-[var(--color-paper)]">
          <p className="font-mono text-xs text-[var(--color-ink-2)] animate-pulse">
            Memuat Asisten Budaya AI...
          </p>
        </div>
      }
    >
      <TanyaAIChat />
    </Suspense>
  );
}

