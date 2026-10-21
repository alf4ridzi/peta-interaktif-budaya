export type CulturalCategory =
  | "bahasa"
  | "musik"
  | "makanan"
  | "pakaian"
  | "tarian";

export type IslandGroup =
  | "Sumatera"
  | "Jawa"
  | "Bali & Nusa Tenggara"
  | "Kalimantan"
  | "Sulawesi"
  | "Maluku & Papua";

export interface ProvinceRecord {
  id: string;
  name: string;
  capital: string;
  islandGroup: IslandGroup;
  latitude: number;
  longitude: number;
}

export interface RegencyRecord {
  id: string;
  provinceId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface DistrictRecord {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface GeoHierarchyData {
  provinces: ProvinceRecord[];
  regencies: RegencyRecord[];
  districtsByRegency: Record<string, DistrictRecord[]>;
}

export interface CulturalAttributes {
  instrumentType?: string;
  playingMethod?: string;
  islandGroup?: string;
  culinaryProfile?: string;
  garmentUser?: string;
  materialAndMotif?: string;
  linguisticTerritory?: string;
  districtMention?: string;
  regionalOrigin?: string;
  classificationBasis?: string;
}

export interface CulturalItem {
  id: string;
  slug: string;
  name: string;
  localName?: string;
  category: CulturalCategory;
  provinceId: string;
  provinceName: string;
  islandGroup: IslandGroup;
  regencyId?: string;
  regencyName?: string;
  districtId?: string;
  districtName?: string;
  originNote?: string;
  summary: string;
  description: string;
  attributes: CulturalAttributes;
  media: {
    localImagePath: string;
    caption: string;
    credit: string;
    isVerified: boolean;
  };
  provenance: {
    sourceDataset: string;
    rawRowIndex: number;
    webResolved: boolean;
  };
}

export const CATEGORY_META: Record<
  CulturalCategory,
  {
    label: string;
    shortLabel: string;
    subtitle: string;
    accentVar: string;
    fallbackSvg: string;
  }
> = {
  bahasa: {
    label: "Bahasa Daerah",
    shortLabel: "Bahasa",
    subtitle: "Isolek, dialek & wilayah tutur",
    accentVar: "var(--color-cat-bahasa)",
    fallbackSvg: "/assets/culture/fallbacks/bahasa.svg",
  },
  musik: {
    label: "Alat Musik",
    shortLabel: "Alat Musik",
    subtitle: "Instrumen akustik & tradisi bunyi",
    accentVar: "var(--color-cat-musik)",
    fallbackSvg: "/assets/culture/fallbacks/musik.svg",
  },
  makanan: {
    label: "Makanan Khas",
    shortLabel: "Makanan",
    subtitle: "Kuliner, rempah & sajian adat",
    accentVar: "var(--color-cat-makanan)",
    fallbackSvg: "/assets/culture/fallbacks/makanan.svg",
  },
  pakaian: {
    label: "Pakaian Adat",
    shortLabel: "Pakaian",
    subtitle: "Wastra, tenun & busana kebesaran",
    accentVar: "var(--color-cat-pakaian)",
    fallbackSvg: "/assets/culture/fallbacks/pakaian.svg",
  },
  tarian: {
    label: "Tarian Tradisional",
    shortLabel: "Tarian",
    subtitle: "Seni gerak wiraga & ekspresi ritual",
    accentVar: "var(--color-cat-tarian)",
    fallbackSvg: "/assets/culture/fallbacks/tarian.svg",
  },
};

