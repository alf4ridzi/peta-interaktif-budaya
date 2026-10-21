"use client";

import React from "react";
import { CATEGORY_META, CulturalCategory } from "@/types/culture";
import {
  IconBahasa,
  IconMakanan,
  IconMusik,
  IconPakaian,
  IconTarian,
} from "@/components/ui/Icons";

interface CategoryTabsProps {
  activeTab: CulturalCategory;
  counts: Record<CulturalCategory, number>;
  onSelectTab: (tab: CulturalCategory) => void;
}

const ICONS: Record<CulturalCategory, React.ReactNode> = {
  bahasa: <IconBahasa size={15} />,
  musik: <IconMusik size={15} />,
  makanan: <IconMakanan size={15} />,
  pakaian: <IconPakaian size={15} />,
  tarian: <IconTarian size={15} />,
};

export function CategoryTabs({
  activeTab,
  counts,
  onSelectTab,
}: CategoryTabsProps) {
  const tabs: CulturalCategory[] = [
    "musik",
    "makanan",
    "pakaian",
    "tarian",
    "bahasa",
  ];

  return (
    <div
      role="tablist"
      aria-label="Kategori Warisan Budaya Daerah"
      className="grid grid-cols-5 gap-1 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] p-1.5"
    >
      {tabs.map((cat) => {
        const isSelected = activeTab === cat;
        const meta = CATEGORY_META[cat];
        const count = counts[cat] || 0;

        return (
          <button
            key={cat}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onSelectTab(cat)}
            className={`hm-interactive flex flex-col items-center justify-center gap-1 rounded-[var(--radius-input)] border px-1.5 py-2 text-center ${
              isSelected
                ? "border-[var(--color-rule-strong)] bg-[var(--color-paper-elevated)] font-bold text-[var(--color-ink)] shadow-2xs"
                : "border-transparent bg-transparent font-medium text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
            }`}
          >
            <div className="flex items-center gap-1">
              <span
                style={{
                  color: isSelected ? meta.accentVar : "currentColor",
                }}
              >
                {ICONS[cat]}
              </span>
              <span className="rounded-full bg-[var(--color-paper-3)] px-1.5 py-0.2 font-mono text-[10px] font-semibold text-[var(--color-ink)]">
                {count}
              </span>
            </div>
            <span className="w-full truncate text-[11px] leading-tight">
              {meta.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

