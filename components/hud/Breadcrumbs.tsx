"use client";

import React from "react";
import { IconChevronRight, IconMapPin } from "@/components/ui/Icons";
import {
  DistrictRecord,
  ProvinceRecord,
  RegencyRecord,
} from "@/types/culture";
import { formatTitleCase } from "@/lib/utils";

interface BreadcrumbsProps {
  selectedProvince: ProvinceRecord | null;
  selectedRegency: RegencyRecord | null;
  selectedDistrict: DistrictRecord | null;
  onResetToNational: () => void;
  onSelectProvince: (provinceId: string) => void;
  onSelectRegency: (regencyId: string) => void;
}

export function Breadcrumbs({
  selectedProvince,
  selectedRegency,
  selectedDistrict,
  onResetToNational,
  onSelectProvince,
  onSelectRegency,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Jejak Hirarki Wilayah Administratif"
      className="absolute top-3 left-4 z-20 flex max-w-[calc(100%-2rem)] items-center gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-glass)] px-3 py-1.5 text-xs shadow-sm backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onResetToNational}
        className={`hm-interactive flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-medium ${
          !selectedProvince
            ? "font-bold text-[var(--color-ink)]"
            : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
        }`}
      >
        <IconMapPin size={13} className="text-[var(--color-accent)]" />
        <span>Indonesia (34 Provinsi)</span>
      </button>

      {selectedProvince && (
        <>
          <IconChevronRight
            size={13}
            className="shrink-0 text-[var(--color-ink-3)]"
          />
          <button
            type="button"
            onClick={() => onSelectProvince(selectedProvince.id)}
            className={`hm-interactive shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 font-medium ${
              !selectedRegency
                ? "font-bold text-[var(--color-accent)]"
                : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
            }`}
          >
            Provinsi {selectedProvince.name}
          </button>
        </>
      )}

      {selectedRegency && (
        <>
          <IconChevronRight
            size={13}
            className="shrink-0 text-[var(--color-ink-3)]"
          />
          <button
            type="button"
            onClick={() => onSelectRegency(selectedRegency.id)}
            className={`hm-interactive shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 font-medium ${
              !selectedDistrict
                ? "font-bold text-[var(--color-accent)]"
                : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
            }`}
          >
            {formatTitleCase(selectedRegency.name)}
          </button>
        </>
      )}

      {selectedDistrict && (
        <>
          <IconChevronRight
            size={13}
            className="shrink-0 text-[var(--color-ink-3)]"
          />
          <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 font-bold text-[var(--color-accent)]">
            Kec. {formatTitleCase(selectedDistrict.name)}
          </span>
        </>
      )}
    </nav>
  );
}

