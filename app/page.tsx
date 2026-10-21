import fs from "fs";
import path from "path";
import { CulturalAtlasExplorer } from "@/components/CulturalAtlasExplorer";
import { CulturalItem, GeoHierarchyData } from "@/types/culture";
import { QuizQuestion } from "@/types/quiz";
import { ProvinceGeoFeature } from "@/components/map/IndonesiaMap";

export default function HomePage() {
  const root = process.cwd();

  const geoCollection = JSON.parse(
    fs.readFileSync(
      path.join(root, "public/data/geo/indonesia-provinces.geojson"),
      "utf8"
    )
  ) as { features: ProvinceGeoFeature[] };

  const hierarchy = JSON.parse(
    fs.readFileSync(
      path.join(root, "public/data/normalized/geo-hierarchy.json"),
      "utf8"
    )
  ) as GeoHierarchyData;

  const culturalItems = JSON.parse(
    fs.readFileSync(
      path.join(root, "public/data/normalized/unified-culture.json"),
      "utf8"
    )
  ) as CulturalItem[];

  const quizzes = JSON.parse(
    fs.readFileSync(
      path.join(root, "public/data/normalized/quizzes.json"),
      "utf8"
    )
  ) as QuizQuestion[];

  return (
    <CulturalAtlasExplorer
      geoFeatures={geoCollection.features}
      hierarchy={hierarchy}
      culturalItems={culturalItems}
      quizzes={quizzes}
    />
  );
}
