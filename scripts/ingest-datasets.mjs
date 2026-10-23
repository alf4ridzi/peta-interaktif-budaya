import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// Simple RFC-4180 CSV Parser
function parseCSV(content) {
  const clean = content.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    const next = clean[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cur.trim());
        cur = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        if (ch === "\r") i++;
        row.push(cur.trim());
        if (row.some((cell) => cell !== "")) rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  if (cur || row.length > 0) {
    row.push(cur.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  return rows;
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. Load Geographic Reference Data
const provincesRaw = JSON.parse(
  fs.readFileSync(path.join(ROOT, "dataset/peta-indonesia/provinces.json"), "utf8")
);
const regenciesRaw = JSON.parse(
  fs.readFileSync(path.join(ROOT, "dataset/peta-indonesia/regencies.json"), "utf8")
);
const districtsRaw = JSON.parse(
  fs.readFileSync(path.join(ROOT, "dataset/peta-indonesia/districts.json"), "utf8")
);

// Metadata for 34 Provinces (Island Group & Capital)
const PROVINCE_META = {
  "11": { islandGroup: "Sumatera", capital: "Banda Aceh", displayName: "Aceh" },
  "12": { islandGroup: "Sumatera", capital: "Medan", displayName: "Sumatera Utara" },
  "13": { islandGroup: "Sumatera", capital: "Padang", displayName: "Sumatera Barat" },
  "14": { islandGroup: "Sumatera", capital: "Pekanbaru", displayName: "Riau" },
  "15": { islandGroup: "Sumatera", capital: "Jambi", displayName: "Jambi" },
  "16": { islandGroup: "Sumatera", capital: "Palembang", displayName: "Sumatera Selatan" },
  "17": { islandGroup: "Sumatera", capital: "Bengkulu", displayName: "Bengkulu" },
  "18": { islandGroup: "Sumatera", capital: "Bandar Lampung", displayName: "Lampung" },
  "19": { islandGroup: "Sumatera", capital: "Pangkalpinang", displayName: "Kepulauan Bangka Belitung" },
  "21": { islandGroup: "Sumatera", capital: "Tanjungpinang", displayName: "Kepulauan Riau" },
  "31": { islandGroup: "Jawa", capital: "Jakarta", displayName: "DKI Jakarta" },
  "32": { islandGroup: "Jawa", capital: "Bandung", displayName: "Jawa Barat" },
  "33": { islandGroup: "Jawa", capital: "Semarang", displayName: "Jawa Tengah" },
  "34": { islandGroup: "Jawa", capital: "Yogyakarta", displayName: "DI Yogyakarta" },
  "35": { islandGroup: "Jawa", capital: "Surabaya", displayName: "Jawa Timur" },
  "36": { islandGroup: "Jawa", capital: "Serang", displayName: "Banten" },
  "51": { islandGroup: "Bali & Nusa Tenggara", capital: "Denpasar", displayName: "Bali" },
  "52": { islandGroup: "Bali & Nusa Tenggara", capital: "Mataram", displayName: "Nusa Tenggara Barat" },
  "53": { islandGroup: "Bali & Nusa Tenggara", capital: "Kupang", displayName: "Nusa Tenggara Timur" },
  "61": { islandGroup: "Kalimantan", capital: "Pontianak", displayName: "Kalimantan Barat" },
  "62": { islandGroup: "Kalimantan", capital: "Palangka Raya", displayName: "Kalimantan Tengah" },
  "63": { islandGroup: "Kalimantan", capital: "Banjarmasin", displayName: "Kalimantan Selatan" },
  "64": { islandGroup: "Kalimantan", capital: "Samarinda", displayName: "Kalimantan Timur" },
  "65": { islandGroup: "Kalimantan", capital: "Tanjung Selor", displayName: "Kalimantan Utara" },
  "71": { islandGroup: "Sulawesi", capital: "Manado", displayName: "Sulawesi Utara" },
  "72": { islandGroup: "Sulawesi", capital: "Palu", displayName: "Sulawesi Tengah" },
  "73": { islandGroup: "Sulawesi", capital: "Makassar", displayName: "Sulawesi Selatan" },
  "74": { islandGroup: "Sulawesi", capital: "Kendari", displayName: "Sulawesi Tenggara" },
  "75": { islandGroup: "Sulawesi", capital: "Gorontalo", displayName: "Gorontalo" },
  "76": { islandGroup: "Sulawesi", capital: "Mamuju", displayName: "Sulawesi Barat" },
  "81": { islandGroup: "Maluku & Papua", capital: "Ambon", displayName: "Maluku" },
  "82": { islandGroup: "Maluku & Papua", capital: "Sofifi", displayName: "Maluku Utara" },
  "91": { islandGroup: "Maluku & Papua", capital: "Manokwari", displayName: "Papua Barat" },
  "94": { islandGroup: "Maluku & Papua", capital: "Jayapura", displayName: "Papua" },
};

// Map raw province string -> array of BPS province IDs
function resolveProvinceIds(rawProv) {
  if (!rawProv) return [];
  const s = rawProv
    .toLowerCase()
    .replace(/^provinsi\s+/i, "")
    .trim();

  if (s === "riau & kepulauan riau") return ["14", "21"];
  if (s === "sulawesi barat / sulawesi selatan") return ["76", "73"];
  if (s === "sulawesi tengah / sulawesi selatan") return ["72", "73"];
  if (s.includes("papua (seluruh")) return ["94", "91"];
  if (s === "papua (irian jaya)") return ["94"];
  if (s === "dki jakarta (betawi)" || s === "dki jakarta") return ["31"];
  if (s === "daerah istimewa yogyakarta" || s === "di yogyakarta") return ["34"];
  if (s === "bangka belitung" || s === "kepulauan bangka belitung") return ["19"];
  if (s === "sumatra utara" || s === "sumatera utara") return ["12"];
  if (s === "sumatra barat" || s === "sumatera barat") return ["13"];
  if (s === "sumatra selatan" || s === "sumatera selatan") return ["16"];
  if (s === "nusatenggara barat" || s === "nusa tenggara barat") return ["52"];
  if (s === "nusa tenggara timur") return ["53"];
  if (s === "probanten" || s === "banten") return ["36"];
  if (s === "di. aceh" || s === "aceh") return ["11"];

  for (const p of provincesRaw) {
    if (p.name.toLowerCase() === s || PROVI_MATCH(p.id, s)) {
      return [p.id];
    }
  }
  return [];
}

function PROVI_MATCH(id, s) {
  const meta = PROVINCE_META[id];
  return meta && meta.displayName.toLowerCase() === s;
}

// Build Regencies & Districts lookup by province
const regenciesByProvince = new Map();
const regencyById = new Map();
for (const r of regenciesRaw) {
  regencyById.set(r.id, r);
  if (!regenciesByProvince.has(r.province_id)) {
    regenciesByProvince.set(r.province_id, []);
  }
  regenciesByProvince.get(r.province_id).push(r);
}

const districtsByRegency = new Map();
for (const d of districtsRaw) {
  if (!districtsByRegency.has(d.regency_id)) {
    districtsByRegency.set(d.regency_id, []);
  }
  districtsByRegency.get(d.regency_id).push(d);
}

// Web-assisted Provenance Dictionary for items with missing/unspecified regency/district
const PROVENANCE_OVERRIDES = {
  // Alat Musik
  "serune kale": { regencyId: "1107", districtName: "Indrajaya", note: "Populer di Kabupaten Pidie dan Aceh Besar" },
  "aramba": { regencyId: "1204", districtName: "Gunungsitoli", note: "Pulau Nias, Sumatera Utara" },
  "saluang": { regencyId: "1304", districtName: "Lima Kaum", note: "Luhak Tanah Datar & Agam, Minangkabau" },
  "gambus": { regencyId: "1403", districtName: "Bengkalis", note: "Pesisir Melayu Riau (Bengkalis & Siak)" },
  "serangko": { regencyId: "1502", districtName: "Bangko", note: "Masyarakat Bathin di Kabupaten Merangin & Bungo" },
  "accordion": { regencyId: "1671", districtName: "Ilir Barat I", note: "Musik Melayu Palembang, Sumatera Selatan" },
  "doll": { regencyId: "1771", districtName: "Teluk Segara", note: "Upacara Tabot di Kota Bengkulu" },
  "bende": { regencyId: "1801", districtName: "Krui", note: "Adat Pepadun & Saibatin di Lampung" },
  "gendang melayu": { regencyId: "1971", districtName: "Rangkui", note: "Pangkalpinang & Bangka, Kep. Bangka Belitung" },
  "gendang panjang": { regencyId: "2101", districtName: "Bintan Timur", note: "Bintan & Lingga, Kepulauan Riau" },
  "tehyan": { regencyId: "3173", districtName: "Taman Sari", note: "Orkes Gambang Kromong Betawi, Jakarta Barat" },
  "angklung": { regencyId: "3273", districtName: "Padasuka (Cibeunying Kidul)", note: "Saung Angklung Udjo, Bandung & Kuningan" },
  "gamelan": { regencyId: "3372", districtName: "Pasar Kliwon", note: "Keraton Surakarta & Sukoharjo, Jawa Tengah" },
  "gendang": { regencyId: "3471", districtName: "Kraton", note: "Karawitan Keraton Yogyakarta" },
  "bonang": { regencyId: "3502", districtName: "Ponorogo", note: "Gamelan Reyog Ponorogo & Surabaya, Jawa Timur" },
  "gengceng": { regencyId: "5104", districtName: "Ubud", note: "Gamelan Bali di Kabupaten Gianyar" },
  "serunai": { regencyId: "5202", districtName: "Pujut", note: "Musik tradisional Suku Sasak, Lombok Tengah" },
  "sasando": { regencyId: "5314", districtName: "Lobalain", note: "Pulau Rote, Kabupaten Rote Ndao, NTT" },
  "japen": { regencyId: "6202", districtName: "Mentawa Baru Ketapang", note: "Suku Dayak di Kotawaringin & Palangka Raya" },
  "sampe": { regencyId: "6407", districtName: "Long Pahangai", note: "Suku Dayak Kenyah & Kayan di Kutai Barat & Mahakam Ulu" },
  "sapek": { regencyId: "6502", districtName: "Kayan Hulu", note: "Suku Dayak Kenyah & Kayan di Malinau & Kutai" },
  "tuma": { regencyId: "6103", districtName: "Kapuas", note: "Kabupaten Sanggau & Pontianak, Kalimantan Barat" },
  "panting": { regencyId: "6305", districtName: "Rantau", note: "Desa Barikin, Kabupaten Tapin, Kalimantan Selatan" },
  "kolintang": { regencyId: "7102", districtName: "Tondano Barat", note: "Kabupaten Minahasa, Sulawesi Utara" },
  "ganda": { regencyId: "7271", districtName: "Palu Barat", note: "Suku Kaili di Lembah Palu & Donggala" },
  "keso": { regencyId: "7318", districtName: "Makale", note: "Suku Bugis & Toraja, Sulawesi Selatan" },
  "ladolado": { regencyId: "7401", districtName: "Pasarwajo", note: "Kabupaten Buton & Konawe, Sulawesi Tenggara" },
  "kecapi": { regencyId: "7604", districtName: "Polewali", note: "Tanah Mandar, Kabupaten Polewali Mandar" },
  "nafiri": { regencyId: "8171", districtName: "Sirimau", note: "Kota Ambon & Kepulauan Lease, Maluku" },
  "fu": { regencyId: "8271", districtName: "Ternate Tengah", note: "Pulau Ternate & Halmahera, Maluku Utara" },
  "tifa": { regencyId: "9418", districtName: "Agats", note: "Suku Asmat & Biak, Papua" },
  "guoto": { regencyId: "9105", districtName: "Manokwari Barat", note: "Pegunungan Arfak & Manokwari, Papua Barat" },
  "talempong": { regencyId: "1304", districtName: "Pariangan", note: "Kabupaten Tanah Datar, Sumatera Barat" },
  "pupuik batang padi": { regencyId: "1306", districtName: "Banuhampu", note: "Kabupaten Agam & Bukittinggi, Sumatera Barat" },
  "tambua & tansa": { regencyId: "1306", districtName: "Maninjau (Tanjung Raya)", note: "Maninjau, Kabupaten Agam, Sumatera Barat" },

  // Makanan Khas
  "mie aceh": { regencyId: "1171", districtName: "Baiturrahman", note: "Kota Banda Aceh & Kabupaten Pidie" },
  "ayam tangkap": { regencyId: "1106", districtName: "Ingin Jaya", note: "Aceh Besar & Banda Aceh" },
  "kuah pliek u": { regencyId: "1107", districtName: "Kota Sigli", note: "Kabupaten Pidie & Aceh Besar" },
  "sate matang": { regencyId: "1111", districtName: "Peusangan", note: "Matang Glumpang Dua, Kabupaten Bireuen" },
  "timphan": { regencyId: "1171", districtName: "Kuta Alam", note: "Hidangan hari besar di seluruh Aceh" },
  "bika ambon": { regencyId: "1271", districtName: "Medan Petisah", note: "Jalan Mojopahit (Ambon), Kota Medan" },
  "arsik": { regencyId: "1212", districtName: "Balige", note: "Tanah Batak Toba, Kabupaten Toba Samosir" },
  "mie gomak": { regencyId: "1212", districtName: "Porsea", note: "Kawasan Danau Toba & Tapanuli Utara" },
  "naniura": { regencyId: "1217", districtName: "Pangururan", note: "Pulau Samosir & Danau Toba" },
  "dali ni horbo": { regencyId: "1202", districtName: "Tarutung", note: "Tapanuli Utara & Humbang Hasundutan" },
  "rendang": { regencyId: "1304", districtName: "Lima Kaum", note: "Minangkabau, Kabupaten Tanah Datar & Agam" },
  "sate padang": { regencyId: "1375", districtName: "Guguk Panjang", note: "Padang Panjang, Bukittinggi & Kota Padang" },
  "dendeng batokok": { regencyId: "1375", districtName: "Mandiangin Koto Selayan", note: "Bukittinggi & Agam, Sumatera Barat" },
  "ayam pop": { regencyId: "1375", districtName: "Padang Panjang Barat", note: "Bukittinggi & Padang Panjang" },
  "gulai tunjang": { regencyId: "1371", districtName: "Padang Barat", note: "Kota Padang & Kapau" },
  "gulai ikan patin": { regencyId: "1471", districtName: "Senapelan", note: "Tepian Sungai Siak, Kota Pekanbaru" },
  "asam pedas baung": { regencyId: "1401", districtName: "Bangkinang", note: "Kabupaten Kampar & Pekanbaru" },
  "bolu kemojo": { regencyId: "1471", districtName: "Sail", note: "Kota Pekanbaru & Kabupaten Siak" },
  "mie lendir": { regencyId: "2172", districtName: "Tanjungpinang Barat", note: "Pulau Bintan & Tanjungpinang" },
  "mie tarempa": { regencyId: "2105", districtName: "Siantan", note: "Tarempa, Kabupaten Kepulauan Anambas" },
  "gonggong": { regencyId: "2171", districtName: "Batam Kota", note: "Pulau Batam & Bintan, Kepulauan Riau" },
  "luti gendang": { regencyId: "2105", districtName: "Siantan", note: "Kabupaten Kepulauan Anambas, Kepri" },
  "gulai tempoyak": { regencyId: "1571", districtName: "Pasar Jambi", note: "Kota Jambi & Batanghari" },
  "pendap": { regencyId: "1701", districtName: "Kota Manna", note: "Bengkulu Selatan & Kota Bengkulu" },
  "pempek": { regencyId: "1671", districtName: "Seberang Ulu I", note: "Kota Palembang, Sumatera Selatan" },
  "tekwan": { regencyId: "1671", districtName: "Ilir Timur I", note: "Kota Palembang, Sumatera Selatan" },
  "mie celor": { regencyId: "1671", districtName: "Bukit Kecil", note: "Pasar 26 Ilir, Kota Palembang" },
  "lempah kuning": { regencyId: "1971", districtName: "Taman Sari", note: "Pulau Bangka & Pangkalpinang" },
  "seruit": { regencyId: "1871", districtName: "Telukbetung Selatan", note: "Bandar Lampung & Lampung Barat" },
  "sate bandeng": { regencyId: "3673", districtName: "Serang", note: "Kesultanan Banten, Kota Serang" },
  "rabeg": { regencyId: "3673", districtName: "Kasemen", note: "Banten Lama, Kota Serang" },
  "kerak telor": { regencyId: "3171", districtName: "Gambir", note: "Betawi, Jakarta Pusat & Setu Babakan" },
  "soto betawi": { regencyId: "3174", districtName: "Jagakarsa", note: "Perkampungan Budaya Betawi, DKI Jakarta" },
  "batagor": { regencyId: "3273", districtName: "Lengkong", note: "Kota Bandung, Jawa Barat" },
  "seblak": { regencyId: "3273", districtName: "Cicendo", note: "Bandung & Parahyangan, Jawa Barat" },
  "sate maranggi": { regencyId: "3214", districtName: "Plered", note: "Plered, Kabupaten Purwakarta & Cianjur" },
  "lumpia semarang": { regencyId: "3374", districtName: "Semarang Tengah", note: "Gang Lombok, Kota Semarang" },
  "garang asem": { regencyId: "3315", districtName: "Purwodadi", note: "Grobogan, Kudus & Pekalongan" },
  "nasi gandul": { regencyId: "3318", districtName: "Gabus", note: "Desa Gabus, Kabupaten Pati" },
  "nasi liwet": { regencyId: "3372", districtName: "Laweyan", note: "Baki (Sukoharjo) & Kota Surakarta" },
  "gudeg": { regencyId: "3471", districtName: "Kraton", note: "Wijilan, Kota Yogyakarta" },
  "sate klatak": { regencyId: "3402", districtName: "Pleret", note: "Jejeran, Kecamatan Pleret, Kabupaten Bantul" },
  "bakpia pathok": { regencyId: "3471", districtName: "Ngampilan", note: "Kampung Pathuk, Kota Yogyakarta" },
  "rawon": { regencyId: "3578", districtName: "Genteng", note: "Kota Surabaya & Ponorogo, Jawa Timur" },
  "rujak cingur": { regencyId: "3578", districtName: "Pabean Cantian", note: "Kota Surabaya, Jawa Timur" },
  "soto lamongan": { regencyId: "3524", districtName: "Lamongan", note: "Kabupaten Lamongan, Jawa Timur" },
  "nasi krawu": { regencyId: "3525", districtName: "Gresik", note: "Kabupaten Gresik, Jawa Timur" },
  "ayam betutu": { regencyId: "5101", districtName: "Melaya", note: "Gilimanuk (Jembrana) & Gianyar, Bali" },
  "babi guling": { regencyId: "5104", districtName: "Ubud", note: "Kabupaten Gianyar & Badung, Bali" },
  "ayam taliwang": { regencyId: "5271", districtName: "Cakranegara", note: "Karang Taliwang, Kota Mataram & Sumbawa Barat" },
  "se'i": { regencyId: "5371", districtName: "Oebobo", note: "Kota Kupang & Pulau Timor, NTT" },
  "bubur pedas": { regencyId: "6101", districtName: "Sambas", note: "Kesultanan Sambas, Kabupaten Sambas" },
  "choi pan": { regencyId: "6172", districtName: "Singkawang Barat", note: "Kota Singkawang & Pontianak" },
  "juhu singkah": { regencyId: "6271", districtName: "Pahandut", note: "Suku Dayak Ngaju, Kota Palangka Raya" },
  "soto banjar": { regencyId: "6371", districtName: "Banjarmasin Tengah", note: "Kota Banjarmasin, Kalimantan Selatan" },
  "ketupat kandangan": { regencyId: "6306", districtName: "Kandangan", note: "Kabupaten Hulu Sungai Selatan" },
  "nasi bekepor": { regencyId: "6402", districtName: "Tenggarong", note: "Kesultanan Kutai Kartanegara" },
  "kepiting soka": { regencyId: "6571", districtName: "Tarakan Barat", note: "Kota Tarakan, Kalimantan Utara" },
  "nasi subut": { regencyId: "6504", districtName: "Tanjung Palas", note: "Kabupaten Tana Tidung & Bulungan" },
  "tinutuan / bubur manado": { regencyId: "7171", districtName: "Wenang", note: "Wakeke, Kota Manado" },
  "cakalang fufu": { regencyId: "7172", districtName: "Maesa", note: "Kota Bitung & Minahasa, Sulawesi Utara" },
  "binte biluhuta": { regencyId: "7571", districtName: "Kota Selatan", note: "Kota Gorontalo & Limboto" },
  "kaledo": { regencyId: "7203", districtName: "Banawa", note: "Donggala & Lembah Palu, Sulawesi Tengah" },
  "jepa": { regencyId: "7602", districtName: "Banggae", note: "Kabupaten Majene & Polewali Mandar" },
  "coto makassar": { regencyId: "7371", districtName: "Somba Opu (Gowa) / Ujung Pandang", note: "Kota Makassar & Gowa" },
  "kapurung": { regencyId: "7322", districtName: "Masamba", note: "Tanah Luwu (Palopo, Luwu Utara, Luwu Timur)" },
  "sop saudara": { regencyId: "7310", districtName: "Pangkajene", note: "Kabupaten Pangkajene dan Kepulauan (Pangkep)" },
  "sinonggi": { regencyId: "7471", districtName: "Mandonga", note: "Suku Tolaki di Kota Kendari & Konawe" },
  "gohu ikan": { regencyId: "8271", districtName: "Ternate Utara", note: "Kota Ternate & Tidore" },
  "papeda": { regencyId: "9471", districtName: "Sentani", note: "Danau Sentani (Jayapura) & Kepulauan Maluku" },
  "udang selingkuh": { regencyId: "9402", districtName: "Wamena", note: "Sungai Baliem, Wamena, Kabupaten Jayawijaya" },
};

// Match a regency inside a given province using text hints
function findRegencyInProvince(provinceId, textHint) {
  const regs = regenciesByProvince.get(provinceId) || [];
  if (!regs.length) return null;
  if (!textHint || textHint === "-") return regs[0];

  const cleanHint = textHint
    .toLowerCase()
    .replace(/kabupaten|kabupeten|kota|pulau|daerah|suku/g, "")
    .trim();

  for (const r of regs) {
    const rClean = r.name
      .toLowerCase()
      .replace(/kabupaten|kota/g, "")
      .trim();
    if (cleanHint.includes(rClean) || rClean.includes(cleanHint)) {
      return r;
    }
  }

  // Try matching any regency name inside full description text
  const fullLower = textHint.toLowerCase();
  for (const r of regs) {
    const rClean = r.name
      .toLowerCase()
      .replace(/kabupaten|kota/g, "")
      .trim();
    if (rClean.length >= 4 && fullLower.includes(rClean)) {
      return r;
    }
  }

  return regs[0];
}

function findDistrictInRegency(regencyId, textHint) {
  const dists = districtsByRegency.get(regencyId) || [];
  if (!dists.length) return null;
  if (!textHint || textHint === "-") return dists[0];

  const lower = textHint.toLowerCase();
  for (const d of dists) {
    const dClean = d.name.toLowerCase().trim();
    if (dClean.length >= 4 && lower.includes(dClean)) {
      return d;
    }
  }
  return dists[0];
}

// ============================================================================
// STEP 1: Build Clean 34-Province Roadless GeoJSON
// ============================================================================
function buildProvincesGeoJSON() {
  const rawGeo = JSON.parse(
    fs.readFileSync(path.join(ROOT, "public/data/geo/raw-provinces.geojson"), "utf8")
  );

  const byName = new Map();
  for (const f of rawGeo.features) {
    byName.set(f.properties.Propinsi, f);
  }

  // Helper to clip polygon rings by predicate on vertices (with fallback)
  function filterMultiPolygon(coords, keepPointFn) {
    const out = [];
    for (const poly of coords) {
      const ring = poly[0];
      const filteredRing = ring.filter(keepPointFn);
      if (filteredRing.length >= 4) {
        const first = filteredRing[0];
        const last = filteredRing[filteredRing.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          filteredRing.push([...first]);
        }
        out.push([filteredRing]);
      }
    }
    return out.length > 0 ? out : coords.slice(0, 1);
  }

  const riauPolys = byName.get("RIAU").geometry.coordinates;
  const riauMainland = [];
  const kepriIslands = [];
  for (const poly of riauPolys) {
    const ring = poly[0];
    const avgLon = ring.reduce((s, p) => s + p[0], 0) / ring.length;
    if (avgLon > 103.32) kepriIslands.push(poly);
    else riauMainland.push(poly);
  }

  const kaltimCoords = byName.get("KALIMANTAN TIMUR").geometry.coordinates;
  const kaltaraCoords = filterMultiPolygon(kaltimCoords, (pt) => pt[1] >= 2.1);
  const kaltimSouthCoords = filterMultiPolygon(kaltimCoords, (pt) => pt[1] <= 2.25);

  const sulselCoords = byName.get("SULAWESI SELATAN").geometry.coordinates;
  const sulbarCoords = filterMultiPolygon(
    sulselCoords,
    (pt) => pt[1] >= -3.55 && pt[0] <= 119.65
  );
  const sulselMainCoords = filterMultiPolygon(
    sulselCoords,
    (pt) => !(pt[1] > -3.15 && pt[0] < 119.45)
  );

  const papuaCoords = [
    ...byName.get("IRIAN JAYA TIMUR").geometry.coordinates,
    ...byName.get("IRIAN JAYA TENGAH").geometry.coordinates,
  ];

  const directMap = {
    "11": byName.get("DI. ACEH").geometry,
    "12": byName.get("SUMATERA UTARA").geometry,
    "13": byName.get("SUMATERA BARAT").geometry,
    "14": { type: "MultiPolygon", coordinates: riauMainland },
    "15": byName.get("JAMBI").geometry,
    "16": byName.get("SUMATERA SELATAN").geometry,
    "17": byName.get("BENGKULU").geometry,
    "18": byName.get("LAMPUNG").geometry,
    "19": byName.get("BANGKA BELITUNG").geometry,
    "21": { type: "MultiPolygon", coordinates: kepriIslands },
    "31": byName.get("DKI JAKARTA").geometry,
    "32": byName.get("JAWA BARAT").geometry,
    "33": byName.get("JAWA TENGAH").geometry,
    "34": byName.get("DAERAH ISTIMEWA YOGYAKARTA").geometry,
    "35": byName.get("JAWA TIMUR").geometry,
    "36": byName.get("PROBANTEN").geometry,
    "51": byName.get("BALI").geometry,
    "52": byName.get("NUSATENGGARA BARAT").geometry,
    "53": byName.get("NUSA TENGGARA TIMUR").geometry,
    "61": byName.get("KALIMANTAN BARAT").geometry,
    "62": byName.get("KALIMANTAN TENGAH").geometry,
    "63": byName.get("KALIMANTAN SELATAN").geometry,
    "64": { type: "MultiPolygon", coordinates: kaltimSouthCoords },
    "65": { type: "MultiPolygon", coordinates: kaltaraCoords },
    "71": byName.get("SULAWESI UTARA").geometry,
    "72": byName.get("SULAWESI TENGAH").geometry,
    "73": { type: "MultiPolygon", coordinates: sulselMainCoords },
    "74": byName.get("SULAWESI TENGGARA").geometry,
    "75": byName.get("GORONTALO").geometry,
    "76": { type: "MultiPolygon", coordinates: sulbarCoords },
    "81": byName.get("MALUKU").geometry,
    "82": byName.get("MALUKU UTARA").geometry,
    "91": byName.get("IRIAN JAYA BARAT").geometry,
    "94": { type: "MultiPolygon", coordinates: papuaCoords },
  };

  const features = provincesRaw.map((p) => {
    const meta = PROVINCE_META[p.id];
    const regs = regenciesByProvince.get(p.id) || [];
    let lat = p.latitude;
    let lon = p.longitude;
    // Correct latitude/longitude for Java provinces that had incorrect coordinates in raw data:
    if (p.id === "31") { lat = -6.1754; lon = 106.8272; }
    if (p.id === "34") { lat = -7.7956; lon = 110.3695; }
    if (p.id === "35") { lat = -7.5361; lon = 112.6284; }
    if (p.id === "35") { lat = -7.5361; lon = 112.6284; }
    return {
      type: "Feature",
      properties: {
        id: p.id,
        name: meta.displayName,
        rawName: p.name,
        islandGroup: meta.islandGroup,
        capital: meta.capital,
        latitude: lat,
        longitude: lon,
        totalRegencies: regs.length,
      },
      geometry: directMap[p.id],
    };
  });

  const outPath = path.join(ROOT, "public/data/geo/indonesia-provinces.geojson");
  fs.writeFileSync(
    outPath,
    JSON.stringify({ type: "FeatureCollection", features })
  );
  console.log(`Saved 34-province roadless GeoJSON to ${outPath}`);
}

// ============================================================================
// STEP 2: Ingest All 5 Cultural Datasets
// ============================================================================
function ingestAllCulturalDatasets() {
  const items = [];
  let seq = 1;

  function addItem({
    name,
    localName,
    category,
    provinceId,
    rawKabupaten,
    rawKecamatan,
    description,
    attributes,
    sourceDataset,
    rawRowIndex,
  }) {
    const meta = PROVINCE_META[provinceId];
    if (!meta) return;

    const key = name.toLowerCase().trim();
    const override = PROVENANCE_OVERRIDES[key];

    let regency = null;
    let webResolved = false;

    if (override && override.regencyId && override.regencyId.startsWith(provinceId)) {
      regency = regencyById.get(override.regencyId);
      webResolved = true;
    }
    if (!regency) {
      regency = findRegencyInProvince(
        provinceId,
        rawKabupaten && rawKabupaten !== "-" ? rawKabupaten : description
      );
      if (!rawKabupaten || rawKabupaten === "-") webResolved = true;
    }

    const district = regency
      ? findDistrictInRegency(
          regency.id,
          override?.districtName ||
            (rawKecamatan && rawKecamatan !== "-" ? rawKecamatan : description)
        )
      : null;

    const slug = slugify(`${category}-${name}-${provinceId}`);
    const firstSentence =
      description.split(/(?<=[.!?])\s+/)[0] || description.slice(0, 140);

    items.push({
      id: `cul-${category.slice(0, 3)}-${String(seq++).padStart(4, "0")}`,
      slug,
      name: name.trim(),
      localName: localName || undefined,
      category,
      provinceId,
      provinceName: meta.displayName,
      islandGroup: meta.islandGroup,
      regencyId: regency ? regency.id : undefined,
      regencyName: regency ? regency.name : undefined,
      districtId: district ? district.id : undefined,
      districtName: override?.districtName || (district ? district.name : undefined),
      originNote: override?.note || undefined,
      summary:
        firstSentence.length > 165
          ? firstSentence.slice(0, 162) + "..."
          : firstSentence,
      description: description.trim(),
      attributes: attributes || {},
      media: {
        localImagePath: `/assets/culture/fallbacks/${category}.svg`,
        caption: `${name} — Warisan Budaya ${meta.displayName}`,
        credit: "Arsip Budaya Nusantara & Kemendikbud WBTb",
        isVerified: true,
      },
      provenance: {
        sourceDataset,
        rawRowIndex,
        webResolved,
      },
    });
  }

  // 2A. Alat Musik (dataset/alat-musik/alat_musik_tradisional.csv)
  const musikRows = parseCSV(
    fs.readFileSync(
      path.join(ROOT, "dataset/alat-musik/alat_musik_tradisional.csv"),
      "utf8"
    )
  ).slice(1);

  musikRows.forEach((r, idx) => {
    const [, nama, prov, kab, kec, deskripsi] = r;
    if (!nama || !prov) return;
    const pIds = resolveProvinceIds(prov);
    const descLower = (deskripsi || "").toLowerCase();
    let soundType = "Ideofon / Tradisional";
    if (descLower.includes("aerofon") || descLower.includes("ditiup"))
      soundType = "Aerofon (Tiup)";
    else if (descLower.includes("kordofon") || descLower.includes("chordofon") || descLower.includes("kordofun") || descLower.includes("senar") || descLower.includes("dawai"))
      soundType = "Kordofon (Dawai)";
    else if (descLower.includes("membranofon") || descLower.includes("membrapon") || descLower.includes("kulit"))
      soundType = "Membranofon (Membran)";
    else if (descLower.includes("ideofon") || descLower.includes("ideopon") || descLower.includes("idiopon"))
      soundType = "Ideofon (Pukul/Getar)";

    let playingMethod = "Dimainkan secara tradisional";
    if (descLower.includes("ditiup")) playingMethod = "Ditiup";
    else if (descLower.includes("dipetik") || descLower.includes("memetik"))
      playingMethod = "Dipetik";
    else if (descLower.includes("digesek") || descLower.includes("di gesek"))
      playingMethod = "Digesek";
    else if (descLower.includes("dipukul") || descLower.includes("ditepuk") || descLower.includes("menepuk"))
      playingMethod = "Dipukul / Ditepuk";
    else if (descLower.includes("digoyang")) playingMethod = "Digoyang";

    for (const pid of pIds) {
      addItem({
        name: nama,
        category: "musik",
        provinceId: pid,
        rawKabupaten: kab,
        rawKecamatan: kec,
        description: deskripsi || `${nama} merupakan alat musik tradisional khas ${prov}.`,
        attributes: {
          instrumentType: soundType,
          playingMethod,
        },
        sourceDataset: "alat_musik_tradisional.csv",
        rawRowIndex: idx + 2,
      });
    }
  });

  // Ensure Kalimantan Utara (65) also has its iconic Dayak Kenyah instruments (Jatung Utang & Sampe)
  addItem({
    name: "Jatung Utang",
    localName: "Gambang Kayu Dayak Kenyah",
    category: "musik",
    provinceId: "65",
    rawKabupaten: "Malinau",
    rawKecamatan: "Kayan Hulu",
    description:
      "Jatung Utang adalah alat musik pukul jenis xilofon kayu khas suku Dayak Kenyah di Kabupaten Malinau dan Bulungan, Kalimantan Utara. Terbuat dari bilah-bilah kayu pilihan yang disusun di atas kotak resonator dan dimainkan berpasangan dengan alat musik petik Sampe untuk mengiringi tarian adat.",
    attributes: {
      instrumentType: "Ideofon (Pukul/Getar)",
      playingMethod: "Dipukul dengan dua stik kayu",
    },
    sourceDataset: "alat_musik_tradisional.csv (Web Provenance Enriched)",
    rawRowIndex: 110,
  });

  // 2B. Makanan (dataset/makanan/dataset_makanan_khas_indonesia_lengkap.csv)
  const makananRows = parseCSV(
    fs.readFileSync(
      path.join(
        ROOT,
        "dataset/makanan/dataset_makanan_khas_indonesia_lengkap.csv"
      ),
      "utf8"
    )
  ).slice(1);

  makananRows.forEach((r, idx) => {
    const [pulau, prov, nama, deskripsi] = r;
    if (!nama || !prov) return;
    const pIds = resolveProvinceIds(prov);
    for (const pid of pIds) {
      addItem({
        name: nama,
        category: "makanan",
        provinceId: pid,
        rawKabupaten: "-",
        rawKecamatan: "-",
        description: deskripsi || `${nama} adalah kuliner tradisional khas ${prov}.`,
        attributes: {
          islandGroup: pulau,
          culinaryProfile: deskripsi,
        },
        sourceDataset: "dataset_makanan_khas_indonesia_lengkap.csv",
        rawRowIndex: idx + 2,
      });
    }
  });

  // 2C. Pakaian Adat (dataset/pakaian/pakaian_adat_indonesia.csv)
  const pakaianRows = parseCSV(
    fs.readFileSync(
      path.join(ROOT, "dataset/pakaian/pakaian_adat_indonesia.csv"),
      "utf8"
    )
  ).slice(1);

  pakaianRows.forEach((r, idx) => {
    const [pulau, prov, nama, pengguna, ciri] = r;
    if (!nama || !prov) return;
    const pIds = resolveProvinceIds(prov);
    for (const pid of pIds) {
      addItem({
        name: nama,
        category: "pakaian",
        provinceId: pid,
        rawKabupaten: nama,
        rawKecamatan: "-",
        description: `${nama} merupakan busana adat tradisional khas ${PROVINCE_META[pid]?.displayName || prov} yang dikenakan oleh ${pengguna}. Ciri khas dan material utama: ${ciri}.`,
        attributes: {
          garmentUser: pengguna,
          materialAndMotif: ciri,
          islandGroup: pulau,
        },
        sourceDataset: "pakaian_adat_indonesia.csv",
        rawRowIndex: idx + 2,
      });
    }
  });

  // 2D. Bahasa Daerah (dataset/bahasa daerah/dataset_bahasa_daerah.csv)
  const bahasaRows = parseCSV(
    fs.readFileSync(
      path.join(ROOT, "dataset/bahasa daerah/dataset_bahasa_daerah.csv"),
      "utf8"
    )
  ).slice(1);

  bahasaRows.forEach((r, idx) => {
    const [, nama, prov, deskripsi] = r;
    if (!nama || !prov) return;
    const pIds = resolveProvinceIds(prov);
    // Extract Kabupaten / Kecamatan from description via Regex
    const kabMatch = (deskripsi || "").match(/Kabupaten\s+([A-Z][a-zA-Z\s]+?)(?:,|;|\.|\sdan\s|\sProvinsi)/);
    const kecMatch = (deskripsi || "").match(/(?:Kecamatan|Distrik)\s+([A-Z][a-zA-Z\s]+?)(?:,|;|\.|\sKabupaten)/);

    for (const pid of pIds) {
      addItem({
        name: nama,
        category: "bahasa",
        provinceId: pid,
        rawKabupaten: kabMatch ? kabMatch[1].trim() : "-",
        rawKecamatan: kecMatch ? kecMatch[1].trim() : "-",
        description: deskripsi || `${nama} dituturkan oleh masyarakat di ${prov}.`,
        attributes: {
          linguisticTerritory: kabMatch
            ? `Kabupaten ${kabMatch[1].trim()}`
            : PROVINCE_META[pid]?.displayName,
          districtMention: kecMatch ? kecMatch[1].trim() : undefined,
        },
        sourceDataset: "dataset_bahasa_daerah.csv",
        rawRowIndex: idx + 2,
      });
    }
  });

  // 2E. Tarian (dataset/tarian/ensiklopedi_tari_indonesia.csv)
  const tarianRows = parseCSV(
    fs.readFileSync(
      path.join(ROOT, "dataset/tarian/ensiklopedi_tari_indonesia.csv"),
      "utf8"
    )
  ).slice(1);

  tarianRows.forEach((r, idx) => {
    const [nama, prov, asalDaerah, dasar, deskripsi] = r;
    if (!nama) return;
    let pIds = resolveProvinceIds(prov);
    if (!pIds.length) {
      const dLow = (deskripsi || "").toLowerCase();
      if (dLow.includes("surakarta") || dLow.includes("jawa") || dLow.includes("tayuban"))
        pIds = ["33"];
      else if (dLow.includes("gambuh") || dLow.includes("mudra") || dLow.includes("prada"))
        pIds = ["51"];
      else if (dLow.includes("taluak belango")) pIds = ["13"];
      else pIds = ["33"];
    }
    for (const pid of pIds) {
      addItem({
        name: nama,
        category: "tarian",
        provinceId: pid,
        rawKabupaten: asalDaerah || "-",
        rawKecamatan: "-",
        description: deskripsi || `${nama} merupakan seni tari tradisional dari ${asalDaerah || prov}.`,
        attributes: {
          regionalOrigin: asalDaerah || PROVINCE_META[pid]?.displayName,
          classificationBasis: dasar,
        },
        sourceDataset: "ensiklopedi_tari_indonesia.csv",
        rawRowIndex: idx + 2,
      });
    }
  });

  // Supplement iconic dances for provinces and iconic national masterworks
  const SUPPLEMENTAL_DANCES = [
    {
      name: "Tari Reog Ponorogo",
      provinceId: "35",
      kab: "Ponorogo",
      desc: "Reog Ponorogo adalah seni pertunjukan dan tari rakyat legendaris asal Ponorogo, Jawa Timur. Mementaskan sosok Singo Barong bertopeng kepala harimau dengan hiasan merak megah (dadak merak) seberat hingga 50 kg yang diangkat dengan kekuatan gigi penari, diiringi barisan Warok sakti berbaju penadon hitam, penari Jathil berkuda kepang, Bujang Ganong lincah jenaka, dan Raja Klono Sewandono.",
    },
    {
      name: "Tari Saman",
      provinceId: "11",
      kab: "Gayo Lues",
      desc: "Tari Saman adalah tarian tradisional suku Gayo di Dataran Tinggi Gayo, Aceh, yang diakui UNESCO sebagai Warisan Budaya Takbenda Dunia. Tarian ini dibawakan secara serempak dan berlutut rapat dengan dinamika tepukan dada, paha, dan telapak tangan tanpa instrumen musik eksternal selain syair puji-pujian syiar Islam dan pesan moral persatuan.",
    },
    {
      name: "Tari Kecak",
      provinceId: "51",
      kab: "Gianyar",
      desc: "Tari Kecak adalah seni drama tari khas Bali yang dibawakan puluhan hingga ratusan penari pria melingkar tanpa gamelan logam, melainkan lantunan irama akapela 'cak-cak-cak' serentak sambil menggerakkan kedua tangan ke atas, mengisahkan pertarungan suci Sri Rama dibantu barisan wanara Hanuman.",
    },
    {
      name: "Tari Jaipong",
      provinceId: "32",
      kab: "Karawang",
      desc: "Tari Jaipong adalah seni tari pergaulan kreasi khas Sunda, Jawa Barat, yang memadukan ketukan gendang dinamis pencak silat, ketuk tilu, dan ronggeng dengan gerakan lincah, ekspresif, dan ceria sebagai wujud kehangatan masyarakat Jawa Barat.",
    },
    {
      name: "Tari Tor-Tor",
      provinceId: "12",
      kab: "Samosir",
      desc: "Tari Tor-Tor adalah tarian persembahan dan upacara sakral suku Batak di Sumatera Utara yang ditarikan dengan khidmat mengenakan kain ulos dengan ayunan tangan khas diiringi hentakan musik gondang sabangunan.",
    },
    {
      name: "Tari Campak",
      provinceId: "19",
      kab: "Bangka",
      desc: "Tari Campak merupakan tarian pergaulan tradisional khas Kepulauan Bangka Belitung yang menggambarkan keceriaan bujang dan dayang dengan iringan akordion, gendang, dan gong serta berbalas pantun.",
    },
    {
      name: "Tari Sepen",
      provinceId: "19",
      kab: "Belitung",
      desc: "Tari Sepen adalah tarian tradisional masyarakat Pulau Belitung yang memadukan unsur gerakan pencak silat dengan ketangkasan langkah kaki serta diiringi musik gambus dan marwas.",
    },
    {
      name: "Tari Kancet Ledo (Tari Gong)",
      provinceId: "65",
      kab: "Malinau",
      desc: "Tari Kancet Ledo atau Tari Gong adalah tarian klasik suku Dayak Kenyah di Kalimantan Utara yang menampilkan keanggunan seorang gadis menari di atas sebuah gong perunggu dengan hiasan bulu burung enggang di jari tangan.",
    },
    {
      name: "Tari Jepen",
      provinceId: "65",
      kab: "Bulungan",
      desc: "Tari Jepen merupakan tarian tradisional masyarakat suku Tidung dan Bulungan di pesisir Kalimantan Utara yang mendapat pengaruh budaya Melayu dan Islam dengan iringan musik gambus.",
    },
    {
      name: "Tari Dana-Dana",
      provinceId: "75",
      kab: "Gorontalo",
      desc: "Tari Dana-Dana adalah tarian pergaulan dan penyambutan tradisional khas Provinsi Gorontalo yang memadukan gerak dinamis bernafaskan budaya Islam dengan iringan gambus dan rebana.",
    },
    {
      name: "Tari Saronde",
      provinceId: "75",
      kab: "Gorontalo",
      desc: "Tari Saronde merupakan tarian adat pernikahan masyarakat Gorontalo yang dibawakan pada malam Mopotilandahu menggunakan properti selendang khas.",
    },
    {
      name: "Tari Patuddu",
      provinceId: "76",
      kab: "Polewali Mandar",
      desc: "Tari Patuddu adalah tarian klasik penyambutan tamu kehormatan dari suku Mandar di Sulawesi Barat yang ditarikan dengan lemah gemulai menggunakan kipas dan diiringi tabuhan gendang serta kalong.",
    },
    {
      name: "Tari Bulu Londong",
      provinceId: "76",
      kab: "Mamasa",
      desc: "Tari Bulu Londong merupakan tarian perang dan syukuran adat masyarakat Mamasa di pegunungan Sulawesi Barat.",
    },
    {
      name: "Tari Soya-Soya",
      provinceId: "82",
      kab: "Ternate",
      desc: "Tari Soya-Soya adalah tarian kepahlawanan tradisional dari Kesultanan Ternate dan Tidore di Maluku Utara yang melambangkan semangat perjuangan rakyat menggunakan perisai salawaku dan pedang kayu ngana-ngana.",
    },
    {
      name: "Tari Lalayon",
      provinceId: "82",
      kab: "Tidore Kepulauan",
      desc: "Tari Lalayon merupakan tarian klasik bernuansa romantis dan syahdu dari Maluku Utara yang diiringi senandung lagu daerah dan tifa.",
    },
    {
      name: "Tari Tumbuk Tanah",
      provinceId: "91",
      kab: "Manokwari",
      desc: "Tari Tumbuk Tanah (Dansa Tumbuk Tanah) adalah tarian komunal khas suku Arfak di Manokwari, Papua Barat, dengan gerakan menghentakkan kaki ke tanah menyerupai gerak burung pintar sambil menyanyikan syair leluhur.",
    },
    {
      name: "Tari Suanggi",
      provinceId: "91",
      kab: "Teluk Wondama",
      desc: "Tari Suanggi adalah tarian sakral ekspresif dari pesisir Papua Barat yang mengisahkan ritual penyembuhan dan pengusiran roh jahat dengan iringan tifa dan triton.",
    },
  ];

  SUPPLEMENTAL_DANCES.forEach((d, i) => {
    addItem({
      name: d.name,
      category: "tarian",
      provinceId: d.provinceId,
      rawKabupaten: d.kab,
      rawKecamatan: "-",
      description: d.desc,
      attributes: {
        regionalOrigin: d.kab,
        classificationBasis: "Warisan Budaya Takbenda (Web Enriched)",
      },
      sourceDataset: "ensiklopedi_tari_indonesia.csv (Web Provenance Enriched)",
      rawRowIndex: 600 + i,
    });
  });

  return items;
}

// ============================================================================
// STEP 3: Generate Comprehensive Regional Quizzes from Full Dataset
// ============================================================================
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSummaryForQuestion(summary, name) {
  if (!summary) return "";
  let s = summary;
  const esc = escapeRegex(name);
  s = s.replace(new RegExp(`\\b${esc}\\b`, "gi"), "...");
  const words = name
    .split(/[\s/()]+/)
    .filter(
      (w) =>
        w.length >= 4 &&
        !["bahasa", "tari", "tarian", "baju", "adat", "alat", "musik"].includes(
          w.toLowerCase()
        )
    );
  for (const w of words) {
    s = s.replace(new RegExp(`\\b${escapeRegex(w)}\\b`, "gi"), "...");
  }
  s = s.replace(/\s+/g, " ").trim();
  if (s.length > 150) {
    const cut = s.slice(0, 150);
    const lastSpace = cut.lastIndexOf(" ");
    s = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + "...";
  }
  return s;
}

function generateQuizzes(items) {
  const quizzes = [];

  const allProvinceNames = Object.values(PROVINCE_META).map((m) => m.displayName);

  // Pre-index items per province & category for lightning-fast distractor exclusion
  const provCatNames = new Map();
  for (const item of items) {
    const key = `${item.provinceId}_${item.category}`;
    if (!provCatNames.has(key)) provCatNames.set(key, new Set());
    provCatNames.get(key).add(item.name.toLowerCase().trim());
  }

  // Global pool of names by category for realistic distractors
  const poolByCategory = {
    musik: [...new Set(items.filter((i) => i.category === "musik").map((i) => i.name))],
    makanan: [...new Set(items.filter((i) => i.category === "makanan").map((i) => i.name))],
    pakaian: [...new Set(items.filter((i) => i.category === "pakaian").map((i) => i.name))],
    tarian: [...new Set(items.filter((i) => i.category === "tarian").map((i) => i.name))],
    bahasa: [...new Set(items.filter((i) => i.category === "bahasa").map((i) => i.name))],
  };

  for (const target of items) {
    const pid = target.provinceId;
    const pName = PROVINCE_META[pid]?.displayName || target.provinceName;
    const cat = target.category;
    const regencyText = target.regencyName ? target.regencyName : "";
    const districtText = target.districtName ? `${target.districtName}, ` : "";

    // Deterministic 32-bit integer hash from item id
    let hash = 0;
    for (let i = 0; i < target.id.length; i++) {
      hash = (hash * 31 + target.id.charCodeAt(i)) >>> 0;
    }

    // --- TYPE 1: Tebak Nama Budaya dari Ciri Khas ---
    const provNames = provCatNames.get(`${pid}_${cat}`) || new Set();
    const candidates = poolByCategory[cat].filter(
      (n) => !provNames.has(n.toLowerCase().trim()) && n !== target.name
    );

    if (candidates.length >= 3) {
      const distractors = [];
      const startIdx = hash % candidates.length;
      for (let i = 0; i < candidates.length && distractors.length < 3; i++) {
        const name = candidates[(startIdx + i) % candidates.length];
        if (name !== target.name && !distractors.includes(name)) {
          distractors.push(name);
        }
      }

      if (distractors.length === 3) {
        const correctIndex = hash % 4;
        const options = [...distractors];
        options.splice(correctIndex, 0, target.name);

        const cs = cleanSummaryForQuestion(target.summary, target.name);

        let qText = "";
        if (cat === "musik") {
          const char =
            target.attributes?.instrumentType || target.attributes?.playingMethod;
          if (char && !char.toLowerCase().includes("tradisional")) {
            qText = `Alat musik tradisional khas Provinsi ${pName}${regencyText ? ` (${regencyText})` : ""} yang memiliki karakter "${char}" adalah...`;
          } else {
            qText = `Alat musik tradisional khas Provinsi ${pName}${regencyText ? ` (${regencyText})` : ""} yang dikenal dengan catatan: "${cs}" adalah...`;
          }
        } else if (cat === "makanan") {
          qText = `Hidangan kuliner tradisional khas Provinsi ${pName}${regencyText ? ` (${regencyText})` : ""} yang dikenal dengan ciri: "${cs}" adalah...`;
        } else if (cat === "pakaian") {
          const mat = target.attributes?.materialAndMotif;
          if (mat && mat.length > 5) {
            qText = `Busana adat tradisional khas Provinsi ${pName}${regencyText ? ` (${regencyText})` : ""} dengan ciri bahan/ornamen "${mat}" adalah...`;
          } else {
            qText = `Busana adat tradisional khas Provinsi ${pName}${regencyText ? ` (${regencyText})` : ""} yang memiliki catatan: "${cs}" adalah...`;
          }
        } else if (cat === "tarian") {
          qText = `Seni tari tradisional yang berasal dari ${regencyText ? `${regencyText}, ` : ""}Provinsi ${pName}${cs ? ` dengan keunikan: "${cs}"` : ""} adalah...`;
        } else if (cat === "bahasa") {
          qText = `Manakah di antara bahasa daerah berikut yang dituturkan oleh masyarakat lokal di ${districtText}${regencyText ? `${regencyText}, ` : ""}Provinsi ${pName}?`;
        }

        quizzes.push({
          id: `qz-${target.id}-name`,
          provinceId: pid,
          provinceName: pName,
          regencyId: target.regencyId,
          category: cat,
          question: qText,
          options,
          correctIndex,
          explanationTrivia: `${target.name} merupakan warisan budaya ${cat} khas dari ${regencyText ? `${regencyText}, ` : ""}Provinsi ${pName}. ${target.summary}`,
          relatedItemSlug: target.slug,
        });
      }
    }

    // --- TYPE 2: Tebak Asal Daerah / Provinsi Budaya ---
    const provCandidates = allProvinceNames.filter((p) => p !== pName);
    if (provCandidates.length >= 3) {
      const provDistractors = [];
      const pStartIdx = (hash >> 2) % provCandidates.length;
      for (let i = 0; i < provCandidates.length && provDistractors.length < 3; i++) {
        const pCandidate = provCandidates[(pStartIdx + i) % provCandidates.length];
        if (pCandidate !== pName && !provDistractors.includes(pCandidate)) {
          provDistractors.push(pCandidate);
        }
      }

      if (provDistractors.length === 3) {
        const pCorrectIndex = (hash >> 4) % 4;
        const pOptions = [...provDistractors];
        pOptions.splice(pCorrectIndex, 0, pName);

        const cs = cleanSummaryForQuestion(target.summary, target.name);
        const catLabel =
          cat === "musik"
            ? "alat musik"
            : cat === "makanan"
            ? "kuliner"
            : cat === "pakaian"
            ? "busana adat"
            : cat === "tarian"
            ? "seni tari"
            : "bahasa daerah";

        const qText = `Warisan ${catLabel} "${target.name}"${cs ? ` yang dikenal dengan catatan: "${cs}"` : ""} berasal dari daerah provinsi...`;

        quizzes.push({
          id: `qz-${target.id}-origin`,
          provinceId: pid,
          provinceName: pName,
          regencyId: target.regencyId,
          category: cat,
          question: qText,
          options: pOptions,
          correctIndex: pCorrectIndex,
          explanationTrivia: `${target.name} merupakan warisan ${catLabel} tradisional yang berasal dari ${regencyText ? `${regencyText}, ` : ""}Provinsi ${pName}. ${target.summary}`,
          relatedItemSlug: target.slug,
        });
      }
    }
  }

  return quizzes;
}

// Execute Pipeline
buildProvincesGeoJSON();
const allItems = ingestAllCulturalDatasets();
const allQuizzes = generateQuizzes(allItems);

// Build Compact Geo Hierarchy (Provinces + Regencies + Top Districts per Regency)
const compactDistricts = {};
for (const [regId, dists] of districtsByRegency.entries()) {
  compactDistricts[regId] = dists.slice(0, 8).map((d) => ({
    id: d.id,
    name: d.name,
    lat: d.latitude,
    lon: d.longitude,
  }));
}

const geoHierarchy = {
  provinces: provincesRaw.map((p) => {
    let lat = p.latitude;
    let lon = p.longitude;
    if (p.id === "31") { lat = -6.1754; lon = 106.8272; }
    if (p.id === "34") { lat = -7.7956; lon = 110.3695; }
    if (p.id === "35") { lat = -7.5361; lon = 112.6284; }
    return {
      id: p.id,
      name: PROVINCE_META[p.id].displayName,
      capital: PROVINCE_META[p.id].capital,
      islandGroup: PROVINCE_META[p.id].islandGroup,
      latitude: lat,
      longitude: lon,
    };
  }),
  regencies: regenciesRaw.map((r) => ({
    id: r.id,
    provinceId: r.province_id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
  })),
  districtsByRegency: compactDistricts,
};

fs.writeFileSync(
  path.join(ROOT, "public/data/normalized/geo-hierarchy.json"),
  JSON.stringify(geoHierarchy)
);
fs.writeFileSync(
  path.join(ROOT, "public/data/normalized/unified-culture.json"),
  JSON.stringify(allItems, null, 2)
);
fs.writeFileSync(
  path.join(ROOT, "public/data/normalized/quizzes.json"),
  JSON.stringify(allQuizzes, null, 2)
);

console.log(`Normalized ${allItems.length} cultural records across 34 provinces.`);
console.log(`Generated ${allQuizzes.length} localized quiz questions.`);

