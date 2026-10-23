import fs from "fs";
import path from "path";
import { CATEGORY_META, CulturalCategory, CulturalItem } from "@/types/culture";

export interface RetrievedReference {
  id: string;
  slug: string;
  name: string;
  category: CulturalCategory;
  provinceName: string;
  regencyName?: string;
  districtName?: string;
  description: string;
  originNote?: string;
  localImagePath?: string;
  sourceDataset: string;
  score: number;
}

export interface ChatResponsePayload {
  text: string;
  references: RetrievedReference[];
  isAiPowered: boolean;
  modelName: string;
  suggestedQuestions?: string[];
}

let cachedItems: CulturalItem[] | null = null;

export function getCulturalDatabase(): CulturalItem[] {
  if (cachedItems) return cachedItems;
  try {
    const filePath = path.join(process.cwd(), "public/data/normalized/unified-culture.json");
    const raw = fs.readFileSync(filePath, "utf8");
    cachedItems = JSON.parse(raw) as CulturalItem[];
    return cachedItems;
  } catch (err) {
    console.error("Failed to load unified-culture.json for RAG", err);
    return [];
  }
}

const CONCEPT_SYNONYMS: Record<string, string[]> = {
  batik: ["wastra", "canting", "malam", "kawung", "parang", "mega mendung"],
  reog: ["ponorogo", "singo barong", "warok", "jathil", "klono sewandono", "dadak merak"],
  saman: ["gayo", "aceh", "ratoh duek", "gayo lues"],
  gamelan: ["gong", "saron", "kendang", "karawitan", "bonang", "slendro", "pelog"],
  wayang: ["wayang kulit", "dalang", "kelir", "mahabharata"],
  angklung: ["bambu", "jawa barat", "calung"],
  sasando: ["rote", "ntt", "dawai", "alat musik"],
  rendang: ["minangkabau", "padang", "sumatera barat"],
  kecak: ["bali", "gianyar", "ramayana", "tari kecak"],
  jaipong: ["karawang", "jawa barat", "sunda", "tari jaipong"],
};

export const CATEGORY_KEYWORDS: Record<CulturalCategory, string[]> = {
  makanan: [
    "makanan", "kuliner", "masakan", "santapan", "hidangan", "kudapan", "minuman", "lauk", "kue", "pangan",
    "khas kuliner", "soto", "rawon", "rendang", "gudeg", "rujak", "sate", "nasi", "sambal", "peuyeum", "batagor", "seblak", "karedok"
  ],
  tarian: [
    "tarian", "tari", "seni tari", "gerak tari", "sendratari", "joged", "tari daerah", "tari-tarian"
  ],
  musik: [
    "alat musik", "musik tradisional", "alat musik tradisional", "musik", "instrumen", "tetabuhan", "dawai", "gamelan", "angklung", "sasando", "kolintang", "tifa", "talempong", "saluang"
  ],
  pakaian: [
    "pakaian adat", "baju adat", "busana adat", "pakaian tradisional", "pakaian", "baju", "busana", "wastra", "kain adat", "kain tradisional", "kebaya", "sarung", "ulos", "songket", "destar", "blangkon"
  ],
  bahasa: [
    "bahasa daerah", "bahasa", "dialek", "aksara", "tutur daerah", "tutur"
  ]
};

export const PROVINCE_SYNONYMS: Record<string, string[]> = {
  "Aceh": ["aceh", "gayo", "pidie", "serambi mekkah", "sabang", "banda aceh"],
  "Sumatera Utara": ["sumatera utara", "sumut", "batak", "medan", "toba", "mandailing", "karo", "nias", "simalungun"],
  "Sumatera Barat": ["sumatera barat", "sumbar", "minang", "minangkabau", "padang", "bukittinggi", "payakumbuh", "pariaman"],
  "Riau": ["riau", "pekanbaru", "siak", "kampar", "dumai"],
  "Kepulauan Riau": ["kepulauan riau", "kepri", "batam", "tanjung pinang", "bintan", "natuna", "anambas", "lingga"],
  "Jambi": ["jambi", "kerinci", "muaro jambi"],
  "Sumatera Selatan": ["sumatera selatan", "sumsel", "palembang", "sriwijaya", "ogan", "lahat", "komering"],
  "Bengkulu": ["bengkulu", "rejang", "mukomuko"],
  "Lampung": ["lampung", "bandar lampung", "pepadun", "saibatin"],
  "Kepulauan Bangka Belitung": ["bangka belitung", "babel", "bangka", "belitung"],
  "DKI Jakarta": ["dki jakarta", "jakarta", "betawi"],
  "Jawa Barat": ["jawa barat", "jabar", "sunda", "priangan", "parahyangan", "bandung", "bogor", "purwakarta", "cirebon", "tasikmalaya", "garut", "sukabumi"],
  "Jawa Tengah": ["jawa tengah", "jateng", "semarang", "solo", "surakarta", "banyumas", "pekalongan", "kudus", "magelang", "cilacap"],
  "DI Yogyakarta": ["di yogyakarta", "yogyakarta", "jogja", "yogya", "sleman", "bantul", "gunungkidul", "kulon progo", "kraton"],
  "Jawa Timur": ["jawa timur", "jatim", "surabaya", "malang", "ponorogo", "madura", "banyuwangi", "lamongan", "madiun", "jember", "kediri", "blitar"],
  "Banten": ["banten", "baduy", "serang", "cilegon", "tangerang", "lebak", "pandeglang"],
  "Bali": ["bali", "denpasar", "gianyar", "ubud", "buleleng", "karangasem", "klungkung", "tabanan", "badung"],
  "Nusa Tenggara Barat": ["nusa tenggara barat", "ntb", "sasak", "lombok", "mataram", "sumbawa", "bima", "dompu"],
  "Nusa Tenggara Timur": ["nusa tenggara timur", "ntt", "rote", "flores", "timor", "sumba", "kupang", "manggarai", "alor"],
  "Kalimantan Barat": ["kalimantan barat", "kalbar", "pontianak", "singkawang", "dayak kanayatn"],
  "Kalimantan Tengah": ["kalimantan tengah", "kalteng", "palangkaraya", "dayak ngaju", "sampit"],
  "Kalimantan Selatan": ["kalimantan selatan", "kalsel", "banjar", "banjarmasin", "martapura", "dayak meratus"],
  "Kalimantan Timur": ["kalimantan timur", "kaltim", "samarinda", "balikpapan", "kutai"],
  "Kalimantan Utara": ["kalimantan utara", "kaltara", "tarakan", "bulungan"],
  "Sulawesi Utara": ["sulawesi utara", "sulut", "manado", "minahasa", "tomohon", "sangihe"],
  "Gorontalo": ["gorontalo"],
  "Sulawesi Tengah": ["sulawesi tengah", "sulteng", "palu", "kaili", "poso", "donggala"],
  "Sulawesi Barat": ["sulawesi barat", "sulbar", "mandar", "mamuju", "polewali"],
  "Sulawesi Selatan": ["sulawesi selatan", "sulsel", "bugis", "makassar", "toraja", "mangkasara", "maros", "gowa", "bone"],
  "Sulawesi Tenggara": ["sulawesi tenggara", "sultra", "kendari", "buton", "muna"],
  "Maluku": ["maluku", "ambon", "seram", "banda", "tual"],
  "Maluku Utara": ["maluku utara", "malut", "ternate", "tidore", "halmahera"],
  "Papua": ["papua", "asmat", "dani", "sentani", "jayapura", "biak", "merauke", "wamena"],
  "Papua Barat": ["papua barat", "manokwari", "raja ampat", "sorong", "fakfak"],
};

export function matchCategory(query: string): CulturalCategory | null {
  const q = query.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  // Check multi-word keywords first
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS) as [CulturalCategory, string[]][]) {
    for (const kw of kws) {
      if (kw.includes(" ")) {
        const regex = new RegExp(`(?:^|\\s)${kw.replace(/\s+/g, "\\s+")}(?:$|\\s)`, "i");
        if (regex.test(q)) return cat;
      }
    }
  }
  // Check single-word keywords
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS) as [CulturalCategory, string[]][]) {
    for (const kw of kws) {
      const regex = new RegExp(`(?:^|\\s)${kw}(?:$|\\s)`, "i");
      if (regex.test(q)) return cat;
    }
  }
  return null;
}

export function matchProvince(query: string): string | null {
  const q = query.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const padded = " " + q + " ";
  // Longest alias wins, so "kepulauan riau" -> Kepulauan Riau (not Riau), "papua barat" -> Papua Barat
  let bestProvince: string | null = null;
  let bestLength = 0;
  for (const [prov, aliases] of Object.entries(PROVINCE_SYNONYMS)) {
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (a.length > bestLength && padded.includes(" " + a + " ")) {
        bestProvince = prov;
        bestLength = a.length;
      }
    }
  }
  return bestProvince;
}

/**
 * Words that carry no entity meaning (question words, generic descriptors, category words and
 * region words). What remains in a query is the name of a specific cultural entity, e.g. "nafiri".
 */
const GENERIC_QUERY_WORDS = new Set([
  // question / filler words
  "apa", "itu", "ini", "dan", "atau", "yang", "dari", "di", "ke", "pada", "untuk", "dengan", "bagaimana",
  "mengapa", "kenapa", "siapa", "kapan", "dimana", "mana", "berapa", "jelaskan", "ceritakan", "sebutkan",
  "daftar", "ragam", "macam", "contoh", "mengenal", "tentang", "saja", "adalah", "merupakan", "dalam",
  "balik", "cara", "memainkan", "tolong", "dong", "ada", "apakah", "sih", "kah", "bisa", "lebih",
  // generic descriptors
  "sejarah", "makna", "filosofi", "filosofis", "fungsi", "arti", "nilai", "keunikan", "ciri", "khas",
  "daerah", "tradisional", "adat", "nusantara", "indonesia", "provinsi", "kabupaten", "kota", "asal",
  "usul", "usulnya", "asalusul", "terkenal", "terdapat", "punya", "miliki", "memiliki", "semua", "seluruh",
  "kecamatan", "kelurahan", "desa", "lengkap", "beserta", "kekayaan", "khazanah", "wilayah", "pulau", "tempat",
  // category words
  "makanan", "kuliner", "masakan", "santapan", "hidangan", "kudapan", "minuman", "lauk", "kue", "pangan",
  "tarian", "tari", "sendratari", "joged", "seni", "pertunjukan", "musik", "alat", "instrumen", "tetabuhan",
  "bunyi", "pakaian", "baju", "busana", "wastra", "kain", "kostum", "bahasa", "dialek", "aksara", "tutur",
  "budaya", "kebudayaan", "tradisi", "warisan",
  // generic region words
  "barat", "timur", "tengah", "utara", "selatan", "kepulauan", "nusa", "tenggara",
]);

const REGION_TOKENS: Set<string> = new Set(
  Object.entries(PROVINCE_SYNONYMS).flatMap(([prov, aliases]) =>
    [prov, ...aliases].flatMap((a) => a.toLowerCase().split(/\s+/))
  )
);

/**
 * Extract tokens that identify a specific cultural entity (e.g. "nafiri" in "apa itu musik nafiri?").
 * Returns an empty list for broad / regional questions such as "apa makanan dari jawa barat?".
 */
export function extractSpecificTokens(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !GENERIC_QUERY_WORDS.has(t) && !REGION_TOKENS.has(t));
}

function itemNameWords(name: string): string[] {
  return name.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
}

/**
 * Number of specific tokens that appear as (or as the prefix of) a word in the item's name.
 */
function countNameTokenMatches(name: string, specificTokens: string[]): number {
  if (specificTokens.length === 0) return 0;
  const words = itemNameWords(name);
  let matched = 0;
  for (const token of specificTokens) {
    if (words.some((w) => w === token || (token.length >= 4 && w.startsWith(token)))) {
      matched += 1;
    }
  }
  return matched;
}

/** Words stripped from an item name to get its "core" name (e.g. "Bahasa Sunda" -> "sunda"). */
const NAME_PREFIX_WORDS = new Set([
  "bahasa", "tari", "tarian", "pakaian", "adat", "baju", "kain", "alat", "musik", "kuliner", "makanan",
]);

/** Directional words are part of province names, so they must count when comparing names exactly. */
const DIRECTION_WORDS = new Set(["barat", "timur", "tengah", "utara", "selatan", "kepulauan", "nusa", "tenggara"]);

function itemCoreWords(name: string): string[] {
  const noParen = name.replace(/\([^)]*\)/g, " ");
  return itemNameWords(noParen).filter((w) => !NAME_PREFIX_WORDS.has(w));
}

/**
 * Query remainder after removing filler/category words, but KEEPING region and direction words.
 * "apa itu bahasa sunda?" -> ["sunda"]; "bahasa dari jawa barat" -> ["jawa", "barat"].
 */
function extractNameRemainder(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && (!GENERIC_QUERY_WORDS.has(t) || DIRECTION_WORDS.has(t)));
}

function toReference(item: CulturalItem, score: number): RetrievedReference {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category,
    provinceName: item.provinceName,
    regencyName: item.regencyName,
    districtName: item.districtName,
    description: item.description,
    originNote: item.originNote,
    localImagePath: item.media?.localImagePath,
    sourceDataset: item.provenance.sourceDataset,
    score,
  };
}

/**
 * True when a record is recorded in the entity's home region, e.g. "Bahasa Sunda" in Jawa Barat
 * (as opposed to Sunda-speaking diaspora communities in Lampung or Bengkulu).
 */
function isHomeRecord(item: { name: string; provinceName: string }): boolean {
  const core = itemCoreWords(item.name).join(" ");
  if (!core) return false;
  const provLower = item.provinceName.toLowerCase();
  const aliases = (PROVINCE_SYNONYMS[item.provinceName] || []).map((a) => a.toLowerCase());
  return provLower === core || aliases.includes(core) || provLower.split(/\s+/).includes(core);
}

/** Keep a description readable: cut at a sentence boundary after ~max characters. */
function shortenDescription(text: string, max = 600): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "));
  return (lastStop > 200 ? slice.slice(0, lastStop + 1) : slice.trimEnd() + "…").trim();
}

/**
 * Items whose NAME matches the specific entity the user asked about. Only the best-matching
 * records are returned, so "apa itu musik nafiri?" yields just Nafiri and
 * "apa itu bahasa sunda?" yields just Bahasa Sunda.
 */
export function findNamedEntityMatches(query: string, limit = 4): RetrievedReference[] {
  const targetCategory = matchCategory(query);
  const items = getCulturalDatabase();

  // Phase 1: the whole remainder of the question is exactly one item's core name
  // (works for names that coincide with region words, e.g. "Bahasa Sunda", "Bahasa Bali").
  const remainder = extractNameRemainder(query);
  if (remainder.length > 0) {
    const remainderKey = remainder.join(" ");
    const exact = items.filter(
      (item) =>
        (!targetCategory || item.category === targetCategory) &&
        itemCoreWords(item.name).join(" ") === remainderKey
    );
    if (exact.length > 0) {
      // Home-region records first, so the limit never cuts them off
      exact.sort((a, b) => Number(isHomeRecord(b)) - Number(isHomeRecord(a)));
      return exact.slice(0, limit).map((item) => toReference(item, 400));
    }
  }

  // Phase 2: rare/specific tokens (e.g. "nafiri") found inside item names
  const specificTokens = extractSpecificTokens(query);
  if (specificTokens.length === 0) return [];

  let best = 0;
  const hits: Array<{ item: CulturalItem; matched: number }> = [];

  for (const item of items) {
    if (targetCategory && item.category !== targetCategory) continue;
    const matched = countNameTokenMatches(item.name, specificTokens);
    if (matched === 0) continue;
    best = Math.max(best, matched);
    hits.push({ item, matched });
  }

  return hits
    .filter((h) => h.matched === best)
    .slice(0, limit)
    .map(({ item }) => toReference(item, 300 + best * 50));
}

// ---------------------------------------------------------------------------
// Place (province / regency / district) overview queries, e.g. "apa saja kebudayaan di kepulauan seribu"
// ---------------------------------------------------------------------------

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function regencyCoreName(raw: string): string {
  return normalizeText(raw).replace(/^(kabupaten|kota|kab)\s+/, "");
}

function toTitleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

interface PlaceIndexEntry {
  core: string;
  raws: Set<string>;
}

let placeIndexCache: { regencies: PlaceIndexEntry[]; districts: PlaceIndexEntry[] } | null = null;

function getPlaceIndex() {
  if (placeIndexCache) return placeIndexCache;
  const reg = new Map<string, Set<string>>();
  const dis = new Map<string, Set<string>>();
  for (const item of getCulturalDatabase()) {
    if (item.regencyName) {
      const core = regencyCoreName(item.regencyName);
      if (!reg.has(core)) reg.set(core, new Set());
      reg.get(core)!.add(item.regencyName);
    }
    if (item.districtName) {
      const core = normalizeText(item.districtName);
      if (!dis.has(core)) dis.set(core, new Set());
      dis.get(core)!.add(item.districtName);
    }
  }
  const toEntries = (m: Map<string, Set<string>>, minLen: number) =>
    Array.from(m.entries())
      .filter(([core]) => core.length >= minLen && !GENERIC_QUERY_WORDS.has(core))
      .map(([core, raws]) => ({ core, raws }))
      .sort((a, b) => b.core.length - a.core.length);
  placeIndexCache = { regencies: toEntries(reg, 4), districts: toEntries(dis, 5) };
  return placeIndexCache;
}

export interface PlaceOverview {
  level: "district" | "regency" | "province";
  label: string;
  provinceName?: string;
  items: CulturalItem[];
  truncated: boolean;
  category?: CulturalCategory;
}

const OVERVIEW_CATEGORY_ORDER: CulturalCategory[] = ["makanan", "tarian", "musik", "pakaian", "bahasa"];

/**
 * Detect a question about a whole place (province / regency / district) and collect that place's
 * records. Returns null when the question also names a specific entity or topic.
 */
export function detectPlaceOverview(query: string): PlaceOverview | null {
  const q = normalizeText(query);
  const targetCategory = matchCategory(query);
  const { regencies, districts } = getPlaceIndex();
  const items = getCulturalDatabase();

  const leftoverIsEmpty = (phrase: string) =>
    extractSpecificTokens((" " + q + " ").replace(" " + phrase + " ", " ")).length === 0;

  const dedupe = (list: CulturalItem[]) => {
    const seen = new Set<string>();
    return list.filter((i) => {
      const key = i.category + "|" + i.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // 1) Regency (kabupaten / kota) - most specific first
  for (const entry of regencies) {
    if (!(" " + q + " ").includes(" " + entry.core + " ")) continue;
    if (!leftoverIsEmpty(entry.core)) continue;
    let raws = Array.from(entry.raws);
    if (/\bkota\b/.test(q) && raws.some((r) => /^kota/i.test(r))) raws = raws.filter((r) => /^kota/i.test(r));
    else if (/\bkab(upaten)?\b/.test(q) && raws.some((r) => /^kabupaten/i.test(r))) raws = raws.filter((r) => /^kabupaten/i.test(r));
    const rawSet = new Set(raws);
    const found = dedupe(
      items.filter((i) => i.regencyName && rawSet.has(i.regencyName) && (!targetCategory || i.category === targetCategory))
    );
    if (found.length === 0) continue;
    return {
      level: "regency",
      label: toTitleCase(raws[0]),
      provinceName: found[0].provinceName,
      items: found.slice(0, 14),
      truncated: found.length > 14,
      category: targetCategory ?? undefined,
    };
  }

  // 2) District (kecamatan)
  for (const entry of districts) {
    if (!(" " + q + " ").includes(" " + entry.core + " ")) continue;
    if (!leftoverIsEmpty(entry.core)) continue;
    const rawSet = new Set(entry.raws);
    const found = dedupe(
      items.filter((i) => i.districtName && rawSet.has(i.districtName) && (!targetCategory || i.category === targetCategory))
    );
    if (found.length === 0) continue;
    return {
      level: "district",
      label: "Kecamatan " + toTitleCase(Array.from(entry.raws)[0]),
      provinceName: found[0].provinceName,
      items: found.slice(0, 14),
      truncated: found.length > 14,
      category: targetCategory ?? undefined,
    };
  }

  // 3) Province without a category: balanced sample across the five cultural pillars
  const province = matchProvince(query);
  if (province && !targetCategory) {
    const aliases = [province, ...(PROVINCE_SYNONYMS[province] || [])].map((a) => a.toLowerCase());
    const hit = aliases.find((a) => (" " + q + " ").includes(" " + a + " "));
    if (hit && leftoverIsEmpty(hit)) {
      const all = dedupe(items.filter((i) => i.provinceName === province));
      const picked: CulturalItem[] = [];
      for (const cat of OVERVIEW_CATEGORY_ORDER) {
        picked.push(...all.filter((i) => i.category === cat).slice(0, 3));
      }
      if (picked.length > 0) {
        return { level: "province", label: province, provinceName: province, items: picked, truncated: all.length > picked.length };
      }
    }
  }

  return null;
}

/**
 * Retrieve top relevant cultural records matching user query using weighted keyword ranking.
 */
export function retrieveCultureContext(query: string, targetSlug?: string, limit = 6): RetrievedReference[] {
  // A question about one specific named entity must only be grounded on that entity.
  if (!targetSlug) {
    const entityMatches = findNamedEntityMatches(query);
    if (entityMatches.length > 0) return entityMatches;

    // A question about a whole place must only be grounded on that place's records.
    const place = detectPlaceOverview(query);
    if (place) return place.items.map((item) => toReference(item, 250));
  }

  const items = getCulturalDatabase();
  const qClean = query.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  const targetCategory = matchCategory(query);
  const targetProvince = matchProvince(query);

  const rawTokens = qClean
    .split(/\s+/)
    .filter(
      (t) =>
        t.length > 2 &&
        ![
          "apa", "itu", "dan", "yang", "dari", "pada", "untuk", "bagaimana", "mengapa", "sejarah",
          "makna", "khas", "daerah", "saja", "sebutkan", "ragam", "macam", "asal", "usul", "provinsi"
        ].includes(t)
    );

  const expandedTokens = new Set<string>(rawTokens);
  for (const token of rawTokens) {
    for (const [key, syns] of Object.entries(CONCEPT_SYNONYMS)) {
      if (token.includes(key) || key.includes(token)) {
        syns.forEach((s) => expandedTokens.add(s));
      }
    }
  }

  const tokens = Array.from(expandedTokens);
  const scored: RetrievedReference[] = [];

  for (const item of items) {
    let score = 0;
    const itemName = item.name.toLowerCase();
    const itemProv = item.provinceName.toLowerCase();
    const itemReg = (item.regencyName || "").toLowerCase();
    const itemCat = item.category.toLowerCase();
    const itemDesc = item.description.toLowerCase();
    const itemNote = (item.originNote || "").toLowerCase();

    // Specific slug target boost
    if (targetSlug && item.slug === targetSlug) {
      score += 200;
    }

    // Category intent filter / boost
    if (targetCategory) {
      if (item.category === targetCategory) {
        score += 150;
      } else {
        // Skip items that belong to a completely different category
        continue;
      }
    }

    // Province intent filter / boost
    if (targetProvince) {
      if (item.provinceName.toLowerCase() === targetProvince.toLowerCase()) {
        score += 120;
      } else {
        score -= 50;
      }
    }

    // Exact title match boost
    if (itemName === qClean || qClean.includes(itemName) || itemName.includes(qClean)) {
      score += 100;
    }

    // Token matches
    for (const token of tokens) {
      if (itemName.includes(token)) score += 35;
      if (itemProv.includes(token)) score += 18;
      if (itemReg.includes(token)) score += 14;
      if (itemCat === token) score += 12;
      if (itemNote.includes(token)) score += 8;
      if (itemDesc.includes(token)) score += 4;
    }

    if (score > 0) {
      scored.push({
        id: item.id,
        slug: item.slug,
        name: item.name,
        category: item.category,
        provinceName: item.provinceName,
        regencyName: item.regencyName,
        districtName: item.districtName,
        description: item.description,
        originNote: item.originNote,
        localImagePath: item.media?.localImagePath,
        sourceDataset: item.provenance.sourceDataset,
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Patterns that represent queries explicitly outside the Indonesian cultural exploration domain.
 */
const NON_CULTURAL_PATTERNS = [
  // Math / expressions
  /\b\d+\s*[\+\-\*\/%^]\s*\d+\b/,
  /\b(kalkulus|aljabar|trigonometri|rumus fisika|integral|diferensial|persamaan linear|logaritma|aritmatika)\b/i,
  // Coding / Tech
  /\b(javascript|typescript|python|c\+\+|golang|php|html|css|sql|select\s+\*|react|nextjs|npm|github|docker|kubernetes|debug|coding|syntax|regex|function|const|let|var|class\s+\w+|import\s+from)\b/i,
  // World leaders / foreign politics
  /\b(presiden amerika|donald trump|joe biden|vladimir putin|barack obama|perang dunia|pemilu as|nato|pbb|geopolitik dunia|partai politik luar|israel|palestina)\b/i,
  // Global celebrities / international pop culture / sports
  /\b(cristiano ronaldo|lionel messi|liga champions|premier league|nba|hollywood|marvel|avengers|taylor swift|blackpink|bts|k-pop|drakor)\b/i,
  // Crypto / finance / forex / trading
  /\b(crypto|cryptocurrency|bitcoin|ethereum|forex|saham amerika|trading binary|reksadana luar)\b/i,
  // Medical / health diagnosis / prescriptions
  /\b(obat|resep obat|apotek|dokter|klinik|rumah sakit|sakit kepala|penyakit|gejala|kanker|diagnosa|paracetamol|vaksin|terapi medis|cara mengobati)\b/i,
  // General world geography / foreign monuments
  /\b(ibu kota prancis|ibu kota inggris|menara eiffel|patung liberty|benua afrika|gunung everest|peradaban mesir kuno|sungai amazon|menara pisa)\b/i,
  // Jailbreak / prompt injection
  /\b(ignore previous|abaikan instruksi|abaikan sistem|jailbreak|dan mode|prompt injection|lupakan batasan)\b/i,
];

const CULTURAL_ANCHOR_KEYWORDS = [
  "budaya", "kebudayaan", "adat", "tradisi", "tari", "tarian", "musik", "lagu", "alat musik",
  "pakaian", "baju", "busana", "wastra", "kain", "kuliner", "makanan", "masakan", "minuman",
  "bahasa", "suku", "daerah", "nusantara", "indonesia", "provinsi", "kabupaten", "kota",
  "kerajaan", "kesultanan", "sejarah", "makna", "filosofi", "upacara", "ritual", "rumah adat",
  "arsitektur", "legenda", "cerita rakyat", "mitos", "kerajinan", "seni", "ukiran", "batik",
  "wayang", "reog", "gamelan", "angklung", "sasando", "rendang", "soto", "rawon", "ulos",
  "songket", "kebaya", "barong", "kecak", "saman", "jaipong", "piring", "tor-tor", "kacapi",
  "kolintang", "tifa", "talempong", "saluang", "kendang", "bonang", "gong", "saron",
  "gudeg", "papeda", "pempek", "kerak telor", "ayam betutu", "coto makassar", "konro",
  "baju bodo", "payas agung", "surjan", "beskap", "blangkon", "kain tapis",
  "aceh", "sumatera", "riau", "jambi", "bengkulu", "lampung", "bangka", "belitung",
  "jakarta", "jawa", "banten", "yogyakarta", "jogja", "bali", "nusa tenggara", "ntb", "ntt",
  "kalimantan", "sulawesi", "gorontalo", "maluku", "papua", "dayak", "batak", "minang",
  "bugis", "toraja", "asmat", "dani", "baduy", "betawi", "sunda", "madura", "sasak"
];

/**
 * Wall Protection Guardrail evaluator.
 * Returns true if the query is in context of Indonesian / Nusantara culture.
 */
export function isCulturalQuery(query: string, references: RetrievedReference[]): boolean {
  const q = query.toLowerCase().trim();

  // If matches any non-cultural blacklisted patterns, reject immediately
  for (const pattern of NON_CULTURAL_PATTERNS) {
    if (pattern.test(q)) {
      return false;
    }
  }

  // Strong database match indicates cultural domain
  if (references.length > 0 && references[0].score >= 35) {
    return true;
  }

  // Check presence of cultural keywords
  for (const kw of CULTURAL_ANCHOR_KEYWORDS) {
    if (q.includes(kw)) {
      return true;
    }
  }

  // Moderate score with reasonable input
  if (references.length > 0 && references[0].score >= 20) {
    return true;
  }

  return false;
}

export const WALL_PROTECTION_RESPONSE: ChatResponsePayload = {
  text: `### 🛡️ Di Luar Konteks Kebudayaan Nusantara

Maaf, saya adalah **Pamong Budaya AI** yang dirancang khusus sebagai pendamping belajar dan eksplorasi **kebudayaan Indonesia & Nusantara**.

Saya hanya dapat menjawab pertanyaan seputar kebudayaan Indonesia, seperti:
* **Seni Tari & Pertunjukan**: Reog Ponorogo, Tari Saman, Tari Kecak, Tari Jaipong, Tari Piring
* **Alat Musik Tradisional**: Sasando, Angklung, Gamelan, Kolintang, Tifa, Saluang
* **Kuliner Tradisional**: Rendang, Rawon, Gudeg, Papeda, Soto Betawi, Ayam Betutu
* **Pakaian & Wastra Adat**: Batik, Ulos, Songket, Payas Agung, Baju Bodo
* **Bahasa & Tradisi Daerah**: Bahasa Jawa, Sunda, Minang, rumah adat, upacara adat, dan kearifan lokal Nusantara

Silakan ajukan pertanyaan yang berkaitan dengan warisan budaya Indonesia!`,
  references: [],
  isAiPowered: false,
  modelName: "Pamong Budaya AI",
  suggestedQuestions: [
    "Apa makna filosofis batik Nusantara?",
    "Bagaimana sejarah Reog Ponorogo?",
    "Apa makanan khas Jawa Timur dan bagaimana asal-usulnya?",
  ],
};

/**
 * Local Grounded Synthesis when external Gemini API is unreachable or offline.
 * Generates an accurate, structured, and deep explanation directly from verified data.
 */
function generateLocalSynthesis(query: string, references: RetrievedReference[]): ChatResponsePayload {
  const qLower = query.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  const targetCategory = matchCategory(query);
  const targetProvince = matchProvince(query);

  // 1. Curated knowledge for iconic Indonesian culture topics
  // 1a. Reog Ponorogo
  if (qLower.includes("reog") || (qLower.includes("ponorogo") && !qLower.includes("pakaian"))) {
    const reogRef = references.find((r) => r.name.toLowerCase().includes("reog")) || references[0];
    const relatedPonorogo = references.filter((r) => r.id !== reogRef?.id);

    const lines: string[] = [
      `### Seni Pertunjukan & Tari Reog Ponorogo (Jawa Timur)`,
      `**Asal Wilayah:** Kabupaten Ponorogo, Provinsi Jawa Timur.`,
      `**Status Kehormatan:** Warisan Budaya Takbenda Nasional & Warisan Budaya Takbenda UNESCO.`,
      "",
      `#### 1. Sejarah & Asal-Usul Legenda`,
      `Reog Ponorogo adalah seni pertunjukan dan drama tari rakyat yang sangat legendaris dari Kabupaten Ponorogo. Menurut hikayat Bantarangin, Reog bermula dari kisah lamaran Prabu Klono Sewandono kepada Putri Songgolangit dari Kerajaan Kediri, yang mensyaratkan tontonan binatang berkepala dua yang belum pernah ada sebelumnya. Dalam versi sejarah rakyat lainnya, kesenian ini diciptakan oleh **Ki Ageng Kutu** (Demang Suryongalam) pada abad ke-15 sebagai sindiran simbolis terhadap Raja Majapahit Bhre Kertabhumi (Brawijaya V) yang dikendalikan oleh permaisurinya.`,
      "",
      `#### 2. Tokoh & Unsur Utama Pertunjukan`,
      `* **Singo Barong (Dadak Merak):** Sosok singa raksasa berhiaskan ratusan bulu burung merak setinggi lebih dari 2 meter dengan berat hingga 50 kg. Topeng mahakarya ini diangkat oleh penari utama (*Pembarong*) hanya menggunakan kekuatan gigitan gigi dan leher.`,
      `* **Warok:** Tokoh kesatria berwibawa, berilmu kanuragan tinggi, berbusana serba hitam (*penadon*) dengan tali kolor putih yang melambangkan kebersahajaan dan kesucian batin.`,
      `* **Jathil:** Barisan penari berkuda kepang yang melambangkan prajurit berkuda tangkas nan anggun.`,
      `* **Bujang Ganong (Patih Pujangga Anom):** Patih bertopeng merah berhidung besar yang lincah, jenaka, dan mempertunjukkan keahlian akrobatik memukau.`,
      `* **Prabu Klono Sewandono:** Raja bermahkota emas yang gagah perkasa dan memegang pusaka cambuk Samandiman.`,
      "",
      `#### 3. Nilai & Makna Filosofis`,
      `Reog Ponorogo bukan sekadar hiburan visual, melainkan lambang keteguhan batin, keberanian, patriotisme, dan kemenangan budi pekerti luhur atas hawa nafsu angkara murka. Harmonisasi antara musik gamelan kempul, terompet reog yang meliuk khas, dan dinamika gerak penari mencerminkan solidaritas gotong royong masyarakat Ponorogo.`,
    ];

    if (relatedPonorogo.length > 0) {
      lines.push("");
      lines.push(`#### Khazanah Budaya Pendukung dari Ponorogo:`);
      for (const r of relatedPonorogo) {
        lines.push(`* **${r.name}** (${r.category.toUpperCase()}): ${r.description}`);
      }
    }

    return {
      text: lines.join("\n"),
      references,
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Bagaimana filosofi topeng Singo Barong dan bulu merak?",
        "Apa peran dan makna pakaian Penadon bagi seorang Warok?",
        "Bagaimana cara memainkan instrumen terompet Reog?",
      ],
    };
  }

  // 1b. Curated knowledge for Batik
  if (qLower.includes("batik")) {
    const lines: string[] = [
      `### Filosofi & Sejarah Seni Batik Indonesia`,
      `**Status Kehormatan:** Warisan Kemanusiaan untuk Budaya Lisan dan Nonbendawi oleh UNESCO sejak 2 Oktober 2009.`,
      "",
      `#### 1. Sejarah & Hakikat Membatik`,
      `Batik berasal dari kata bahasa Jawa *amba* (menulis) dan *titik* (titik), yang berarti menuliskan motif menggunakan lilin malam (*wax-resist dyeing*) di atas kain mori atau sutra dengan canting tulis atau cap tembaga. Seni membatik telah berkembang pesat sejak zaman kerajaan di tanah Jawa, khususnya di lingkungan keraton Surakarta dan Yogyakarta, sebelum meluas ke seluruh pesisir Nusantara.`,
      "",
      `#### 2. Makna Filosofis Motif-Motif Utama`,
      `* **Motif Parang Rusak:** Melambangkan ombak samudra yang tak kenal lelah menghantam karang; bermakna perjuangan hidup, ketabahan, dan pantang menyerah.`,
      `* **Motif Kawung:** Berupa empat bulatan elips yang melambangkan buah aren/kolang-kaling; mencerminkan kesucian hati, empat arah mata angin, serta pengendalian diri.`,
      `* **Motif Mega Mendung (Cirebon):** Pola awan pembawa hujan penyejuk; bermakna ketenangan pikiran, kesabaran dalam kepemimpinan, dan kesejukan jiwa.`,
      `* **Motif Truntum:** Melambangkan bintang malam yang berkerlap-kerlip; bermakna cinta kasih yang tulus, bersemi kembali, dan bimbingan bagi keturunan.`,
      "",
      `#### 3. Nilai Budaya & Identitas Bangsa`,
      `Batik bukan sekadar busana, melainkan manifestasi doa, harapan, etika kesopanan, dan status sosial leluhur. Ragam hiasnya mencerminkan akulturasi budaya yang harmonis antara tradisi agraris keraton pedalaman dan keterbukaan maritim kota pesisir.`,
    ];

    return {
      text: lines.join("\n"),
      references: [],
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Apa perbedaan antara batik keraton dan batik pesisir?",
        "Bagaimana sejarah motif Mega Mendung dari Cirebon?",
        "Kapan batik digunakan dalam upacara adat tradisional?",
      ],
    };
  }

  // 1c. Curated knowledge for Tari Saman
  if (qLower.includes("saman")) {
    const lines: string[] = [
      `### Tari Saman: Warisan Budaya Takbenda Dunia dari Aceh`,
      `**Asal Wilayah:** Dataran Tinggi Gayo, Kabupaten Gayo Lues, Provinsi Aceh.`,
      `**Pengakuan:** Diakui UNESCO sebagai *Intangible Cultural Heritage in Need of Urgent Safeguarding* sejak tahun 2011.`,
      "",
      `#### 1. Sejarah & Asal-Usul`,
      `Tari Saman dikembangkan oleh ulama besar suku Gayo bernama **Syekh Saman** pada abad ke-14 Masehi. Pada mulanya, tarian ini merupakan permainan rakyat bernama Pok Ane yang kemudian dipadukan dengan syiar dakwah Islam melalui lantunan syair puji-pujian kepada Allah SWT dan nasihat moral persatuan.`,
      "",
      `#### 2. Ciri Khas & Keunikan Pertunjukan`,
      `Tari Saman dibawakan oleh sekelompok penari pria (biasanya berjumlah ganjil) yang duduk bersimpuh rapat dalam satu saf lurus. Keistimewaan utama Saman adalah penampilannya yang tidak diiringi oleh instrumen musik eksternal; ritme dan harmoni tercipta murni dari tepukan dada, tepukan tangan, tepukan paha, petikan jari, dan gelengan kepala yang dilakukan dengan kecepatan luar biasa dan sinkronisasi presisi tinggi.`,
      "",
      `#### 3. Nilai Filosofis`,
      `Saf yang berbaris rapat melambangkan persatuan umat yang kokoh, kesetaraan sosial tanpa membedakan derajat, serta kedisiplinan dan kepatuhan terhadap pemimpin tari (*Syekh*). Setiap syair yang dilantunkan membawa pesan perdamaian, kearifan lokal, dan penghormatan kepada leluhur.`,
    ];

    return {
      text: lines.join("\n"),
      references,
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Apa fungsi syair yang dilantunkan dalam Tari Saman?",
        "Apa perbedaan Tari Saman dengan Tari Ratoh Duek?",
        "Bagaimana cara menjaga kekompakan tepukan tangan dalam Saman?",
      ],
    };
  }

  // 1d. Curated knowledge for Pakaian Adat Bali (Default Question 4)
  if (
    (qLower.includes("pakaian") || qLower.includes("baju") || qLower.includes("busana")) &&
    qLower.includes("bali")
  ) {
    const lines: string[] = [
      `### Makna & Filosofi Pakaian Adat Bali`,
      `**Asal Wilayah:** Provinsi Bali.`,
      `**Landasan Filosofis:** Konsep Kosmologi *Tri Angga* & Keseimbangan Jiwa *Tri Hita Karana*.`,
      "",
      `#### 1. Tiga Zona Sakral Tubuh (*Tri Angga*)`,
      `Pakaian adat Bali dirancang berlandaskan ajaran pembagian tubuh manusia menjadi tiga tingkatan kesucian:`,
      `* **Utama Angga (Bagian Kepala / Zona Suci):** Kaum pria mengenakan **Udeng** (destar penutup kepala) dengan lekukan simpul di tengah dahi yang tegak menjulang ke atas, melambangkan pemusatan pikiran lurus (*Manacika*) kepada Sang Hyang Widhi Wasa. Kaum wanita menata rambut dengan sanggul pusung dan hiasan bunga cempaka kuning atau kamboja putih yang harum sebagai lambang kesucian budi pekerti.`,
      `* **Madya Angga (Bagian Badan / Pengendalian Emosi):** Bagian badan dibalut kain penutup dada (*Kamen*) dan diikat dengan **Selendang (Senteng)** di pinggang. Selendang ini berfungsi mengikat hawa nafsu hewani, emosi rendah, dan kemarahan agar tidak mengotori pikiran suci. Pada pria dipadukan dengan baju safari atau beskap, sedangkan wanita mengenakan kebaya Bali yang anggun berpotongan pas badan.`,
      `* **Nista Angga (Bagian Kaki / Penghormatan Bumi):** Ditutupi oleh lembaran kain panjang **Kamen** yang menjuntai rapi. Bagi pria, ujung kain sengaja dilipat lancip ke bawah menyentuh tanah sebagai simbol kejantanan (*Dharma*) dan penghormatan kepada Ibu Pertiwi. Bagi wanita, kain dililitkan rapat melingkar dari kiri ke kanan yang melambangkan keanggunan, ketertiban langkah, dan kesopanan adat.`,
      "",
      `#### 2. Tingkatan Busana Tradisional Bali`,
      `* **Payas Agung:** Busana adat kebesaran teragung bermahkota emas bertingkat (*badong*), kain prada gemerlap, dan tapih sutra, dikenakan pada prosesi pernikahan ningrat dan upacara potong gigi (*Mapandes*).`,
      `* **Payas Madya:** Busana persembahyangan harian ke pura dan upacara keagamaan di desa adat, terdiri atas kebaya/safari, senteng, dan kamen.`,
      `* **Payas Alit:** Busana adat paling sederhana dan luwes yang dikenakan saat gotong royong (*ngayah*) mempersiapkan upacara di banjar.`,
      "",
      `#### 3. Nilai Spiritual & Kebijaksanaan`,
      `Busana adat Bali bukan semata busana pesta, melainkan manifestasi pembersihan diri lahiriah dan batiniah (*Sauca*), rasa syukur atas anugerah alam, serta peneguhan tatanan keselarasan antara manusia, alam semesta, dan Sang Pencipta.`,
    ];

    return {
      text: lines.join("\n"),
      references: references.filter((r) => r.provinceName === "Bali"),
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Apa perbedaan Payas Agung dan Payas Madya?",
        "Mengapa selendang senteng wajib diikatkan di pinggang saat ke pura?",
        "Apa makna filosofis di balik lipatan Udeng Bali?",
      ],
    };
  }

  // 1e. Curated knowledge for "Mengapa masyarakat Indonesia memiliki banyak tradisi yang berbeda?" (Default Question 5)
  if (
    (qLower.includes("mengapa") || qLower.includes("kenapa")) &&
    (qLower.includes("banyak tradisi") ||
      qLower.includes("tradisi yang berbeda") ||
      qLower.includes("tradisi berbeda") ||
      qLower.includes("beragam") ||
      qLower.includes("bhinneka"))
  ) {
    const lines: string[] = [
      `### Mengapa Masyarakat Indonesia Memiliki Banyak Tradisi yang Berbeda?`,
      `**Prinsip Utama:** Keberagaman dalam Bingkai Kesatuan (*Bhinneka Tunggal Ika*).`,
      "",
      `Kekayaan tradisi, adat istiadat, bahasa, dan kebudayaan Indonesia yang sangat majemuk lahir dari perpaduan faktor geografis, migrasi sejarah, dan adaptasi lingkungan:`,
      "",
      `#### 1. Bentang Geografis Kepulauan Terbesar di Dunia (*Archipelago*)`,
      `Indonesia terbentang di atas lebih dari 17.000 pulau yang dipisahkan oleh selat, lautan luas, pegunungan terjal, dan hutan tropis. Sebelum era transportasi modern, keterpisahan alami ini membuat setiap kelompok suku bangsa mengembangkan cara hidup, bahasa daerah, pakaian adat, arsitektur rumah, dan tradisi upacara secara mandiri untuk beradaptasi dengan lingkungan lokal mereka.`,
      "",
      `#### 2. Pertemuan Gelombang Migrasi Prasejarah`,
      `Nusantara merupakan titik temu dua rumpun besar peradaban manusia: ras **Melanesoid** di kawasan timur dan penutur rumpun bahasa **Austronesia** yang bermigrasi ribuan tahun silam dari arah barat dan utara. Interaksi ribuan tahun melahirkan lebih dari 300 kelompok etnis dan 718 bahasa daerah yang memiliki kekhasan sistem kekerabatan masing-masing (patrilineal, matrilineal, hingga bilateral).`,
      "",
      `#### 3. Posisi Silang Strategis Jalur Perdagangan Rempah Dunia (*Spice Route*)`,
      `Berada di persimpangan dua benua (Asia dan Australia) serta dua samudra (Hindia dan Pasifik), kepulauan Nusantara menjadi pusat perdagangan maritim dunia selama ribuan tahun. Pedagang dan musafir dari India (membawa pengaruh Hindu-Buddha), Tiongkok, Arab-Persia (membawa Islam), hingga bangsa Eropa membawa khazanah seni, kuliner, dan busana yang kemudian diakulturasi secara harmonis dengan kearifan lokal pribumi.`,
      "",
      `#### 4. Falsafah Luhur Bhinneka Tunggal Ika`,
      `Keberagaman tradisi ini dipandang para pendiri bangsa bukan sebagai pemecah belah, melainkan sebagai taman sari kebudayaan yang saling melengkapi. Dari tradisi bahari suku Bugis dan Bajo, tradisi agraris Jawa dan Sunda, hingga tradisi rimba Dayak dan Asmat, semuanya disatukan oleh komitmen kebangsaan: *Berbeda-beda tetapi tetap satu jua*.`,
    ];

    return {
      text: lines.join("\n"),
      references: [],
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Bagaimana pengaruh Jalur Rempah terhadap kekayaan kuliner Indonesia?",
        "Apa suku bangsa tertua yang mendiami kepulauan Nusantara?",
        "Bagaimana cara generasi muda merawat persatuan di tengah keberagaman?",
      ],
    };
  }

  // 1f. Specific named entity (e.g. "apa itu musik nafiri?") -> answer ONLY about that entity
  const entityIds = new Set(findNamedEntityMatches(query).map((r) => r.id));
  if (entityIds.size > 0 && references.length > 0 && references.every((r) => entityIds.has(r.id))) {
    const primary = references[0];
    const sameEntity = references.filter(
      (r) => r.category === primary.category && itemNameWords(r.name).join(" ") === itemNameWords(primary.name).join(" ")
    );
    const sameEntityList = sameEntity.length > 0 ? sameEntity : [primary];
    // Prefer records from the entity's home region (e.g. Bahasa Sunda in Jawa Barat) over diaspora records
    const homeRecords = sameEntityList.filter(isHomeRecord);
    const entityRecords = homeRecords.length > 0 ? homeRecords : sameEntityList;
    const displayName = primary.name.replace(/\s*\([^)]*\)\s*$/, "").trim() || primary.name;

    const categoryNoun: Record<CulturalCategory, string> = {
      musik: "alat musik tradisional",
      makanan: "kuliner tradisional",
      pakaian: "pakaian adat",
      tarian: "tarian tradisional",
      bahasa: "bahasa daerah",
    };

    const lines: string[] = [`### Mengenal ${displayName}`];

    if (entityRecords.length === 1) {
      const r = entityRecords[0];
      const place = [r.districtName ? `Kec. ${r.districtName}` : "", r.regencyName || "", `Provinsi ${r.provinceName}`]
        .filter(Boolean)
        .join(", ");
      lines.push(`**${displayName}** adalah ${categoryNoun[r.category]} dari **${r.provinceName}**.`);
      lines.push(`**Asal Wilayah:** ${place}.`);
      lines.push("");
      lines.push(shortenDescription(r.description, 900));
      if (r.originNote) {
        lines.push("");
        lines.push(`**Catatan Tradisi:** ${r.originNote}`);
      }
    } else {
      lines.push(
        `**${displayName}** adalah ${categoryNoun[primary.category]} yang tercatat di beberapa wilayah Nusantara dalam basis data kami:`
      );
      lines.push("");
      for (const r of entityRecords) {
        const place = [r.regencyName || "", r.provinceName].filter(Boolean).join(", ");
        lines.push(`* **${place}** — ${shortenDescription(r.description, 350)}`);
      }
    }

    lines.push("");
    lines.push(`#### Nilai & Makna Budaya`);
    switch (primary.category) {
      case "musik":
        lines.push(`Sebagai alat musik tradisional, **${displayName}** menjadi sarana ekspresi, pengiring upacara adat, dan perekat kebersamaan masyarakat setempat.`);
        break;
      case "tarian":
        lines.push(`**${displayName}** mengekspresikan rasa syukur, penghormatan kepada leluhur, dan nilai-nilai kehidupan masyarakat pendukungnya.`);
        break;
      case "makanan":
        lines.push(`**${displayName}** mencerminkan kearifan lokal dalam mengolah bahan dan rempah khas daerahnya serta menjadi bagian dari tradisi kebersamaan.`);
        break;
      case "pakaian":
        lines.push(`**${displayName}** memuat simbol status, kesopanan, dan identitas budaya masyarakat pemakainya.`);
        break;
      case "bahasa":
        lines.push(`**${displayName}** adalah penjaga identitas, ungkapan kearifan lokal, dan memori kolektif penuturnya.`);
        break;
    }

    return {
      text: lines.join("\n"),
      references: entityRecords,
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        `Bagaimana cara memainkan atau menikmati ${displayName}?`,
        `Apa budaya khas lain dari ${primary.provinceName}?`,
        `Bagaimana cara melestarikan ${displayName}?`,
      ],
    };
  }

  // 1g. Whole-place question (e.g. "apa saja kebudayaan di kepulauan seribu") -> overview of THAT place only
  const placeOverview = detectPlaceOverview(query);
  if (placeOverview) {
    const placeIds = new Set(placeOverview.items.map((i) => i.id));
    if (references.length > 0 && references.every((r) => placeIds.has(r.id))) {
      const categoryHeading: Record<CulturalCategory, string> = {
        makanan: "Kuliner & Makanan Tradisional",
        tarian: "Seni Tari",
        musik: "Alat Musik Tradisional",
        pakaian: "Pakaian Adat & Wastra",
        bahasa: "Bahasa Daerah",
      };
      const where =
        placeOverview.level === "province"
          ? `Provinsi ${placeOverview.label}`
          : `${placeOverview.label}${placeOverview.provinceName ? `, Provinsi ${placeOverview.provinceName}` : ""}`;

      const lines: string[] = [
        placeOverview.category
          ? `### 🌟 ${categoryHeading[placeOverview.category]} di ${placeOverview.label}`
          : `### 🌟 Kekayaan Budaya ${placeOverview.label}`,
        `Berikut warisan budaya yang tercatat di **${where}** dalam basis data terverifikasi kami:`,
        "",
      ];

      for (const cat of OVERVIEW_CATEGORY_ORDER) {
        const group = references.filter((r) => r.category === cat);
        if (group.length === 0) continue;
        lines.push(`#### ${categoryHeading[cat]}`);
        for (const r of group) {
          const detail = shortenDescription(r.description, 180);
          lines.push(`* **${r.name}** — ${detail}`);
        }
        lines.push("");
      }

      if (placeOverview.truncated) {
        lines.push(
          `*Menampilkan sebagian contoh. Tanyakan kategori tertentu untuk daftar lengkap, misalnya "makanan di ${placeOverview.label}".*`
        );
      }

      const first = references[0];
      return {
        text: lines.join("\n").trimEnd(),
        references,
        isAiPowered: false,
        modelName: "Pamong Budaya AI",
        suggestedQuestions: [
          first ? `Apa itu ${first.name}?` : `Apa budaya khas ${placeOverview.label}?`,
          `Apa makanan khas ${placeOverview.label}?`,
          `Apa pakaian adat dari ${placeOverview.label}?`,
        ],
      };
    }
  }

  // 2. Regional Category Query (e.g. "makanan dari jawa barat", "kuliner jawa timur", "tarian bali", "alat musik ntt")
  if (targetCategory && targetProvince) {
    const categoryTitle =
      targetCategory === "makanan"
        ? "Kuliner & Makanan Tradisional"
        : targetCategory === "musik"
        ? "Alat Musik Tradisional"
        : targetCategory === "pakaian"
        ? "Pakaian Adat & Wastra"
        : targetCategory === "tarian"
        ? "Seni Tari Tradisional"
        : "Bahasa Daerah";
    const itemsInRegion = references.filter(
      (r) => r.category === targetCategory && r.provinceName.toLowerCase() === targetProvince.toLowerCase()
    );

    const lines: string[] = [
      `### 🌟 Khazanah ${categoryTitle} Khas ${targetProvince}`,
      `Provinsi **${targetProvince}** menyimpan warisan ${categoryTitle.toLowerCase()} yang kaya akan teknik tradisional, sejarah, dan filosofi kearifan lokal.`,
      "",
      `Berikut adalah ragam ${categoryTitle.toLowerCase()} khas ${targetProvince} yang tercatat dalam basis data budaya Nusantara terverifikasi:`,
      "",
    ];

    if (itemsInRegion.length > 0) {
      for (const item of itemsInRegion) {
        const regencyText = item.regencyName ? ` *(${item.regencyName})*` : "";
        lines.push(`* **${item.name}**${regencyText}`);
        lines.push(`  ${item.description}`);
        if (item.originNote) {
          lines.push(`  *Ciri Khas & Tradisi:* ${item.originNote}`);
        }
        lines.push("");
      }
    } else {
      lines.push(`* *Catatan:* Khazanah ${categoryTitle.toLowerCase()} dari ${targetProvince} terus diperkaya dalam basis data nasional.`);
      lines.push("");
    }

    lines.push(`#### Nilai & Makna Filosofis Tradisi ${targetProvince}:`);
    if (targetCategory === "makanan") {
      lines.push(`Kuliner tradisional ${targetProvince} bukan sekadar santapan lezat, melainkan ungkapan rasa syukur atas kesuburan tanah Nusantara, kepiawaian mengolah bumbu rempah alami, serta medium perekat tali silaturahmi antarwarga masyarakat.`);
    } else if (targetCategory === "tarian") {
      lines.push(`Setiap gerak tarian tradisional ${targetProvince} mencerminkan narasi sejarah leluhur, ungkapan spiritual kepada Sang Pencipta, serta media pendidikan moral bagi generasi penerus.`);
    } else if (targetCategory === "musik") {
      lines.push(`Instrumen musik tradisional ${targetProvince} berperan sebagai media komunikasi sakral leluhur dan pengiring upacara adat yang mengutamakan keselarasan nada serta solidaritas gotong royong.`);
    } else if (targetCategory === "pakaian") {
      lines.push(`Busana adat ${targetProvince} sarat akan simbol martabat, etika kesopanan, dan penghormatan terhadap tatanan tata krama leluhur.`);
    } else {
      lines.push(`Bahasa daerah di ${targetProvince} menjaga memori kolektif peradaban suku setempat, ungkapan kearifan lokal (*local wisdom*), dan etika bertutur santun.`);
    }

    const activeList = itemsInRegion.length > 0 ? itemsInRegion : references;
    return {
      text: lines.join("\n"),
      references: activeList,
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        activeList[0] ? `Bagaimana sejarah dan asal-usul ${activeList[0].name}?` : `Apa tradisi unik di ${targetProvince}?`,
        `Apa tarian atau pakaian adat terkenal lainnya dari ${targetProvince}?`,
        `Bagaimana cara melestarikan warisan budaya ${targetProvince}?`,
      ],
    };
  }

  // 3. Category Only Query (e.g. "alat musik tradisional indonesia", "makanan khas nusantara")
  if (targetCategory && references.length > 0) {
    const catLabel = CATEGORY_META[targetCategory].label;
    const catShort = CATEGORY_META[targetCategory].shortLabel;

    const lines: string[] = [
      `### 🌟 Khazanah ${catLabel} Nusantara`,
      `Kebudayaan Indonesia memiliki kekayaan ${catShort.toLowerCase()} yang luar biasa beragam dari Sabang sampai Merauke.`,
      "",
      `Berikut adalah beberapa contoh ${catShort.toLowerCase()} tradisional Nusantara terverifikasi dalam basis data kami:`,
      "",
    ];

    for (const item of references) {
      const originText = ` *(Provinsi ${item.provinceName}${item.regencyName ? `, ${item.regencyName}` : ""})*`;
      lines.push(`* **${item.name}**${originText}`);
      lines.push(`  ${item.description}`);
      lines.push("");
    }

    lines.push(`#### Nilai Filosofis & Keberagaman:`);
    lines.push(`Setiap ${catShort.toLowerCase()} daerah mencerminkan kearifan lokal suku bangsa pengembangnya serta adaptasi harmonis terhadap alam dan sejarah Nusantara.`);

    return {
      text: lines.join("\n"),
      references,
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        `Apa ${catShort.toLowerCase()} yang paling terkenal dari Jawa?`,
        `Bagaimana perkembangan ${catShort.toLowerCase()} tradisional di era modern?`,
        `Apa makna filosofis di balik ${references[0]?.name || "budaya ini"}?`,
      ],
    };
  }

  // 4. Empty references fallback
  if (references.length === 0) {
    return {
      text: `Pertanyaan Anda mengenai **"${query}"** belum dapat dipadankan secara spesifik dengan 1.722 data warisan budaya terverifikasi di basis data kami (meliputi Bahasa Daerah, Alat Musik, Makanan Tradisional, Pakaian Adat, dan Seni Tari).\n\nAnda dapat menanyakan budaya spesifik Nusantara seperti:\n* **Seni Tari & Pertunjukan**: Reog Ponorogo, Tari Saman, Tari Kecak, Tari Jaipong, Tari Piring\n* **Alat Musik Tradisional**: Sasando, Angklung, Gamelan, Kolintang, Tifa\n* **Kuliner Nusantara**: Rendang, Rawon, Gudeg, Papeda, Soto Betawi\n* **Pakaian & Wastra**: Batik, Ulos, Payas Agung, Baju Bodo\n* **Bahasa Daerah**: Bahasa Jawa, Sunda, Minangkabau, Bugis, Asmat`,
      references: [],
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Apa makna filosofis Reog Ponorogo?",
        "Bagaimana sejarah instrumen Sasando?",
        "Apa filosofi kuliner Rendang Minangkabau?",
      ],
    };
  }

  // 5. Default grounded synthesis from verified single record
  const primary = references[0];
  const otherRefs = references.slice(1);

  const lines: string[] = [];
  lines.push(`### Mengenal ${primary.name} (${primary.category.toUpperCase()})`);
  lines.push(`**Asal Wilayah:** Provinsi ${primary.provinceName}${primary.regencyName ? `, ${primary.regencyName}` : ""}${primary.districtName ? `, Kec. ${primary.districtName}` : ""}.`);
  lines.push("");
  lines.push(`#### 1. Deskripsi & Sejarah Kebudayaan`);
  lines.push(primary.description);
  lines.push("");

  if (primary.originNote) {
    lines.push(`#### 2. Konteks Pelaksanaan & Ciri Khas`);
    lines.push(`* **Catatan Tradisi:** ${primary.originNote}`);
    lines.push(`* **Sumber Terverifikasi:** Arsip Budaya Kemendikbud & dataset *${primary.sourceDataset}*.`);
    lines.push("");
  }

  lines.push(`#### 3. Nilai & Makna Filosofis`);
  switch (primary.category) {
    case "musik":
      lines.push(`Sebagai instrumen musik tradisional Nusantara, **${primary.name}** bukan sekadar penghasil nada, melainkan sarana komunikasi spiritual, pengiring ritual leluhur, serta simbol kekerabatan masyarakat ${primary.provinceName}. Harmonisasi nada yang dihasilkan mencerminkan falsafah gotong royong dan keselarasan kosmis.`);
      break;
    case "tarian":
      lines.push(`Setiap ragam gerak dalam **${primary.name}** melambangkan ekspresi syukur masyarakat ${primary.provinceName} kepada Sang Pencipta, penghormatan kepada alam, serta penyambutan tamu kehormatan dengan penuh kemuliaan adat.`);
      break;
    case "makanan":
      lines.push(`Kuliner tradisional **${primary.name}** mewariskan kearifan lokal dalam pengolahan rempah Nusantara. Cita rasa yang kaya mencerminkan sejarah agraris/maritim masyarakat ${primary.provinceName} serta fungsi sosial sebagai hidangan perekat persaudaraan dalam kenduri dan upacara adat.`);
      break;
    case "pakaian":
      lines.push(`Rancangan busana adat **${primary.name}** sarat akan simbol hierarki kehormatan, kesopanan, dan status sosial. Setiap ornamen motif dan ragam hias kain melambangkan doa keselamatan dan identitas jati diri leluhur ${primary.provinceName}.`);
      break;
    case "bahasa":
      lines.push(`Bahasa daerah **${primary.name}** merupakan benteng identitas kultural penuturnya di wilayah ${primary.provinceName}. Di dalamnya tersimpan ungkapan kearifan lokal (*local wisdom*), etika pergaulan, dan peribahasa warisan leluhur.`);
      break;
  }

  if (otherRefs.length > 0) {
    lines.push("");
    lines.push(`#### Budaya Terkait yang Juga Relevan:`);
    for (const ref of otherRefs) {
      lines.push(`* **${ref.name}** (${ref.category.toUpperCase()} — ${ref.provinceName})`);
    }
  }

  return {
    text: lines.join("\n"),
    references,
    isAiPowered: false,
    modelName: "Pamong Budaya AI",
    suggestedQuestions: [
      `Bagaimana cara melestarikan ${primary.name}?`,
      `Apa saja elemen pendukung atau keunikan khas ${primary.name}?`,
      `Apa budaya lain yang terkenal dari ${primary.provinceName}?`,
    ],
  };
}

/**
 * Static system instruction. It is intentionally IDENTICAL on every request (no per-request data)
 * so it forms a long, stable prompt prefix that Gemini implicit context caching can reuse.
 * Per-request retrieved context is sent in the final user turn instead.
 */
const GEMINI_SYSTEM_INSTRUCTION = `Anda adalah "Pamong Budaya AI", pakar kurator dan pendidik kebudayaan Nusantara Indonesia yang berwawasan luas, santun, objektif, dan inspiratif.

[WALL PROTECTION & BATASAN KONTEKS - SANGAT KETAT]:
1. Anda HANYA DAN HARUS menjawab pertanyaan yang berkaitan dengan KEBUDAYAAN INDONESIA / NUSANTARA (sejarah kebudayaan daerah di Indonesia, tradisi, seni tari dan pertunjukan, musik dan alat musik tradisional, pakaian dan wastra adat, kuliner khas daerah Indonesia, bahasa daerah, rumah adat, upacara adat, kerajinan tangan, dan nilai kearifan lokal suku-suku di Indonesia).
2. JIKA PENGGUNA BERTANYA DI LUAR KONTEKS KEBUDAYAAN INDONESIA (misalnya: matematika/hitungan, pemrograman/koding komputer, sains umum dunia, sejarah asing di luar Indonesia, selebriti/tokoh internasional, politik global, rekomendasi medis/kesehatan, saran keuangan/kripto, atau pertanyaan non-budaya lainnya):
   ANDA WAJIB MENOLAK UNTUK MENJAWAB TOPIK TERSEBUT SECARA SANTUN DAN TEGAS.
   Gunakan format penolakan:
   "### 🛡️ Di Luar Konteks Kebudayaan Nusantara\n\nMaaf, saya adalah **Pamong Budaya AI** yang dikhususkan sebagai pendamping belajar dan eksplorasi **kebudayaan Indonesia & Nusantara**.\n\nSaya tidak dapat memberikan jawaban untuk topik di luar kebudayaan Nusantara. Silakan ajukan pertanyaan seputar seni tari, musik tradisional, pakaian adat, kuliner daerah, bahasa daerah, maupun kearifan lokal Indonesia!"
   JANGAN MENJAWAB PERTANYAAN DI LUAR BUDAYA INDONESIA DALAM KONDISI APA PUN.

PEDOMAN JAWABAN BUDAYA:
0a. FOKUS WILAYAH: Jika pertanyaan menanyakan kebudayaan suatu wilayah (provinsi, kabupaten/kota, atau kecamatan, misalnya "apa saja kebudayaan di Kepulauan Seribu"), rangkum HANYA kebudayaan dari wilayah itu berdasarkan [DATA_TERVERIFIKASI KAMI], dikelompokkan per kategori. JANGAN memasukkan budaya dari daerah lain yang namanya mirip (misalnya Kepulauan Seribu bukan Kepulauan Riau atau Kepulauan Anambas).
0. FOKUS ENTITAS: Jika pertanyaan menyebut satu budaya/benda budaya tertentu (misalnya "apa itu musik nafiri?"), jawab HANYA tentang entitas tersebut secara ringkas dan padat. JANGAN menambahkan daftar budaya lain, alat musik lain, atau contoh lain yang tidak ditanyakan.
1. JAWABLAH TEPAT SESUAI TOPIK PERTANYAAN PENGGUNA. Jika pengguna bertanya tentang seni pertunjukan atau tarian (misalnya "Reog Ponorogo", "Tari Saman"), fokuskan penjelasan pada seni tari/pertunjukan tersebut (sejarah legenda, tokoh utama seperti Singo Barong & Warok, makna filosofis, dan keindahannya). JANGAN PERNAH mengalihkan topik ke pakaian atau atribut lain hanya karena atribut tersebut terdaftar di arsip wilayah terkait.
2. JELASKAN SECARA MENDALAM: Jelaskan bukan hanya "apa" kebudayaan tersebut, tetapi juga latar belakang sejarahnya, asal wilayah daerah asalnya, fungsi dan peranan adat, simbolisme, serta nilai filosofis kearifan lokal (*local wisdom*) yang terkandung di dalamnya.
3. INTEGRASI BASIS DATA TERVERIFIKASI: Gunakan [DATA_TERVERIFIKASI KAMI] sebagai rujukan valid. Jika data terverifikasi mencakup pakaian adat, alat musik, atau tradisi yang menyertai kebudayaan tersebut di daerah yang sama, posisikan hal itu sebagai elemen pendukung atau konteks pelengkap, BUKAN mengganti esensi topik utama yang ditanyakan.
4. KEJUJURAN & INTEGRITAS FAKTA: Hindari mengarang fakta sejarah fiktif, tokoh palsu, atau tautan URL palsu. Jika ada hal yang bersumber dari cerita rakyat atau mitos tutur lisan, sebutkan secara jelas sebagai warisan tutur rakyat setempat.
5. FORMAT JAWABAN: Susun jawaban dengan Markdown yang rapi dan terstruktur:
   - Gunakan judul sub-bab dengan heading Markdown level 3 (###) atau level 4 (####) seperti "### Sejarah & Asal-Usul", "### Nilai Filosofis", "### Tokoh & Karakter Budaya".
   - Gunakan poin-poin bertitik (*) atau bernomor untuk keterbacaan yang nyaman.
   - Gunakan penekanan tebal (**kata kunci**) pada istilah penting kebudayaan.
   - Hindari menulis teks catatan mentah sistem/metadata API atau nama model AI.

Data arsip terverifikasi untuk setiap pertanyaan diberikan pada pesan pengguna di bawah label [DATA_TERVERIFIKASI KAMI].`;

/**
 * Call Google Gemini API trying current standard models.
 */
async function callGeminiApi(
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  apiKey: string,
  signal?: AbortSignal
): Promise<{ text: string; modelName: string } | null> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.65,
            maxOutputTokens: 2000,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        // Implicit caching is automatic on Gemini 2.5+; cached prefix tokens are reported here.
        const usage = json.usageMetadata;
        if (usage && process.env.NODE_ENV !== "production") {
          console.info(
            `[gemini:${model}] prompt=${usage.promptTokenCount ?? 0} cached=${usage.cachedContentTokenCount ?? 0}`
          );
        }
        const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          return {
            text: candidateText,
            modelName: "Pamong Budaya AI",
          };
        }
      } else {
        const errBody = await res.text();
        console.warn(`Gemini API model ${model} HTTP ${res.status}:`, errBody.slice(0, 250));
      }
    } catch (err) {
      // Client pressed "stop generating": do not try fallback models
      if (signal?.aborted) return null;
      console.warn(`Gemini API model ${model} network error:`, err);
    }
  }
  return null;
}

/**
 * Main AI Chat Processor with RAG grounding and Wall Protection guardrail.
 */
export async function processCultureChat(
  query: string,
  targetSlug?: string,
  history: Array<{ role: "user" | "model"; text: string }> = [],
  signal?: AbortSignal
): Promise<ChatResponsePayload> {
  const references = retrieveCultureContext(query, targetSlug, 6);

  // 1. Wall Protection Guardrail Check
  if (!isCulturalQuery(query, references)) {
    return WALL_PROTECTION_RESPONSE;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateLocalSynthesis(query, references);
  }

  // Build Context for Gemini RAG
  const contextSnippet = references
    .map(
      (r, idx) =>
        `[Sumber ${idx + 1}]
Nama: ${r.name}
Kategori: ${r.category}
Provinsi: ${r.provinceName}
Kabupaten/Kota: ${r.regencyName || "-"}
Kecamatan: ${r.districtName || "-"}
Asal/Konteks: ${r.originNote || "-"}
Deskripsi: ${r.description}
File Data: ${r.sourceDataset}`
    )
    .join("\n\n");


  const contextBlock = `[DATA_TERVERIFIKASI KAMI]:
${contextSnippet || "Tidak ada data arsip spesifik langsung untuk kata kunci ini di database internal kami. Berikan penjelasan komprehensif berdasarkan khazanah sejarah kebudayaan Indonesia yang terverifikasi dan sahih."}`;

  try {
    // Order matters for implicit caching: static system instruction -> conversation history
    // (shared prefix across turns) -> per-request context + question (changes every call).
    const contents = [
      ...history.slice(-4).map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: `${contextBlock}\n\n[PERTANYAAN PENGGUNA]:\n${query}` }],
      },
    ];

    const geminiResult = await callGeminiApi(GEMINI_SYSTEM_INSTRUCTION, contents, apiKey, signal);

    if (geminiResult) {
      return {
        text: geminiResult.text,
        references,
        isAiPowered: true,
        modelName: "Pamong Budaya AI",
        suggestedQuestions: [
          references[0] ? `Apa makna filosofis ${references[0].name}?` : "Apa makna filosofis batik Nusantara?",
          references[0] ? `Bagaimana cara melestarikan ${references[0].name}?` : "Bagaimana sejarah Reog Ponorogo?",
          "Apa rekomendasi budaya Nusantara lainnya?",
        ],
      };
    }

    // Fallback to local grounded synthesis if Gemini API call did not succeed
    return generateLocalSynthesis(query, references);
  } catch (error) {
    console.error("Error communicating with Gemini API", error);
    return generateLocalSynthesis(query, references);
  }
}
