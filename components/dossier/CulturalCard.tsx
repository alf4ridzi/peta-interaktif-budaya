"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_META, CulturalItem } from "@/types/culture";
import { IconMapPin } from "@/components/ui/Icons";
import { formatTitleCase } from "@/lib/utils";
import { recordLearnedItem } from "@/lib/progress/progress-service";

interface CulturalCardProps {
  item: CulturalItem;
  isHighlighted?: boolean;
  onSelectRegency?: (regencyId: string) => void;
}

export function CulturalCard({
  item,
  isHighlighted = false,
  onSelectRegency,
}: CulturalCardProps) {
  const meta = CATEGORY_META[item.category];
  const [imgSrc, setImgSrc] = useState(
    item.media?.localImagePath || meta.fallbackSvg
  );
  const [expanded, setExpanded] = useState(false);

  const isLongDescription = item.description.length > 220;

  useEffect(() => {
    // Record learning activity upon viewing/exploring card
    recordLearnedItem(item);
  }, [item]);

  return (
    <article
      id={`card-${item.slug}`}
      className={`overflow-hidden rounded-[var(--radius-card)] border transition-colors ${
        isHighlighted
          ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] shadow-sm"
          : "border-[var(--color-rule)] bg-[var(--color-paper-elevated)]"
      }`}
    >
      {/* Authentic Local Image / Cultural Plate */}
      <figure className="relative aspect-[16/10] w-full overflow-hidden border-b border-[var(--color-rule-subtle)] bg-[var(--color-paper-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={item.media?.caption || item.name}
          loading="lazy"
          onError={() => {
            if (imgSrc !== meta.fallbackSvg) {
              setImgSrc(meta.fallbackSvg);
            }
          }}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
        <div className="
          absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5
        ">
          <span
            className="rounded-[var(--radius-pill)] bg-[var(--color-paper-glass)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md"
            style={{ color: meta.accentVar }}
          >
            {meta.label}
          </span>
          {!imgSrc.endsWith(".svg") && (
            <span className="rounded-[var(--radius-pill)] bg-[var(--color-ink)]/80 px-2 py-0.5 font-mono text-[10px] text-[var(--color-paper)] backdrop-blur-xs">
              Foto Dokumentasi
            </span>
          )}
        </div>
      </figure>

      {/* Content Body */}
      <div className="p-4">
        {/* Title & Local Designation */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-[var(--color-ink)]">
              {item.name}
            </h3>
            {item.localName && (
              <p className="text-xs font-medium text-[var(--color-ink-2)]">
                Sebutan Lokal: {item.localName}
              </p>
            )}
          </div>
        </div>

        {/* Administrative Origin Badge (Province -> Regency -> Kecamatan) */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.regencyName && item.regencyId ? (
            <button
              type="button"
              onClick={() => onSelectRegency?.(item.regencyId!)}
              className="hm-interactive inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)]"
              title="Fokuskan peta ke kabupaten/kota ini"
            >
              <IconMapPin size={12} className="text-[var(--color-accent)]" />
              <span>{formatTitleCase(item.regencyName)}</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-2)]">
              <IconMapPin size={12} className="text-[var(--color-accent)]" />
              <span>Provinsi {item.provinceName}</span>
            </span>
          )}

          {item.districtName && (
            <span className="rounded-[var(--radius-input)] border border-[var(--color-rule-subtle)] bg-[var(--color-paper)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-ink-2)]">
              Kec. {formatTitleCase(item.districtName)}
            </span>
          )}
        </div>

        {/* Category-Specific Metadata Pills */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.attributes.instrumentType && (
            <span className="rounded bg-[var(--color-paper-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-2)]">
              Jenis: {item.attributes.instrumentType}
            </span>
          )}
          {item.attributes.playingMethod && (
            <span className="rounded bg-[var(--color-paper-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-2)]">
              Cara Main: {item.attributes.playingMethod}
            </span>
          )}
          {item.attributes.garmentUser && (
            <span className="rounded bg-[var(--color-paper-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-2)]">
              Pemakai: {item.attributes.garmentUser}
            </span>
          )}
          {item.attributes.regionalOrigin && (
            <span className="rounded bg-[var(--color-paper-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-2)]">
              Asal: {item.attributes.regionalOrigin}
            </span>
          )}
        </div>

        {/* Ethnographic Description */}
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-2)] sm:text-sm">
          {expanded || !isLongDescription
            ? item.description
            : `${item.description.slice(0, 215)}...`}
        </p>

        {isLongDescription && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="hm-interactive mt-1.5 rounded px-1.5 py-0.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            {expanded ? "Sembunyikan Rincian" : "Baca Selengkapnya →"}
          </button>
        )}

        {/* Action Row: Tanyakan ke AI */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-rule-subtle)] pt-2.5">
          <Link
            href={`/tanya-ai?budaya=${encodeURIComponent(item.name)}&slug=${item.slug}`}
            onClick={() => recordLearnedItem(item)}
            className="hm-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
            title={`Tanyakan kepada AI tentang ${item.name}`}
          >
            <span className="font-mono text-[10px] font-extrabold">AI</span>
            <span>Tanyakan kepada AI tentang budaya ini →</span>
          </Link>
        </div>

        {/* Provenance & Dataset Footer */}
        <div className="mt-2 flex items-center justify-between border-t border-[var(--color-rule-subtle)] pt-2 font-mono text-[10px] text-[var(--color-ink-3)]">
          <span>Sumber: {item.provenance.sourceDataset}</span>
          {item.originNote && (
            <span className="truncate max-w-[180px]" title={item.originNote}>
              {item.originNote}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

