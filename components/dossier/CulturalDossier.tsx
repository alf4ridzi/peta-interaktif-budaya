"use client";

import React, { useMemo } from "react";
import {
  CATEGORY_META,
  CulturalCategory,
  CulturalItem,
  DistrictRecord,
  ProvinceRecord,
  RegencyRecord,
} from "@/types/culture";
import { CategoryTabs } from "./CategoryTabs";
import { CulturalCard } from "./CulturalCard";
import { IconClose, IconMapPin, IconQuiz } from "@/components/ui/Icons";
import { formatTitleCase } from "@/lib/utils";

interface CulturalDossierProps {
  province: ProvinceRecord;
  regenciesInProvince: RegencyRecord[];
  selectedRegency: RegencyRecord | null;
  districtsInRegency: DistrictRecord[];
  selectedDistrict: DistrictRecord | null;
  provinceItems: CulturalItem[];
  activeTab: CulturalCategory;
  highlightedItemSlug: string | null;
  onSelectTab: (tab: CulturalCategory) => void;
  onSelectRegency: (regencyId: string | null) => void;
  onSelectDistrict: (districtId: string | null) => void;
  onStartQuiz: () => void;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export function CulturalDossier({
  province,
  regenciesInProvince,
  selectedRegency,
  districtsInRegency,
  selectedDistrict,
  provinceItems,
  activeTab,
  highlightedItemSlug,
  onSelectTab,
  onSelectRegency,
  onSelectDistrict,
  onStartQuiz,
  onClose,
  onCloseMobile,
}: CulturalDossierProps) {
  // Compute category counts for current selection (or province)
  const categoryCounts = useMemo(() => {
    const counts: Record<CulturalCategory, number> = {
      bahasa: 0,
      musik: 0,
      makanan: 0,
      pakaian: 0,
      tarian: 0,
    };

    const relevant = selectedRegency
      ? provinceItems.filter((i) => i.regencyId === selectedRegency.id)
      : provinceItems;

    const sourceList = relevant.length > 0 ? relevant : provinceItems;
    for (const item of sourceList) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [provinceItems, selectedRegency]);

  // Filter items for the active category tab with graceful provincial fallback (REQ-CUL-005)
  const { displayedItems, isProvincialFallback } = useMemo(() => {
    const byCategory = provinceItems.filter((i) => i.category === activeTab);
    if (!selectedRegency) {
      return { displayedItems: byCategory, isProvincialFallback: false };
    }

    const regencyMatches = byCategory.filter(
      (i) => i.regencyId === selectedRegency.id
    );
    if (regencyMatches.length > 0) {
      return { displayedItems: regencyMatches, isProvincialFallback: false };
    }

    return { displayedItems: byCategory, isProvincialFallback: true };
  }, [provinceItems, activeTab, selectedRegency]);

  const activeTerritoryTitle = selectedDistrict
    ? `Kec. ${formatTitleCase(selectedDistrict.name)}`
    : selectedRegency
    ? formatTitleCase(selectedRegency.name)
    : `Provinsi ${province.name}`;

  return (
    <aside
      aria-label={`Dokumen Budaya ${activeTerritoryTitle}`}
      className="flex h-full w-full flex-col border-t border-[var(--color-rule)] bg-[var(--color-paper)] md:w-[420px] md:border-t-0 md:border-l xl:w-[460px]"
    >
      {/* Dossier Header */}
      <div className="border-b border-[var(--color-rule)] bg-[var(--color-paper-elevated)] p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                Kepulauan {province.islandGroup}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
                Kode BPS: {selectedRegency ? selectedRegency.id : province.id}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-[var(--color-ink)]">
              {activeTerritoryTitle}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-ink-2)]">
              {selectedRegency
                ? `Bagian dari Provinsi ${province.name} · Ibu Kota Provinsi: ${province.capital}`
                : `Ibu Kota: ${province.capital} · ${regenciesInProvince.length} Kabupaten/Kota · ${provinceItems.length} Warisan Budaya`}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup panel budaya"
                title="Tutup panel budaya (kembali ke peta penuh)"
                className="hm-interactive hidden rounded-[var(--radius-input)] border border-[var(--color-rule)] p-1.5 text-[var(--color-ink-2)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] md:flex"
              >
                <IconClose size={16} />
              </button>
            )}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Tutup panel budaya"
                className="hm-interactive rounded-[var(--radius-input)] border border-[var(--color-rule)] p-1.5 text-[var(--color-ink-2)] md:hidden"
              >
                <IconClose size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Hierarchical Drilldown Selectors (Kabupaten/Kota & Kecamatan) */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label
              htmlFor="select-regency"
              className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]"
            >
              Kabupaten / Kota ({regenciesInProvince.length})
            </label>
            <select
              id="select-regency"
              value={selectedRegency?.id || ""}
              onChange={(e) =>
                onSelectRegency(e.target.value ? e.target.value : null)
              }
              className="hm-interactive mt-1 h-8 w-full rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 text-xs font-medium text-[var(--color-ink)]"
            >
              <option value="">Semua Kab/Kota di {province.name}</option>
              {regenciesInProvince.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {formatTitleCase(reg.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="select-district"
              className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]"
            >
              Kecamatan ({districtsInRegency.length || "Pilih Kab/Kota"})
            </label>
            <select
              id="select-district"
              disabled={!selectedRegency}
              value={selectedDistrict?.id || ""}
              onChange={(e) =>
                onSelectDistrict(e.target.value ? e.target.value : null)
              }
              className="hm-interactive mt-1 h-8 w-full rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2 text-xs font-medium text-[var(--color-ink)] disabled:opacity-45"
            >
              <option value="">
                {selectedRegency
                  ? "Semua Kecamatan"
                  : "Pilih Kabupaten dahulu"}
              </option>
              {districtsInRegency.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  Kec. {formatTitleCase(dist.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quiz Action Button (REQ-QZ-001) */}
        <button
          type="button"
          onClick={onStartQuiz}
          className="hm-interactive mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-input)] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-xs font-bold text-[var(--color-accent-ink)] shadow-xs hover:bg-[var(--color-accent-hover)]"
        >
          <IconQuiz size={16} />
          <span>
            Uji Wawasan: Mulai Kuis Budaya{" "}
            {selectedRegency
              ? formatTitleCase(selectedRegency.name)
              : province.name}
          </span>
        </button>
      </div>

      {/* 5-Pillar Category Tabs */}
      <CategoryTabs
        activeTab={activeTab}
        counts={categoryCounts}
        onSelectTab={onSelectTab}
      />

      {/* Scrollable Cultural Items Feed */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
        {/* Category Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-rule-subtle)] pb-2">
          <div>
            <h3 className="font-display text-sm font-bold text-[var(--color-ink)]">
              {CATEGORY_META[activeTab].label}
            </h3>
            <p className="text-[11px] text-[var(--color-ink-2)]">
              {CATEGORY_META[activeTab].subtitle}
            </p>
          </div>
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--color-ink)]">
            {displayedItems.length} Data
          </span>
        </div>

        {/* Graceful Fallback Notice when Regency inherits Province items (REQ-CUL-005) */}
        {isProvincialFallback && selectedRegency && (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-paper-2)] p-3 text-xs text-[var(--color-ink-2)]">
            <p className="font-semibold text-[var(--color-ink)]">
              Warisan Budaya Bersama Provinsi {province.name}
            </p>
            <p className="mt-0.5">
              Menampilkan khazanah {CATEGORY_META[activeTab].label.toLowerCase()}{" "}
              yang hidup di wilayah Provinsi {province.name} dan sekitarnya untuk{" "}
              {formatTitleCase(selectedRegency.name)}.
            </p>
            <button
              type="button"
              onClick={() => onSelectRegency(null)}
              className="mt-1.5 inline-flex items-center gap-1 font-semibold text-[var(--color-accent)] hover:underline"
            >
              <IconMapPin size={12} />
              <span>Lihat seluruh Kabupaten/Kota di {province.name}</span>
            </button>
          </div>
        )}

        {/* Cultural Cards List */}
        {displayedItems.map((item) => (
          <CulturalCard
            key={item.id}
            item={item}
            isHighlighted={highlightedItemSlug === item.slug}
            onSelectRegency={(regId) => onSelectRegency(regId)}
          />
        ))}
      </div>
    </aside>
  );
}

