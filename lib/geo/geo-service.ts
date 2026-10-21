import { IslandGroup } from "@/types/culture";

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 520;

export const LON_MIN = 94.5;
export const LON_MAX = 141.5;
export const LAT_MIN = -11.5;
export const LAT_MAX = 6.5;

export function projectCoord(lon: number, lat: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_WIDTH;
  // Equirectangular / low-latitude Mercator (Indonesia straddles the Equator -11° to +6°)
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_HEIGHT;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function ringToSvgPath(ring: number[][]): string {
  if (!ring || ring.length === 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const [x, y] = projectCoord(lon, lat);
    parts.push(`${i === 0 ? "M" : "L"}${x},${y}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

export type GeoCoordinates = number[][][] | number[][][][];

export function geometryToSvgPath(geometry: {
  type: string;
  coordinates: GeoCoordinates;
}): string {
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as number[][][])
      .map((ring) => ringToSvgPath(ring))
      .join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][])
      .map((poly) => poly.map((ring) => ringToSvgPath(ring)).join(" "))
      .join(" ");
  }
  return "";
}

export interface IslandViewportPreset {
  id: IslandGroup | "Nusantara";
  label: string;
  lon: number;
  lat: number;
  zoom: number;
}

export const ISLAND_PRESETS: IslandViewportPreset[] = [
  { id: "Nusantara", label: "Seluruh Nusantara", lon: 118.0, lat: -2.5, zoom: 1 },
  { id: "Sumatera", label: "Sumatera", lon: 101.5, lat: 0.2, zoom: 2.3 },
  { id: "Jawa", label: "Jawa", lon: 109.8, lat: -7.1, zoom: 3.4 },
  { id: "Bali & Nusa Tenggara", label: "Bali & Nusa", lon: 119.5, lat: -8.8, zoom: 3.0 },
  { id: "Kalimantan", label: "Kalimantan", lon: 114.2, lat: 0.5, zoom: 2.5 },
  { id: "Sulawesi", label: "Sulawesi", lon: 121.2, lat: -2.0, zoom: 2.7 },
  { id: "Maluku & Papua", label: "Maluku & Papua", lon: 133.5, lat: -3.5, zoom: 2.2 },
];
