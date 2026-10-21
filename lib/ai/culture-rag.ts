import fs from "fs";
import path from "path";
import { CulturalCategory, CulturalItem } from "@/types/culture";

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
 * Retrieve top relevant cultural records matching user query using weighted keyword ranking.
 */
export function retrieveCultureContext(query: string, targetSlug?: string, limit = 5): RetrievedReference[] {
  const items = getCulturalDatabase();
  const qClean = query.toLowerCase().trim();
  const rawTokens = qClean
    .split(/[\s,.-]+/)
    .filter((t) => t.length > 2 && !["apa", "itu", "dan", "yang", "dari", "pada", "untuk", "bagaimana", "mengapa", "sejarah", "makna"].includes(t));

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
 * Local Grounded Synthesis when external Gemini API is unreachable or offline.
 * Generates an accurate, structured, and deep explanation directly from verified data.
 */
function generateLocalSynthesis(query: string, references: RetrievedReference[]): ChatResponsePayload {
  const qLower = query.toLowerCase().trim();

  // 1. Curated knowledge for iconic Indonesian culture topics
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

  // 2. Curated knowledge for Batik
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
      references,
      isAiPowered: false,
      modelName: "Pamong Budaya AI",
      suggestedQuestions: [
        "Apa perbedaan antara batik keraton dan batik pesisir?",
        "Bagaimana sejarah motif Mega Mendung dari Cirebon?",
        "Kapan batik digunakan dalam upacara adat tradisional?",
      ],
    };
  }

  // 3. Curated knowledge for Tari Saman
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

  // 4. Empty references fallback
  if (references.length === 0) {
    return {
      text: `Pertanyaan Anda mengenai **"${query}"** belum dapat dipadankan secara spesifik dengan 1.727 data warisan budaya terverifikasi di basis data kami (meliputi Bahasa Daerah, Alat Musik, Makanan Tradisional, Pakaian Adat, dan Seni Tari).\n\nAnda dapat menanyakan budaya spesifik Nusantara seperti:\n* **Seni Tari & Pertunjukan**: Reog Ponorogo, Tari Saman, Tari Kecak, Tari Jaipong, Tari Piring\n* **Alat Musik Tradisional**: Sasando, Angklung, Gamelan, Kolintang, Tifa\n* **Kuliner Nusantara**: Rendang, Rawon, Gudeg, Papeda, Soto Betawi\n* **Pakaian & Wastra**: Batik, Ulos, Payas Agung, Baju Bodo\n* **Bahasa Daerah**: Bahasa Jawa, Sunda, Minangkabau, Bugis, Asmat`,
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

  // 5. Default grounded synthesis from verified record
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
 * Call Google Gemini API trying gemini-3.8-flash first, then gemini-flash-latest.
 */
async function callGeminiApi(
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  apiKey: string
): Promise<{ text: string; modelName: string } | null> {
  const models = ["gemini-3.8-flash", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  history: Array<{ role: "user" | "model"; text: string }> = []
): Promise<ChatResponsePayload> {
  const references = retrieveCultureContext(query, targetSlug, 4);

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

  const systemInstruction = `Anda adalah "Pamong Budaya AI", pakar kurator dan pendidik kebudayaan Nusantara Indonesia yang berwawasan luas, santun, objektif, dan inspiratif.

[WALL PROTECTION & BATASAN KONTEKS - SANGAT KETAT]:
1. Anda HANYA DAN HARUS menjawab pertanyaan yang berkaitan dengan KEBUDAYAAN INDONESIA / NUSANTARA (sejarah kebudayaan daerah di Indonesia, tradisi, seni tari dan pertunjukan, musik dan alat musik tradisional, pakaian dan wastra adat, kuliner khas daerah Indonesia, bahasa daerah, rumah adat, upacara adat, kerajinan tangan, dan nilai kearifan lokal suku-suku di Indonesia).
2. JIKA PENGGUNA BERTANYA DI LUAR KONTEKS KEBUDAYAAN INDONESIA (misalnya: matematika/hitungan, pemrograman/koding komputer, sains umum dunia, sejarah asing di luar Indonesia, selebriti/tokoh internasional, politik global, rekomendasi medis/kesehatan, saran keuangan/kripto, atau pertanyaan non-budaya lainnya):
   ANDA WAJIB MENOLAK UNTUK MENJAWAB TOPIK TERSEBUT SECARA SANTUN DAN TEGAS.
   Gunakan format penolakan:
   "### 🛡️ Di Luar Konteks Kebudayaan Nusantara\n\nMaaf, saya adalah **Pamong Budaya AI** yang dikhususkan sebagai pendamping belajar dan eksplorasi **kebudayaan Indonesia & Nusantara**.\n\nSaya tidak dapat memberikan jawaban untuk topik di luar kebudayaan Nusantara. Silakan ajukan pertanyaan seputar seni tari, musik tradisional, pakaian adat, kuliner daerah, bahasa daerah, maupun kearifan lokal Indonesia!"
   JANGAN MENJAWAB PERTANYAAN DI LUAR BUDAYA INDONESIA DALAM KONDISI APA PUN.

PEDOMAN JAWABAN BUDAYA:
1. JAWABLAH TEPAT SESUAI TOPIK PERTANYAAN PENGGUNA. Jika pengguna bertanya tentang seni pertunjukan atau tarian (misalnya "Reog Ponorogo", "Tari Saman"), fokuskan penjelasan pada seni tari/pertunjukan tersebut (sejarah legenda, tokoh utama seperti Singo Barong & Warok, makna filosofis, dan keindahannya). JANGAN PERNAH mengalihkan topik ke pakaian atau atribut lain hanya karena atribut tersebut terdaftar di arsip wilayah terkait.
2. JELASKAN SECARA MENDALAM: Jelaskan bukan hanya "apa" kebudayaan tersebut, tetapi juga latar belakang sejarahnya, asal wilayah daerah asalnya, fungsi dan peranan adat, simbolisme, serta nilai filosofis kearifan lokal (*local wisdom*) yang terkandung di dalamnya.
3. INTEGRASI BASIS DATA TERVERIFIKASI: Gunakan [DATA_TERVERIFIKASI KAMI] sebagai rujukan valid. Jika data terverifikasi mencakup pakaian adat, alat musik, atau tradisi yang menyertai kebudayaan tersebut di daerah yang sama, posisikan hal itu sebagai elemen pendukung atau konteks pelengkap, BUKAN mengganti esensi topik utama yang ditanyakan.
4. KEJUJURAN & INTEGRITAS FAKTA: Hindari mengarang fakta sejarah fiktif, tokoh palsu, atau tautan URL palsu. Jika ada hal yang bersumber dari cerita rakyat atau mitos tutur lisan, sebutkan secara jelas sebagai warisan tutur rakyat setempat.
5. FORMAT JAWABAN: Susun jawaban dengan Markdown yang rapi dan terstruktur:
   - Gunakan judul sub-bab dengan heading Markdown level 3 (###) atau level 4 (####) seperti "### Sejarah & Asal-Usul", "### Nilai Filosofis", "### Tokoh & Karakter Budaya".
   - Gunakan poin-poin bertitik (*) atau bernomor untuk keterbacaan yang nyaman.
   - Gunakan penekanan tebal (**kata kunci**) pada istilah penting kebudayaan.
   - Hindari menulis teks catatan mentah sistem/metadata API atau nama model AI.

[DATA_TERVERIFIKASI KAMI]:
${contextSnippet || "Tidak ada data arsip spesifik langsung untuk kata kunci ini di database internal kami. Berikan penjelasan komprehensif berdasarkan khazanah sejarah kebudayaan Indonesia yang terverifikasi dan sahih."}`;

  try {
    const contents = [
      ...history.slice(-4).map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: query }],
      },
    ];

    const geminiResult = await callGeminiApi(systemInstruction, contents, apiKey);

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
