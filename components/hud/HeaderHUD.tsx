"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CATEGORY_META,
  CulturalCategory,
  CulturalItem,
  ProvinceRecord,
  RegencyRecord,
} from "@/types/culture";
import {
  IconBahasa,
  IconClose,
  IconMakanan,
  IconMapPin,
  IconMusik,
  IconPakaian,
  IconSearch,
  IconTarian,
} from "@/components/ui/Icons";
import { formatTitleCase } from "@/lib/utils";

interface HeaderHUDProps {
  provinces: ProvinceRecord[];
  regencies: RegencyRecord[];
  items: CulturalItem[];
  activeCategory: CulturalCategory | "semua";
  onSelectCategory: (cat: CulturalCategory | "semua") => void;
  onSelectProvince: (provinceId: string) => void;
  onSelectRegency: (provinceId: string, regencyId: string) => void;
  onSelectCulturalItem: (item: CulturalItem) => void;
  onStartQuiz?: () => void;
  activeRegionName?: string;
}

const CATEGORY_ICON_MAP: Record<CulturalCategory, React.ReactNode> = {
  bahasa: <IconBahasa size={14} />,
  musik: <IconMusik size={14} />,
  makanan: <IconMakanan size={14} />,
  pakaian: <IconPakaian size={14} />,
  tarian: <IconTarian size={14} />,
};

export function HeaderHUD({
  provinces,
  regencies,
  items,
  activeCategory,
  onSelectCategory,
  onSelectProvince,
  onSelectRegency,
  onSelectCulturalItem,
}: HeaderHUDProps) {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;

    const matchedProvinces = provinces
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.capital.toLowerCase().includes(q)
      )
      .slice(0, 4);

    const matchedRegencies = regencies
      .filter((r) => r.name.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedItems = items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.regencyName && item.regencyName.toLowerCase().includes(q)) ||
          item.provinceName.toLowerCase().includes(q)
      )
      .slice(0, 8);

    return {
      provinces: matchedProvinces,
      regencies: matchedRegencies,
      items: matchedItems,
      total:
        matchedProvinces.length +
        matchedRegencies.length +
        matchedItems.length,
    };
  }, [query, provinces, regencies, items]);

  const categories: (CulturalCategory | "semua")[] = [
    "semua",
    "bahasa",
    "musik",
    "makanan",
    "pakaian",
    "tarian",
  ];

  return (
    <header className="relative z-30 border-b border-[var(--color-rule)] bg-[var(--color-paper-elevated)] px-4 py-2.5">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Title & Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            title="Peta Interaktif Budaya Nusantara"
          >
            <Image
              src="/logo.png"
              alt="Logo Peta Interaktif Budaya Nusantara"
              width={38}
              height={38}
              priority
              className="h-9 w-9 shrink-0 object-contain"
            />
            <div>
              <h1 className="font-display text-base font-bold tracking-tight text-[var(--color-ink)] sm:text-lg">
                Peta Interaktif Budaya Nusantara
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation & Compact Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex items-center gap-1.5" aria-label="Navigasi Utama">
            <Link
              href="/tanya-ai"
              className="hm-interactive inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            >
              <span className="font-bold text-[var(--color-accent)]">AI</span>
              <span>Tanya AI</span>
            </Link>
            <Link
              href="/progres"
              className="hm-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            >
              <span>Progres Belajar</span>
            </Link>
          </nav>

          {/* Compact Search Bar Only */}
          <div className="relative w-full sm:w-56 md:w-64">
            <IconSearch
              size={13}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[var(--color-ink-3)]"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Cari provinsi, budaya..."
              aria-label="Cari provinsi, kabupaten, atau warisan budaya"
              className="hm-interactive h-8 w-full rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] pr-7 pl-8 text-xs text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-accent)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Bersihkan pencarian"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
              >
                <IconClose size={13} />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults && (
              <div
                className="absolute top-full right-0 left-auto z-50 mt-1.5 w-72 sm:w-80 md:w-96 max-h-96 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-paper-elevated)] p-2 shadow-lg"
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                {searchResults.total === 0 ? (
                  <p className="p-3 text-center text-xs text-[var(--color-ink-2)]">
                    Tidak ditemukan hasil untuk &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.provinces.length > 0 && (
                      <div>
                        <p className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
                          Provinsi
                        </p>
                        {searchResults.provinces.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSelectProvince(p.id);
                              setIsSearchOpen(false);
                              setQuery("");
                            }}
                            className="hm-interactive flex w-full items-center justify-between rounded-[var(--radius-input)] px-2.5 py-1.5 text-left text-xs"
                          >
                            <span className="flex items-center gap-1.5 font-semibold text-[var(--color-ink)]">
                              <IconMapPin size={13} className="text-[var(--color-accent)]" />
                              Provinsi {p.name}
                            </span>
                            <span className="text-[11px] text-[var(--color-ink-3)]">
                              {p.islandGroup}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.regencies.length > 0 && (
                      <div>
                        <p className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
                          Kabupaten / Kota
                        </p>
                        {searchResults.regencies.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              onSelectRegency(r.provinceId, r.id);
                              setIsSearchOpen(false);
                              setQuery("");
                            }}
                            className="hm-interactive flex w-full items-center justify-between rounded-[var(--radius-input)] px-2.5 py-1.5 text-left text-xs"
                          >
                            <span className="font-medium text-[var(--color-ink)]">
                              {formatTitleCase(r.name)}
                            </span>
                            <span className="font-mono text-[10px] text-[var(--color-ink-3)]">
                              Kode {r.id}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.items.length > 0 && (
                      <div>
                        <p className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-3)]">
                          Warisan Budaya
                        </p>
                        {searchResults.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectCulturalItem(item);
                              setIsSearchOpen(false);
                              setQuery("");
                            }}
                            className="hm-interactive flex w-full items-center justify-between gap-2 rounded-[var(--radius-input)] px-2.5 py-1.5 text-left text-xs"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[var(--color-ink)]">
                                {item.name}
                              </p>
                              <p className="truncate text-[11px] text-[var(--color-ink-2)]">
                                {item.regencyName
                                  ? `${formatTitleCase(item.regencyName)}, `
                                  : ""}
                                {item.provinceName}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--color-accent)]">
                              {CATEGORY_META[item.category].shortLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Strip */}
      
    </header>
  );
}

