import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const geo = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "public/data/geo/indonesia-provinces.geojson"),
    "utf8"
  )
);
const hierarchy = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "public/data/normalized/geo-hierarchy.json"),
    "utf8"
  )
);
const culture = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "public/data/normalized/unified-culture.json"),
    "utf8"
  )
);
const quizzes = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "public/data/normalized/quizzes.json"),
    "utf8"
  )
);

console.log("=== Verification Summary ===");
console.log("1. Provinces in GeoJSON:", geo.features.length);
console.log("2. Provinces in Hierarchy:", hierarchy.provinces.length);
console.log("3. Regencies in Hierarchy:", hierarchy.regencies.length);
console.log("4. Total Cultural Records:", culture.length);
console.log("5. Total Quiz Questions:", quizzes.length);

let missingMedia = 0;
let realPhotos = 0;
for (const item of culture) {
  const fullPath = path.join(ROOT, "public", item.media.localImagePath);
  if (!fs.existsSync(fullPath)) {
    missingMedia++;
  }
  if (!item.media.localImagePath.endsWith(".svg")) {
    realPhotos++;
  }
}

console.log("6. Items with real downloaded photos:", realPhotos);
console.log("7. Missing local media files:", missingMedia);

if (
  geo.features.length !== 34 ||
  hierarchy.provinces.length !== 34 ||
  missingMedia > 0
) {
  console.error("Verification FAILED!");
  process.exit(1);
}

console.log("All data & media integrity checks PASSED!");

