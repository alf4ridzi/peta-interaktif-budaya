"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { IconClose, IconMapPin } from "@/components/ui/Icons";

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

  const selectedRegencyObj = useMemo(() => {
    if (!selectedRegencyId) return null;
    return activeProvinceRegencies.find((r) => r.id === selectedRegencyId) || null;
  }, [activeProvinceRegencies, selectedRegencyId]);

  const selectedDistrictObj = useMemo(() => {
    if (!selectedDistrictId) return null;
    return activeRegencyDistricts.find((d) => d.id === selectedDistrictId) || null;
  }, [activeRegencyDistricts, selectedDistrictId]);

  // Sort regencies so selected regency is rendered last (on top of others)
  const sortedRegencies = useMemo(() => {
    if (!selectedRegencyId) return activeProvinceRegencies;
    return [...activeProvinceRegencies].sort((a, b) => {
      if (a.id === selectedRegencyId) return 1;
      if (b.id === selectedRegencyId) return -1;
      return 0;
    });
  }, [activeProvinceRegencies, selectedRegencyId]);

  // Sort districts so selected district is rendered last
  const sortedDistricts = useMemo(() => {
    if (!selectedDistrictId) return activeRegencyDistricts;
    return [...activeRegencyDistricts].sort((a, b) => {
      if (a.id === selectedDistrictId) return 1;
      if (b.id === selectedDistrictId) return -1;
      return 0;
    });
  }, [activeRegencyDistricts, selectedDistrictId]);

  // Smooth animated camera interpolation for silky smooth navigation
  const [displayCamera, setDisplayCamera] = useState(camera);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (isDragging) {
      return;
    }

    const dLon = Math.abs(displayCamera.lon - camera.lon);
    const dLat = Math.abs(displayCamera.lat - camera.lat);
    const dZoom = Math.abs(displayCamera.zoom - camera.zoom);
    if (dLon < 0.0001 && dLat < 0.0001 && dZoom < 0.0001) {
      return;
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const startLon = displayCamera.lon;
    const startLat = displayCamera.lat;
    const startZoom = displayCamera.zoom;
    const targetLon = camera.lon;
    const targetLat = camera.lat;
    const targetZoom = camera.zoom;
    const startTime = performance.now();
    const duration = 480;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(progress);

      setDisplayCamera({
        lon: startLon + (targetLon - startLon) * ease,
        lat: startLat + (targetLat - startLat) * ease,
        zoom: startZoom + (targetZoom - startZoom) * ease,
        activeIsland: camera.activeIsland,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, isDragging]);

  const activeCamera = isDragging ? camera : displayCamera;

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

  // Compute SVG viewBox from activeCamera (lon, lat, zoom)
  const viewBox = useMemo(() => {
    const [centerX, centerY] = projectCoord(activeCamera.lon, activeCamera.lat);
    const vw = MAP_WIDTH / activeCamera.zoom;
    const vh = MAP_HEIGHT / activeCamera.zoom;
    const minX = Math.max(
      -80,
      Math.min(MAP_WIDTH - vw + 80, centerX - vw / 2)
    );
    const minY = Math.max(
      -60,
      Math.min(MAP_HEIGHT - vh + 60, centerY - vh / 2)
    );
    return `${minX.toFixed(2)} ${minY.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`;
  }, [activeCamera]);

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
    setDisplayCamera(camera);
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
        {selectedProvinceId && sortedRegencies.length > 0 && (
          <g role="group" aria-label="Kabupaten dan Kota" style={{ outline: "none" }}>
            {sortedRegencies.map((reg) => {
              const isRegSelected = selectedRegencyId === reg.id;
              const isAnyRegSelected = Boolean(selectedRegencyId);
              const regCount = itemCountsByRegency[reg.id] || 0;
              const scaleFactor = Math.pow(activeCamera.zoom, 0.72);
              const rSize =
                (isRegSelected ? 5.8 : regCount > 0 ? 3.5 : 2.5) / scaleFactor;
              const labelSize = 6.8 / scaleFactor;

              return (
                <g
                  key={reg.id}
                  transform={`translate(${reg.x}, ${reg.y})`}
                  className="cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                  style={{
                    outline: "none",
                    opacity: isRegSelected ? 1 : isAnyRegSelected ? 0.35 : 1,
                    transition: "opacity 200ms ease",
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${formatTitleCase(reg.name)}, ${regCount} data budaya`}
                  onMouseDown={(e) => {
                    // Prevent browser from focusing SVG group on click
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
                  {/* Generous hit target */}
                  <circle
                    r={Math.max(12, rSize * 2.4)}
                    fill="transparent"
                  />

                  {/* Pulsing Radar Beacon Waves for Selected Regency */}
                  {isRegSelected && (
                    <>
                      <circle
                        r={rSize * 1.5}
                        fill="var(--color-accent)"
                        opacity={0.3}
                      >
                        <animate
                          attributeName="r"
                          values={`${rSize * 1.5};${rSize * 5.2}`}
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0"
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        r={rSize * 1.2}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={1.8 / scaleFactor}
                        opacity={0.7}
                      >
                        <animate
                          attributeName="r"
                          values={`${rSize * 1.2};${rSize * 4.2}`}
                          dur="2.2s"
                          begin="0.7s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.75;0"
                          dur="2.2s"
                          begin="0.7s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Steady Outer Target Ring */}
                      <circle
                        r={rSize * 2.2}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={1.8 / scaleFactor}
                        strokeDasharray="3 2"
                        opacity={0.85}
                      />
                    </>
                  )}

                  {/* Node Core */}
                  <circle
                    r={rSize}
                    fill={
                      isRegSelected
                        ? "var(--color-accent)"
                        : regCount > 0
                        ? "var(--color-accent)"
                        : "var(--color-paper-elevated)"
                    }
                    stroke={isRegSelected ? "var(--color-paper)" : "var(--color-ink)"}
                    strokeWidth={(isRegSelected ? 2.2 : 0.9) / scaleFactor}
                  />

                  {/* Inner pip for selected regency */}
                  {isRegSelected && (
                    <circle
                      r={rSize * 0.45}
                      fill="var(--color-paper)"
                    />
                  )}

                  {/* Floating Callout Banner above Selected Regency Pin */}
                  {isRegSelected ? (
                    <g transform={`translate(0, ${-rSize - 8 / scaleFactor})`}>
                      <polygon
                        points={`0,${3.5 / scaleFactor} ${-3 / scaleFactor},0 ${3 / scaleFactor},0`}
                        fill="var(--color-ink)"
                      />
                      {(() => {
                        const title = formatTitleCase(
                          reg.name.replace(/^KABUPATEN\s+/i, "Kab. ")
                        );
                        const countLabel = regCount > 0 ? ` · ${regCount} Budaya` : "";
                        const fullLabel = `📍 ${title}${countLabel}`;
                        const charWidth = 4.8 / scaleFactor;
                        const pillWidth = Math.max(
                          54 / scaleFactor,
                          fullLabel.length * charWidth + 14 / scaleFactor
                        );
                        const pillHeight = 16 / scaleFactor;
                        return (
                          <g>
                            <rect
                              x={-pillWidth / 2}
                              y={-pillHeight}
                              width={pillWidth}
                              height={pillHeight}
                              rx={3.5 / scaleFactor}
                              fill="var(--color-ink)"
                              stroke="var(--color-accent)"
                              strokeWidth={1.2 / scaleFactor}
                            />
                            <text
                              x={0}
                              y={-pillHeight / 2 + 2.4 / scaleFactor}
                              textAnchor="middle"
                              fontSize={6.5 / scaleFactor}
                              fontWeight={700}
                              fill="var(--color-paper)"
                              fontFamily="var(--font-display)"
                            >
                              {fullLabel}
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  ) : (!isAnyRegSelected && activeCamera.zoom >= 2.2) || activeCamera.zoom >= 3.8 ? (
                    <text
                      y={rSize + 7 / scaleFactor}
                      textAnchor="middle"
                      fontSize={labelSize}
                      fontWeight={500}
                      fill="var(--color-ink-2)"
                      stroke="var(--color-paper)"
                      strokeWidth={1.8 / scaleFactor}
                      paintOrder="stroke"
                    >
                      {formatTitleCase(
                        reg.name.replace(/^KABUPATEN\s+/i, "Kab. ")
                      )}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Tier 3: Sub-districts (Kecamatan) Nodes when a Regency is selected */}
        {selectedRegencyId && sortedDistricts.length > 0 && (
          <g role="group" aria-label="Kecamatan" style={{ outline: "none" }}>
            {sortedDistricts.map((dist) => {
              const isDistSelected = selectedDistrictId === dist.id;
              const isAnyDistSelected = Boolean(selectedDistrictId);
              const scaleFactor = Math.pow(activeCamera.zoom, 0.78);
              const dSize = (isDistSelected ? 4.8 : 3.0) / scaleFactor;

              return (
                <g
                  key={dist.id}
                  transform={`translate(${dist.x}, ${dist.y})`}
                  className="cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                  style={{
                    outline: "none",
                    opacity: isDistSelected ? 1 : isAnyDistSelected ? 0.4 : 1,
                    transition: "opacity 200ms ease",
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Kecamatan ${formatTitleCase(dist.name)}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.currentTarget as SVGElement).blur();
                    window.getSelection()?.removeAllRanges();
                    onSelectDistrict(dist.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDistrict(dist.id);
                    }
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
                  {/* Hit target */}
                  <circle
                    r={Math.max(10, dSize * 2.2)}
                    fill="transparent"
                  />

                  {/* Pulsing Beacon for Selected District */}
                  {isDistSelected && (
                    <>
                      <circle
                        r={dSize * 1.5}
                        fill="var(--color-success)"
                        opacity={0.3}
                      >
                        <animate
                          attributeName="r"
                          values={`${dSize * 1.5};${dSize * 4.8}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        r={dSize * 2.0}
                        fill="none"
                        stroke="var(--color-success)"
                        strokeWidth={1.5 / scaleFactor}
                        strokeDasharray="2 2"
                        opacity={0.8}
                      />
                    </>
                  )}

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
                    stroke={isDistSelected ? "var(--color-paper)" : "var(--color-accent)"}
                    strokeWidth={(isDistSelected ? 1.8 : 0.9) / scaleFactor}
                  />

                  {/* Inner dot */}
                  {isDistSelected && (
                    <circle
                      r={dSize * 0.4}
                      fill="var(--color-paper)"
                    />
                  )}

                  {/* Floating Callout Banner for Selected District */}
                  {isDistSelected ? (
                    <g transform={`translate(0, ${-dSize - 7 / scaleFactor})`}>
                      <polygon
                        points={`0,${3 / scaleFactor} ${-2.5 / scaleFactor},0 ${2.5 / scaleFactor},0`}
                        fill="var(--color-ink)"
                      />
                      {(() => {
                        const name = `📍 Kec. ${formatTitleCase(dist.name)}`;
                        const charWidth = 4.6 / scaleFactor;
                        const pillWidth = Math.max(
                          48 / scaleFactor,
                          name.length * charWidth + 12 / scaleFactor
                        );
                        const pillHeight = 15 / scaleFactor;
                        return (
                          <g>
                            <rect
                              x={-pillWidth / 2}
                              y={-pillHeight}
                              width={pillWidth}
                              height={pillHeight}
                              rx={3 / scaleFactor}
                              fill="var(--color-ink)"
                              stroke="var(--color-success)"
                              strokeWidth={1.2 / scaleFactor}
                            />
                            <text
                              x={0}
                              y={-pillHeight / 2 + 2.3 / scaleFactor}
                              textAnchor="middle"
                              fontSize={6.0 / scaleFactor}
                              fontWeight={700}
                              fill="var(--color-paper)"
                              fontFamily="var(--font-display)"
                            >
                              {name}
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  ) : activeCamera.zoom >= 4.5 ? (
                    <text
                      y={dSize + 6 / scaleFactor}
                      textAnchor="middle"
                      fontSize={5.2 / scaleFactor}
                      fontWeight={500}
                      fill="var(--color-ink-2)"
                      stroke="var(--color-paper)"
                      strokeWidth={1.4 / scaleFactor}
                      paintOrder="stroke"
                    >
                      {formatTitleCase(dist.name)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Active Selection Indicator Floating HUD (below breadcrumbs) */}
      {(selectedRegencyObj || selectedDistrictObj) && (
        <div className="pointer-events-auto absolute top-14 left-4 z-20 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-accent)] bg-[var(--color-paper-glass)] px-3 py-1.5 shadow-md backdrop-blur-md">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-paper)]">
            <IconMapPin size={12} />
          </div>
          <div className="flex items-center gap-1.5 truncate text-xs">
            <span className="font-mono text-[10px] uppercase font-semibold text-[var(--color-accent)]">
              {selectedDistrictObj ? "Kecamatan Terpilih:" : "Kab/Kota Terpilih:"}
            </span>
            <span className="font-display font-bold text-[var(--color-ink)] truncate">
              {selectedDistrictObj
                ? `Kec. ${formatTitleCase(selectedDistrictObj.name)}`
                : formatTitleCase(selectedRegencyObj!.name)}
            </span>
            {selectedRegencyObj && (itemCountsByRegency[selectedRegencyObj.id] || 0) > 0 && !selectedDistrictObj && (
              <span className="rounded bg-[var(--color-accent)]/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-[var(--color-accent)]">
                {itemCountsByRegency[selectedRegencyObj.id]} Budaya
              </span>
            )}
          </div>
          <div className="ml-1 flex items-center gap-1 border-l border-[var(--color-rule)] pl-1.5">
            <button
              type="button"
              onClick={() => {
                if (selectedDistrictObj) {
                  onSelectDistrict(selectedDistrictObj.id);
                } else if (selectedRegencyObj) {
                  onSelectRegency(selectedRegencyObj.id);
                }
              }}
              className="hm-interactive rounded px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
              title="Pusatkan pandangan peta ke wilayah ini"
            >
              Pusatkan
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedDistrictObj) {
                  onSelectDistrict("");
                } else if (selectedRegencyObj) {
                  onSelectRegency("");
                }
              }}
              className="hm-interactive rounded p-0.5 text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
              title="Hapus pilihan wilayah"
              aria-label="Hapus pilihan wilayah"
            >
              <IconClose size={13} />
            </button>
          </div>
        </div>
      )}

      

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
