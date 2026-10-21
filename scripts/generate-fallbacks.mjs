import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const FALLBACK_DIR = path.join(ROOT, "public/assets/culture/fallbacks");
fs.mkdirSync(FALLBACK_DIR, { recursive: true });

const FALLBACKS = {
  bahasa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#f3ede2"/>
  <rect x="24" y="24" width="752" height="452" rx="8" fill="none" stroke="#c8bba6" stroke-width="1.5"/>
  <g opacity="0.12" stroke="#3b4d7a" stroke-width="1.5" fill="none">
    <path d="M80 120 H720 M80 180 H720 M80 240 H720 M80 300 H720 M80 360 H720"/>
  </g>
  <g transform="translate(400, 225)" fill="none" stroke="#2d3b63" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-150" y="-75" width="300" height="150" rx="10" fill="#ebe2d3" stroke="#2d3b63" stroke-width="2.5"/>
    <line x1="-120" y1="-35" x2="120" y2="-35" stroke="#8c7a62" stroke-width="2"/>
    <line x1="-120" y1="0" x2="90" y2="0" stroke="#8c7a62" stroke-width="2"/>
    <line x1="-120" y1="35" x2="110" y2="35" stroke="#8c7a62" stroke-width="2"/>
    <path d="M-85 -15 C-65 -45, -45 15, -25 -15 C-5 -45, 15 15, 35 -15 C55 -45, 75 15, 95 -15" stroke="#b34b28" stroke-width="3"/>
    <circle cx="-125" cy="0" r="6" fill="#b34b28" stroke="none"/>
    <circle cx="125" cy="0" r="6" fill="#b34b28" stroke="none"/>
  </g>
  <text x="400" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c241d" letter-spacing="2">BAHASA &amp; AKSARA DAERAH</text>
  <text x="400" y="410" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#6e6256" letter-spacing="3">WARISAN TUTUR NUSANTARA</text>
</svg>`,

  musik: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#f5efe4"/>
  <rect x="24" y="24" width="752" height="452" rx="8" fill="none" stroke="#c8bba6" stroke-width="1.5"/>
  <circle cx="400" cy="220" r="130" fill="#eae0cf" stroke="#b87333" stroke-width="2" stroke-dasharray="6 4"/>
  <g transform="translate(400, 220)" fill="none" stroke="#8a4b19" stroke-width="3" stroke-linecap="round">
    <circle cx="0" cy="0" r="78" fill="#dfc9a6" stroke="#8a4b19" stroke-width="3"/>
    <circle cx="0" cy="0" r="28" fill="#b35c20" stroke="#5c2d0c" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="9" fill="#f5efe4" stroke="none"/>
    <line x1="-110" y1="-85" x2="110" y2="-85" stroke="#4a3728" stroke-width="5"/>
    <line x1="-65" y1="-85" x2="-45" y2="-45" stroke="#4a3728" stroke-width="2.5"/>
    <line x1="65" y1="-85" x2="45" y2="-45" stroke="#4a3728" stroke-width="2.5"/>
  </g>
  <text x="400" y="395" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c241d" letter-spacing="2">ALAT MUSIK TRADISIONAL</text>
  <text x="400" y="425" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#6e6256" letter-spacing="3">HARMONI BUNYI NUSANTARA</text>
</svg>`,

  makanan: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#f6efe5"/>
  <rect x="24" y="24" width="752" height="452" rx="8" fill="none" stroke="#c8bba6" stroke-width="1.5"/>
  <g transform="translate(400, 235)" fill="none" stroke="#9e3b22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="0" cy="45" rx="145" ry="32" fill="#e6d8c3" stroke="#5e4332" stroke-width="2.5"/>
    <path d="M-110 35 L0 -95 L110 35 Z" fill="#d99b38" stroke="#7a4914" stroke-width="2.5"/>
    <path d="M-125 35 C-125 85, 125 85, 125 35 Z" fill="#b34728" stroke="#5e2414" stroke-width="2.5"/>
    <path d="M-35 -115 C-45 -135, -25 -145, -35 -165" stroke="#9e3b22" stroke-width="2.5"/>
    <path d="M0 -120 C-10 -140, 10 -150, 0 -170" stroke="#9e3b22" stroke-width="2.5"/>
    <path d="M35 -115 C25 -135, 45 -145, 35 -165" stroke="#9e3b22" stroke-width="2.5"/>
  </g>
  <text x="400" y="395" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c241d" letter-spacing="2">KULINER &amp; REMPAH TRADISIONAL</text>
  <text x="400" y="425" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#6e6256" letter-spacing="3">CITA RASA WARISAN LELUHUR</text>
</svg>`,

  pakaian: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#f4eee6"/>
  <rect x="24" y="24" width="752" height="452" rx="8" fill="none" stroke="#c8bba6" stroke-width="1.5"/>
  <g transform="translate(400, 215)" fill="none" stroke="#6e2b4b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-45 -85 L-115 -45 L-90 15 L-55 -5 L-55 105 L55 105 L55 -5 L90 15 L115 -45 L45 -85 Q0 -55 -45 -85 Z" fill="#e5d5cb" stroke="#6e2b4b" stroke-width="3"/>
    <path d="M-25 -75 L0 105 L25 -75" stroke="#b35c20" stroke-width="2.5"/>
    <circle cx="0" cy="-15" r="18" fill="none" stroke="#b35c20" stroke-width="2"/>
    <circle cx="0" cy="35" r="18" fill="none" stroke="#b35c20" stroke-width="2"/>
  </g>
  <text x="400" y="395" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c241d" letter-spacing="2">BUSANA &amp; WASTRA ADAT</text>
  <text x="400" y="425" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#6e6256" letter-spacing="3">TENUN, BATIK &amp; SONGKET NUSANTARA</text>
</svg>`,

  tarian: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <rect width="800" height="500" fill="#f2efe8"/>
  <rect x="24" y="24" width="752" height="452" rx="8" fill="none" stroke="#c8bba6" stroke-width="1.5"/>
  <g transform="translate(400, 225)" fill="none" stroke="#1e5e4e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-125 25 A125 125 0 0 1 125 25 L0 25 Z" fill="#dce8e3" stroke="#1e5e4e" stroke-width="2.5"/>
    <line x1="0" y1="25" x2="-95" y2="-55" stroke="#1e5e4e" stroke-width="1.75"/>
    <line x1="0" y1="25" x2="-45" y2="-90" stroke="#1e5e4e" stroke-width="1.75"/>
    <line x1="0" y1="25" x2="0" y2="-100" stroke="#b35c20" stroke-width="2.2"/>
    <line x1="0" y1="25" x2="45" y2="-90" stroke="#1e5e4e" stroke-width="1.75"/>
    <line x1="0" y1="25" x2="95" y2="-55" stroke="#1e5e4e" stroke-width="1.75"/>
    <circle cx="0" cy="25" r="10" fill="#b35c20" stroke="none"/>
  </g>
  <text x="400" y="395" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c241d" letter-spacing="2">SENI TARI TRADISIONAL</text>
  <text x="400" y="425" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#6e6256" letter-spacing="3">GERAK WIRAGA &amp; WIRASA NUSANTARA</text>
</svg>`,
};

for (const [cat, svg] of Object.entries(FALLBACKS)) {
  fs.writeFileSync(path.join(FALLBACK_DIR, `${cat}.svg`), svg, "utf8");
}
console.log("Generated 5 category fallback SVGs in public/assets/culture/fallbacks/");

