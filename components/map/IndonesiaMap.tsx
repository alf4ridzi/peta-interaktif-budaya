"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  GeoCoordinates,
  geometryToSvgPath,
  IslandViewportPreset,
  LAT_MAX,
  LAT_MIN,
  LON_MAX,
  LON_MIN,
  MAP_HEIGHT,
  MAP_WIDTH,
  projectCoord,
} from "@/lib/geo/geo-service";
import {
  CulturalCategory,
  DistrictRecord,
  IslandGroup,
  RegencyRecord,
} from "@/types/culture";
import { MapControls } from "./MapControls";
import { formatTitleCase } from "@/lib/utils";

export interface ProvinceGeoFeature {
  type: "Feature";
  properties: {
    id: string;
    name: string;
    rawName: string;
    islandGroup: IslandGroup;
    capital: string;
    latitude: number;
    longitude: number;
    totalRegencies: number;
  };
  geometry: {
    type: string;
    coordinates: GeoCoordinates;
  };
}

interface IndonesiaMapProps {
  features: ProvinceGeoFeature[];
  regencies: RegencyRecord[];
  districtsByRegency: Record<string, DistrictRecord[]>;
  itemCountsByProvince: Record<string, number>;
  itemCountsByRegency: Record<string, number>;
  selectedProvinceId: string | null;
  selectedRegencyId: string | null;
  selectedDistrictId: string | null;
  activeCategoryFilter: CulturalCategory | "semua";
  camera: {
    lon: number;
    lat: number;
    zoom: number;
    activeIsland: IslandGroup | "Nusantara";
  };
  onCameraChange: (next: {
    lon: number;
    lat: number;
    zoom: number;
    activeIsland: IslandGroup | "Nusantara";
  }) => void;
  onSelectProvince: (provinceId: string) => void;
  onSelectRegency: (regencyId: string) => void;
  onSelectDistrict: (districtId: string) => void;
}

interface TooltipState {
  x: number;
  y: number;
  title: string;
  tier: "Provinsi" | "Kabupaten / Kota" | "Kecamatan";
  subtitle: string;
  cultureCount: number;
}

export function IndonesiaMap({
  features,
  regencies,
  districtsByRegency,
  itemCountsByProvince,
  itemCountsByRegency,
  selectedProvinceId,
  selectedRegencyId,
  selectedDistrictId,
  camera,
  onCameraChange,
  onSelectProvince,
  onSelectRegency,
  onSelectDistrict,
}: IndonesiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    lon: number;
    lat: number;
  } | null>(null);

  // Pre-compute SVG path strings for all 34 provinces once
  const renderedProvinces = useMemo(() => {
    return features.map((f) => {
      const d = geometryToSvgPath(f.geometry);
      const [cx, cy] = projectCoord(
        f.properties.longitude,
        f.properties.latitude
      );
      return {
        ...f.properties,
        pathData: d,
        cx,
        cy,
      };
    });
  }, [features]);

  // Regencies belonging to the currently selected province
  const activeProvinceRegencies = useMemo(() => {
    if (!selectedProvinceId) return [];
    return regencies
      .filter((r) => r.provinceId === selectedProvinceId)
      .map((r) => {
        const [x, y] = projectCoord(r.longitude, r.latitude);
        return { ...r, x, y };
      });
  }, [regencies, selectedProvinceId]);

  // Districts belonging to the currently selected regency
  const activeRegencyDistricts = useMemo(() => {
    if (!selectedRegencyId) return [];
    const list = districtsByRegency[selectedRegencyId] || [];
    return list.map((d) => {
      const [x, y] = projectCoord(d.lon, d.lat);
      return { ...d, x, y };
    });
  }, [districtsByRegency, selectedRegencyId]);

  // Graticule grid lines (Roadless cartographic aesthetic)
  const graticules = useMemo(() => {
    const lonLines = [95, 100, 105, 110, 115, 120, 125, 130, 135, 140].map(
      (lon) => {
        const [x] = projectCoord(lon, 0);
        return { lon, x };
      }
    );
    const latLines = [5, 0, -5, -10].map((lat) => {
      const [, y] = projectCoord(118, lat);
      return { lat, y, isEquator: lat === 0 };
    });
    return { lonLines, latLines };
  }, []);

  // Compute SVG viewBox from camera (lon, lat, zoom)
  const viewBox = useMemo(() => {
    const [centerX, centerY] = projectCoord(camera.lon, camera.lat);
    const vw = MAP_WIDTH / camera.zoom;
    const vh = MAP_HEIGHT / camera.zoom;
    const minX = Math.max(
      -80,
      Math.min(MAP_WIDTH - vw + 80, centerX - vw / 2)
    );
    const minY = Math.max(
      -60,
      Math.min(MAP_HEIGHT - vh + 60, centerY - vh / 2)
    );
    return `${minX.toFixed(2)} ${minY.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`;
  }, [camera]);

  // Pointer drag handlers for smooth panning
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      lon: camera.lon,
      lat: camera.lat,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    const lonSpan = (LON_MAX - LON_MIN) / camera.zoom;
    const latSpan = (LAT_MAX - LAT_MIN) / camera.zoom;

    const nextLon = Math.max(
      LON_MIN + 2,
      Math.min(
        LON_MAX - 2,
        dragStartRef.current.lon - (dx / rect.width) * lonSpan
      )
    );
    const nextLat = Math.max(
      LAT_MIN + 1,
      Math.min(
        LAT_MAX - 1,
        dragStartRef.current.lat + (dy / rect.height) * latSpan
      )
    );

    onCameraChange({
      ...camera,
      lon: nextLon,
      lat: nextLat,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    const nextZoom = Math.max(1, Math.min(8, camera.zoom * factor));
    onCameraChange({
      ...camera,
      zoom: nextZoom,
    });
  };

  const updateTooltipPosition = (
    e: React.MouseEvent,
    data: Omit<TooltipState, "x" | "y">
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    setTooltip({
      ...data,
      x: Math.min(rect.width - 252, Math.max(12, rawX + 14)),
      y: Math.max(12, rawY - 72),
    });
  };

  const handleSelectPreset = (preset: IslandViewportPreset) => {
    onCameraChange({
      lon: preset.lon,
      lat: preset.lat,
      zoom: preset.zoom,
      activeIsland: preset.id,
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full flex-1 overflow-hidden bg-[var(--color-map-ocean)] select-none"
    >
      {/* Subtle Cartographic Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(circle at center, transparent 65%, oklch(0.89 0.02 215 / 0.45) 100%)",
        }}
      />

      {/* Interactive Roadless Vector SVG Map */}
      <svg
        tabIndex={-1}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ outline: "none" }}
        className={`h-full w-full outline-none focus:outline-none focus-visible:outline-none select-none transition-[viewBox] duration-300 ease-out ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          handlePointerUp();
          setTooltip(null);
        }}
        onWheel={handleWheel}
        role="application"
        aria-label="Peta Interaktif Budaya Nusantara Tanpa Rute Jalan"
      >
        {/* 1. Cartographic Graticule Grid (Zero Roads, Pure Atlas Coordinates) */}
        <g className="pointer-events-none" opacity={0.45}>
          {graticules.lonLines.map(({ lon, x }) => (
            <g key={`lon-${lon}`}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={MAP_HEIGHT}
                stroke="var(--color-map-stroke)"
                strokeWidth="0.4"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={x + 4}
                y={MAP_HEIGHT - 8}
                fontSize={8 / Math.sqrt(camera.zoom)}
                fill="var(--color-ink-3)"
                fontFamily="var(--font-mono)"
              >
                {lon}°BT
              </text>
            </g>
          ))}
          {graticules.latLines.map(({ lat, y, isEquator }) => (
            <g key={`lat-${lat}`}>
              <line
                x1={0}
                y1={y}
                x2={MAP_WIDTH}
                y2={y}
                stroke={
                  isEquator ? "var(--color-accent)" : "var(--color-map-stroke)"
                }
                strokeWidth={isEquator ? "0.75" : "0.4"}
                strokeDasharray={isEquator ? "6 4" : "3 4"}
                vectorEffect="non-scaling-stroke"
                opacity={isEquator ? 0.55 : 0.8}
              />
              <text
                x={10}
                y={y - 4}
                fontSize={8 / Math.sqrt(camera.zoom)}
                fill={isEquator ? "var(--color-accent)" : "var(--color-ink-3)"}
                fontFamily="var(--font-mono)"
              >
                {isEquator
                  ? "0° GARIS KHATULISTIWA"
                  : lat > 0
                  ? `${lat}°LU`
                  : `${Math.abs(lat)}°LS`}
              </text>
            </g>
          ))}
        </g>

        {/* 2. Tier 1: 34 Province Polygons (Road-Free Administrative Boundaries) */}
        <g role="group" aria-label="Batas Wilayah 34 Provinsi Indonesia" style={{ outline: "none" }}>
          {renderedProvinces.map((prov) => {
            const isSelected = selectedProvinceId === prov.id;
            const count = itemCountsByProvince[prov.id] || 0;
            return (
              <path
                key={prov.id}
                d={prov.pathData}
                data-selected={isSelected}
                tabIndex={0}
                role="button"
                aria-label={`Provinsi ${prov.name}, Ibu Kota ${prov.capital}, ${count} Warisan Budaya`}
                aria-pressed={isSelected}
                className="map-region-path outline-none focus:outline-none focus-visible:outline-none select-none"
                style={{ outline: "none" }}
                onMouseDown={(e) => {
                  // Prevent browser from focusing SVG path bounding box on mouse click
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as SVGElement).blur();
                  window.getSelection()?.removeAllRanges();
                  onSelectProvince(prov.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProvince(prov.id);
                  }
                }}
                onMouseMove={(e) =>
                  updateTooltipPosition(e, {
                    title: prov.name,
                    tier: "Provinsi",
                    subtitle: `Ibu Kota: ${prov.capital} · ${prov.totalRegencies} Kab/Kota`,
                    cultureCount: count,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </g>

        {/* 3. Province Centroid Pins & Labels */}
        <g role="group" aria-label="Penanda Provinsi">
          {renderedProvinces.map((prov) => {
            const isSelected = selectedProvinceId === prov.id;
            const count = itemCountsByProvince[prov.id] || 0;
            const scaleFactor = Math.pow(camera.zoom, 0.65);
            const pinRadius = (isSelected ? 5.5 : 3.6) / scaleFactor;
            const fontSize = (isSelected ? 9.5 : 7.5) / scaleFactor;

            // Spatial label placement to prevent overlapping along dense corridors (especially Java)
            let labelY = -pinRadius - 3.5 / scaleFactor;
            if (prov.id === "34") {
              // DI Yogyakarta: position south of pin into the Indian Ocean to never collide with Jawa Tengah
              labelY = pinRadius + 8.5 / scaleFactor;
            } else if (prov.id === "32") {
              // Jawa Barat: position south of pin so northern corridor stays clear for DKI Jakarta
              labelY = pinRadius + 8.5 / scaleFactor;
            } else if (prov.id === "31") {
              // DKI Jakarta: position north into the Java Sea
              labelY = -pinRadius - 4.5 / scaleFactor;
            }

            return (
              <g
                key={`pin-${prov.id}`}
                transform={`translate(${prov.cx}, ${prov.cy})`}
                className="cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                style={{ outline: "none" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  (e.currentTarget as SVGElement).blur();
                  window.getSelection()?.removeAllRanges();
                  onSelectProvince(prov.id);
                }}
                onMouseMove={(e) =>
                  updateTooltipPosition(e, {
                    title: prov.name,
                    tier: "Provinsi",
                    subtitle: `Ibu Kota: ${prov.capital} · ${prov.totalRegencies} Kab/Kota`,
                    cultureCount: count,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Generous hit target to guarantee easy selection on desktop & mobile */}
                <circle
                  r={Math.max(10, pinRadius * 2.2)}
                  fill="transparent"
                />
                {isSelected && (
                  <circle
                    r={pinRadius * 2.2}
                    fill="var(--color-accent)"
                    opacity={0.25}
                  />
                )}
                <circle
                  r={pinRadius}
                  fill={
                    isSelected ? "var(--color-accent)" : "var(--color-paper)"
                  }
                  stroke="var(--color-ink)"
                  strokeWidth={1 / scaleFactor}
                />
                <text
                  y={labelY}
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontWeight={isSelected ? 700 : 600}
                  fill="var(--color-ink)"
                  stroke="var(--color-paper)"
                  strokeWidth={2.4 / scaleFactor}
                  paintOrder="stroke"
                  fontFamily="var(--font-display)"
                >
                  {prov.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* 4. Tier 2: Regencies (Kabupaten/Kota) Nodes when a Province is selected */}
        {selectedProvinceId && activeProvinceRegencies.length > 0 && (
          <g role="group" aria-label="Kabupaten dan Kota" style={{ outline: "none" }}>
            {activeProvinceRegencies.map((reg) => {
              const isRegSelected = selectedRegencyId === reg.id;
              const regCount = itemCountsByRegency[reg.id] || 0;
              const scaleFactor = Math.pow(camera.zoom, 0.72);
              const rSize =
                (isRegSelected ? 4.8 : regCount > 0 ? 3.5 : 2.5) / scaleFactor;
              const labelSize = 6.8 / scaleFactor;

              return (
                <g
                  key={reg.id}
                  transform={`translate(${reg.x}, ${reg.y})`}
                  className="cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                  style={{ outline: "none" }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${formatTitleCase(reg.name)}, ${regCount} data budaya`}
                  onMouseDown={(e) => {
                    // Prevent browser from focusing SVG group on click (eradicates blue box)
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.currentTarget as SVGElement).blur();
                    window.getSelection()?.removeAllRanges();
                    onSelectRegency(reg.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectRegency(reg.id);
                    }
                  }}
                  onMouseMove={(e) =>
                    updateTooltipPosition(e, {
                      title: formatTitleCase(reg.name),
                      tier: "Kabupaten / Kota",
                      subtitle:
                        regCount > 0
                          ? `${regCount} Warisan Budaya Tercatat`
                          : "Klik untuk melihat kecamatan & budaya provinsi",
                      cultureCount: regCount,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle
                    r={rSize}
                    fill={
                      isRegSelected
                        ? "var(--color-accent)"
                        : regCount > 0
                        ? "var(--color-accent)"
                        : "var(--color-paper-elevated)"
                    }
                    stroke="var(--color-ink)"
                    strokeWidth={0.9 / scaleFactor}
                  />
                  {(isRegSelected || camera.zoom >= 2.2) && (
                    <text
                      y={rSize + 7 / scaleFactor}
                      textAnchor="middle"
                      fontSize={labelSize}
                      fontWeight={isRegSelected ? 700 : 500}
                      fill={
                        isRegSelected
                          ? "var(--color-accent)"
                          : "var(--color-ink-2)"
                      }
                      stroke="var(--color-paper)"
                      strokeWidth={1.8 / scaleFactor}
                      paintOrder="stroke"
                    >
                      {formatTitleCase(
                        reg.name.replace(/^KABUPATEN\s+/i, "Kab. ")
                      )}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Tier 3: Sub-districts (Kecamatan) Nodes when a Regency is selected */}
        {selectedRegencyId && activeRegencyDistricts.length > 0 && (
          <g role="group" aria-label="Kecamatan" style={{ outline: "none" }}>
            {activeRegencyDistricts.map((dist) => {
              const isDistSelected = selectedDistrictId === dist.id;
              const scaleFactor = Math.pow(camera.zoom, 0.78);
              const dSize = (isDistSelected ? 3.8 : 2.4) / scaleFactor;

              return (
                <g
                  key={dist.id}
                  transform={`translate(${dist.x}, ${dist.y})`}
                  className="cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                  style={{ outline: "none" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.currentTarget as SVGElement).blur();
                    window.getSelection()?.removeAllRanges();
                    onSelectDistrict(dist.id);
                  }}
                  onMouseMove={(e) =>
                    updateTooltipPosition(e, {
                      title: `Kec. ${formatTitleCase(dist.name)}`,
                      tier: "Kecamatan",
                      subtitle: `Kode Wilayah: ${dist.id}`,
                      cultureCount: 1,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  <rect
                    x={-dSize}
                    y={-dSize}
                    width={dSize * 2}
                    height={dSize * 2}
                    rx={dSize * 0.4}
                    fill={
                      isDistSelected
                        ? "var(--color-success)"
                        : "var(--color-paper)"
                    }
                    stroke="var(--color-accent)"
                    strokeWidth={0.9 / scaleFactor}
                  />
                </g>
              );
            })}
          </g>
        )}
      </svg>

      

      {/* Map Viewport Controls */}
      <MapControls
        activeIsland={camera.activeIsland}
        zoom={camera.zoom}
        onSelectPreset={handleSelectPreset}
        onZoomIn={() =>
          onCameraChange({
            ...camera,
            zoom: Math.min(8, camera.zoom * 1.35),
          })
        }
        onZoomOut={() =>
          onCameraChange({
            ...camera,
            zoom: Math.max(1, camera.zoom / 1.35),
          })
        }
        onReset={() =>
          onCameraChange({
            lon: 118.0,
            lat: -2.5,
            zoom: 1,
            activeIsland: "Nusantara",
          })
        }
      />

      {/* Instant Region Hover Tooltip (<50ms) */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-30 w-60 rounded-[var(--radius-card)] border border-[var(--color-rule-strong)] bg-[var(--color-paper-elevated)] p-3 shadow-md"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-[var(--radius-pill)] bg-[var(--color-paper-2)] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)]">
              {tooltip.tier}
            </span>
            <span className="font-mono text-[11px] font-semibold text-[var(--color-ink-2)]">
              {tooltip.cultureCount} Budaya
            </span>
          </div>
          <p className="mt-1 font-display text-sm font-bold text-[var(--color-ink)]">
            {tooltip.title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-ink-2)]">
            {tooltip.subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
