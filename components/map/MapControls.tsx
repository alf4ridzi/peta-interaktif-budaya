"use client";

import React from "react";
import {
  ISLAND_PRESETS,
  IslandViewportPreset,
} from "@/lib/geo/geo-service";
import { IconCompass, IconZoomIn, IconZoomOut } from "@/components/ui/Icons";
import { IslandGroup } from "@/types/culture";

interface MapControlsProps {
  activeIsland: IslandGroup | "Nusantara";
  zoom: number;
  onSelectPreset: (preset: IslandViewportPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function MapControls({
  activeIsland,
  zoom,
  onSelectPreset,
  onZoomIn,
  onZoomOut,
  onReset,
}: MapControlsProps) {
  return (
    <>
      {/* Bottom-Left Island Quick-Jump Bar */}
      <div
        className="absolute bottom-4 left-4 z-20 flex max-w-[calc(100vw-2rem)] items-center gap-1.5 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-glass)] p-1.5 shadow-sm backdrop-blur-md"
        role="toolbar"
        aria-label="Pintasan Kepulauan Nusantara"
      >
        {ISLAND_PRESETS.map((preset) => {
          const isActive = activeIsland === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`hm-interactive whitespace-nowrap rounded-[var(--radius-input)] border px-2.5 py-1.5 text-xs font-medium ${
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                  : "border-transparent bg-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
              }`}
              aria-pressed={isActive}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Top-Left / Bottom-Right Zoom & Reset Controls */}
      <div
        className="absolute top-20 left-4 z-20 flex flex-col gap-1.5 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-glass)] p-1.5 shadow-sm backdrop-blur-md"
        role="group"
        aria-label="Kontrol Kamera Peta"
      >
        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoom >= 8}
          className="hm-interactive flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-rule-subtle)] bg-[var(--color-paper)] text-[var(--color-ink)]"
          title="Perbesar Peta (Zoom In)"
          aria-label="Perbesar Peta"
        >
          <IconZoomIn size={16} />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoom <= 1}
          className="hm-interactive flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-rule-subtle)] bg-[var(--color-paper)] text-[var(--color-ink)]"
          title="Perkecil Peta (Zoom Out)"
          aria-label="Perkecil Peta"
        >
          <IconZoomOut size={16} />
        </button>
        <button
          type="button"
          onClick={onReset}
          className="hm-interactive flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-rule-subtle)] bg-[var(--color-paper)] text-[var(--color-ink)]"
          title="Reset Pandangan Nusantara"
          aria-label="Reset Pandangan Nusantara"
        >
          <IconCompass size={16} />
        </button>
        <div className="border-t border-[var(--color-rule-subtle)] pt-1 text-center font-mono text-[10px] text-[var(--color-ink-3)]">
          {zoom.toFixed(1)}×
        </div>
      </div>
    </>
  );
}

