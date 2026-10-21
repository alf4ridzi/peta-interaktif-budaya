import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "public/data/normalized/unified-culture.json");
const items = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

const PALETTE_BY_CAT = {
  bahasa: { bg: "#f1ede4", border: "#3b4d7a", accent: "#2d3b63", badge: "BAHASA & AKSARA DAERAH" },
  musik: { bg: "#f4eee1", border: "#9c5a25", accent: "#7a4216", badge: "ALAT MUSIK TRADISIONAL" },
  makanan: { bg: "#f6ede2", border: "#a83e24", accent: "#872d17", badge: "KULINER KHAS NUSANTARA" },
  pakaian: { bg: "#f3ece6", border: "#6e2b4b", accent: "#541d37", badge: "BUSANA & WASTRA ADAT" },
  tarian: { bg: "#eef2ec", border: "#1e5e4e", accent: "#144538", badge: "SENI TARI TRADISIONAL" },
};

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateCustomSvgPlate(item) {
  const pal = PALETTE_BY_CAT[item.category] || PALETTE_BY_CAT.musik;
  const title = escapeXml(item.name.length > 34 ? item.name.slice(0, 32) + "…" : item.name);
  const sub = escapeXml(
    `${item.regencyName ? item.regencyName + " · " : ""}${item.provinceName}`
  );
  const metaLine = escapeXml(
    item.attributes?.instrumentType ||
      item.attributes?.garmentUser ||
      item.attributes?.regionalOrigin ||
      item.attributes?.linguisticTerritory ||
      item.islandGroup ||
      ""
  );

  const motifByCat = {
    musik: `<circle cx="400" cy="185" r="64" fill="none" stroke="${pal.border}" stroke-width="2.5"/>
            <circle cx="400" cy="185" r="24" fill="${pal.accent}" opacity="0.85"/>
            <circle cx="400" cy="185" r="8" fill="${pal.bg}"/>`,
    makanan: `<ellipse cx="400" cy="210" rx="85" ry="22" fill="none" stroke="${pal.border}" stroke-width="2.5"/>
              <path d="M335 202 L400 120 L465 202 Z" fill="${pal.accent}" opacity="0.8"/>`,
    pakaian: `<path d="M365 130 L325 155 L340 190 L365 178 L365 235 L435 235 L435 178 L460 190 L475 155 L435 130 Q400 148 365 130 Z" fill="none" stroke="${pal.border}" stroke-width="2.5"/>
              <line x1="400" y1="138" x2="400" y2="235" stroke="${pal.accent}" stroke-width="2"/>`,
    tarian: `<path d="M320 215 A80 80 0 0 1 480 215 Z" fill="none" stroke="${pal.border}" stroke-width="2.5"/>
             <line x1="400" y1="215" x2="345" y2="155" stroke="${pal.accent}" stroke-width="2"/>
             <line x1="400" y1="215" x2="400" y2="135" stroke="${pal.accent}" stroke-width="2.5"/>
             <line x1="400" y1="215" x2="455" y2="155" stroke="${pal.accent}" stroke-width="2"/>`,
    bahasa: `<rect x="310" y="140" width="180" height="90" rx="6" fill="none" stroke="${pal.border}" stroke-width="2.5"/>
             <path d="M335 175 C355 155, 375 195, 395 175 C415 155, 435 195, 465 175" fill="none" stroke="${pal.accent}" stroke-width="2.5"/>
             <line x1="335" y1="202" x2="465" y2="202" stroke="${pal.border}" stroke-width="1.5" opacity="0.6"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="${pal.bg}"/>
  <rect x="20" y="20" width="760" height="460" rx="8" fill="none" stroke="${pal.border}" stroke-width="1.5" opacity="0.45"/>
  <rect x="32" y="32" width="736" height="436" rx="4" fill="none" stroke="${pal.border}" stroke-width="0.75" stroke-dasharray="6 4" opacity="0.35"/>
  <text x="400" y="78" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="${pal.accent}" letter-spacing="3">${pal.badge}</text>
  ${motifByCat[item.category] || motifByCat.musik}
  <text x="400" y="315" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#221c16">${title}</text>
  <text x="400" y="352" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="${pal.accent}" letter-spacing="1">${sub}</text>
  <text x="400" y="388" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#63584e">${metaLine}</text>
  <line x1="320" y1="418" x2="480" y2="418" stroke="${pal.border}" stroke-width="1" opacity="0.4"/>
  <text x="400" y="442" text-anchor="middle" font-family="monospace" font-size="11" fill="#7c7065">ARSIP PETA INTERAKTIF BUDAYA NUSANTARA</text>
</svg>`;
}

// Fast CDN-cached Wikipedia REST v1 summary image resolver
async function fetchWikiRestThumb(rawName) {
  const candidates = [
    rawName.replace(/\s*\(.*?\)\s*/g, "").trim(),
    rawName.split("/")[0].replace(/\s*\(.*?\)\s*/g, "").trim(),
    rawName.replace(/^Kain\s+/i, "").replace(/\s*\(.*?\)\s*/g, "").trim(),
    rawName.replace(/^Baju\s+/i, "").replace(/\s*\(.*?\)\s*/g, "").trim(),
  ].filter(Boolean);

  for (const title of [...new Set(candidates)]) {
    const slugTitle = encodeURIComponent(title.replace(/\s+/g, "_"));
    for (const lang of ["id", "en"]) {
      try {
        const res = await fetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${slugTitle}`,
          {
            headers: {
              "User-Agent": "PetaInteraktifBudayaNusantara/1.0 (https://budaya.id)",
            },
            signal: AbortSignal.timeout(4000),
          }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const src = data?.thumbnail?.source || data?.originalimage?.source;
        if (src && !src.endsWith(".svg") && !src.endsWith(".pdf") && !src.endsWith(".ogg")) {
          return src;
        }
      } catch {
        // continue
      }
    }
  }
  return null;
}

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "PetaInteraktifBudayaNusantara/1.0 (https://budaya.id)",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1500) return false;
    fs.writeFileSync(destPath, buf);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Prioritize all Makanan (124), Alat Musik (108), Pakaian (95), and Supplemented Tarian
  const candidates = items.filter(
    (i) => i.category === "makanan" || i.category === "musik" || i.category === "pakaian" || i.rawRowIndex >= 600
  );

  // Deduplicate by clean name so we only query Wikipedia once per unique cultural item name
  const byName = new Map();
  for (const item of candidates) {
    const key = item.name.toLowerCase().trim();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(item);
  }

  const uniqueKeys = [...byName.keys()];
  console.log(`Querying Wikipedia REST CDN for ${uniqueKeys.length} unique cultural items...`);

  let realPhotoItems = 0;
  const BATCH = 6;
  for (let i = 0; i < uniqueKeys.length; i += BATCH) {
    const slice = uniqueKeys.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (key) => {
        const group = byName.get(key);
        const primary = group[0];
        const imgUrl = await fetchWikiRestThumb(primary.name);
        if (!imgUrl) return;

        const ext = imgUrl.toLowerCase().includes(".png") ? "png" : "jpg";
        const relPath = `/assets/culture/${primary.category}/${primary.slug}.${ext}`;
        const fullPath = path.join(ROOT, "public", relPath);
        const ok = await downloadFile(imgUrl, fullPath);
        if (ok) {
          for (const member of group) {
            member.media.localImagePath = relPath;
            member.media.credit = "Wikimedia Commons / Arsip Budaya Nusantara";
            realPhotoItems++;
          }
        }
      })
    );
  }

  // Ensure every item without a downloaded photo has its bespoke local SVG plate in /public/assets/culture/
  let svgCount = 0;
  for (const item of items) {
    if (
      item.media.localImagePath.endsWith(".svg") ||
      item.media.localImagePath.includes("/fallbacks/")
    ) {
      const relPath = `/assets/culture/${item.category}/${item.slug}.svg`;
      const fullPath = path.join(ROOT, "public", relPath);
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, generateCustomSvgPlate(item), "utf8");
      }
      item.media.localImagePath = relPath;
      svgCount++;
    }
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(items, null, 2));
  console.log(
    `Completed! Linked ${realPhotoItems} items to downloaded real photographs and ${svgCount} items to bespoke local SVG plates.`
  );
}

main();

