"use client";

import React, { useMemo, useState } from "react";
import {
  CulturalCategory,
  CulturalItem,
  DistrictRecord,
  GeoHierarchyData,
  IslandGroup,
} from "@/types/culture";
import { QuizQuestion } from "@/types/quiz";
import {
  IndonesiaMap,
  ProvinceGeoFeature,
} from "@/components/map/IndonesiaMap";
import { HeaderHUD } from "@/components/hud/HeaderHUD";
import { Breadcrumbs } from "@/components/hud/Breadcrumbs";
import { CulturalDossier } from "@/components/dossier/CulturalDossier";
import { QuizModal } from "@/components/quiz/QuizModal";
import { buildRegionalQuizSession } from "@/lib/quiz/quiz-engine";
import { formatTitleCase } from "@/lib/utils";
import { IconQuiz } from "@/components/ui/Icons";

interface CulturalAtlasExplorerProps {
  geoFeatures: ProvinceGeoFeature[];
  hierarchy: GeoHierarchyData;
  culturalItems: CulturalItem[];
  quizzes: QuizQuestion[];
}

export function CulturalAtlasExplorer({
  geoFeatures,
  hierarchy,
  culturalItems,
  quizzes,
}: CulturalAtlasExplorerProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(
    null // No province selected by default; full map view
  );
  const [selectedRegencyId, setSelectedRegencyId] = useState<string | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
    null
  );
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    CulturalCategory | "semua"
  >("semua");
  const [activeDossierTab, setActiveDossierTab] =
    useState<CulturalCategory>("musik");
  const [highlightedItemSlug, setHighlightedItemSlug] = useState<string | null>(
    null
  );
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isMobileDossierOpen, setIsMobileDossierOpen] = useState(false);

  const [camera, setCamera] = useState<{
    lon: number;
    lat: number;
    zoom: number;
    activeIsland: IslandGroup | "Nusantara";
  }>({
    lon: 118.0,
    lat: -2.5,
    zoom: 1,
    activeIsland: "Nusantara",
  });

  // Lookup records for current selection
  const selectedProvince = useMemo(
    () =>
      selectedProvinceId
        ? hierarchy.provinces.find((p) => p.id === selectedProvinceId) || null
        : null,
    [hierarchy.provinces, selectedProvinceId]
  );

  const regenciesInProvince = useMemo(
    () =>
      selectedProvince
        ? hierarchy.regencies.filter((r) => r.provinceId === selectedProvince.id)
        : [],
    [hierarchy.regencies, selectedProvince]
  );

  const selectedRegency = useMemo(
    () =>
      selectedProvince
        ? regenciesInProvince.find((r) => r.id === selectedRegencyId) || null
        : null,
    [selectedProvince, regenciesInProvince, selectedRegencyId]
  );

  const districtsInRegency = useMemo(
    () =>
      selectedRegency
        ? hierarchy.districtsByRegency[selectedRegency.id] || []
        : [],
    [hierarchy.districtsByRegency, selectedRegency]
  );

  const selectedDistrict = useMemo(
    () =>
      districtsInRegency.find((d) => d.id === selectedDistrictId) || null,
    [districtsInRegency, selectedDistrictId]
  );

  // Filtered cultural items for map counts
  const filteredGlobalItems = useMemo(() => {
    if (activeCategoryFilter === "semua") return culturalItems;
    return culturalItems.filter((i) => i.category === activeCategoryFilter);
  }, [culturalItems, activeCategoryFilter]);

  const itemCountsByProvince = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of filteredGlobalItems) {
      counts[item.provinceId] = (counts[item.provinceId] || 0) + 1;
    }
    return counts;
  }, [filteredGlobalItems]);

  const itemCountsByRegency = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of filteredGlobalItems) {
      if (item.regencyId) {
        counts[item.regencyId] = (counts[item.regencyId] || 0) + 1;
      }
    }
    return counts;
  }, [filteredGlobalItems]);

  const activeProvinceItems = useMemo(
    () =>
      selectedProvince
        ? culturalItems.filter((i) => i.provinceId === selectedProvince.id)
        : [],
    [culturalItems, selectedProvince]
  );

  // Active Quiz Session Questions
  const activeQuizQuestions = useMemo(
    () =>
      selectedProvince
        ? buildRegionalQuizSession(
            selectedProvince.id,
            selectedRegencyId,
            quizzes,
            culturalItems
          )
        : [],
    [selectedProvince, selectedRegencyId, quizzes, culturalItems]
  );

  // Handlers
  const handleSelectProvince = (provinceId: string) => {
    const prov = hierarchy.provinces.find((p) => p.id === provinceId);
    setSelectedProvinceId(provinceId);
    setSelectedRegencyId(null);
    setSelectedDistrictId(null);
    setHighlightedItemSlug(null);
    setIsMobileDossierOpen(true);

    if (prov) {
      const zoomLevel =
        prov.id === "31" ? 4.0 : prov.id === "34" ? 3.6 : 2.6;
      setCamera({
        lon: prov.longitude,
        lat: prov.latitude,
        zoom: zoomLevel,
        activeIsland: prov.islandGroup,
      });
    }
  };

  const handleSelectRegency = (regencyId: string | null) => {
    setSelectedRegencyId(regencyId);
    setSelectedDistrictId(null);
    setHighlightedItemSlug(null);

    if (!regencyId) {
      if (selectedProvince) {
        const zoomLevel =
          selectedProvince.id === "31"
            ? 4.0
            : selectedProvince.id === "34"
            ? 3.6
            : 2.6;
        setCamera((prev) => ({
          ...prev,
          lon: selectedProvince.longitude,
          lat: selectedProvince.latitude,
          zoom: zoomLevel,
        }));
      }
      return;
    }

    const reg = hierarchy.regencies.find((r) => r.id === regencyId);
    if (reg) {
      setSelectedProvinceId(reg.provinceId);
      setIsMobileDossierOpen(true);
      // Adaptive zoom for focused regency view
      const regZoom =
        reg.provinceId === "31" ? 6.2 : reg.provinceId === "34" ? 5.8 : 5.3;
      setCamera((prev) => ({
        ...prev,
        lon: reg.longitude,
        lat: reg.latitude,
        zoom: regZoom,
      }));
    }
  };

  const handleSelectDistrict = (districtId: string | null) => {
    setSelectedDistrictId(districtId);
    setHighlightedItemSlug(null);

    if (!districtId) {
      if (selectedRegency) {
        const regZoom =
          selectedRegency.provinceId === "31"
            ? 6.2
            : selectedRegency.provinceId === "34"
            ? 5.8
            : 5.3;
        setCamera((prev) => ({
          ...prev,
          lon: selectedRegency.longitude,
          lat: selectedRegency.latitude,
          zoom: regZoom,
        }));
      }
      return;
    }

    // Lookup district across active regency or full hierarchy
    let dist: DistrictRecord | undefined;
    let parentRegId = selectedRegencyId;

    if (parentRegId && hierarchy.districtsByRegency[parentRegId]) {
      dist = hierarchy.districtsByRegency[parentRegId].find(
        (d) => d.id === districtId
      );
    }

    if (!dist) {
      for (const [rId, dList] of Object.entries(hierarchy.districtsByRegency)) {
        const found = dList.find((d) => d.id === districtId);
        if (found) {
          dist = found;
          parentRegId = rId;
          break;
        }
      }
    }

    if (dist) {
      if (parentRegId && parentRegId !== selectedRegencyId) {
        const reg = hierarchy.regencies.find((r) => r.id === parentRegId);
        if (reg) {
          setSelectedProvinceId(reg.provinceId);
          setSelectedRegencyId(reg.id);
        }
      }
      setIsMobileDossierOpen(true);
      const distZoom = selectedProvinceId === "31" ? 7.6 : 6.8;
      setCamera((prev) => ({
        ...prev,
        lon: dist!.lon,
        lat: dist!.lat,
        zoom: distZoom,
      }));
    }
  };

  const handleSelectCategoryFilter = (cat: CulturalCategory | "semua") => {
    setActiveCategoryFilter(cat);
    if (cat !== "semua") {
      setActiveDossierTab(cat);
    }
  };

  const handleSelectCulturalItemFromSearch = (item: CulturalItem) => {
    setSelectedProvinceId(item.provinceId);
    setSelectedRegencyId(item.regencyId || null);
    setSelectedDistrictId(null);
    setActiveDossierTab(item.category);
    setHighlightedItemSlug(item.slug);
    setIsMobileDossierOpen(true);

    const reg = item.regencyId
      ? hierarchy.regencies.find((r) => r.id === item.regencyId)
      : null;
    const prov = hierarchy.provinces.find((p) => p.id === item.provinceId);

    if (reg) {
      setCamera({
        lon: reg.longitude,
        lat: reg.latitude,
        zoom: 4.0,
        activeIsland: item.islandGroup,
      });
    } else if (prov) {
      setCamera({
        lon: prov.longitude,
        lat: prov.latitude,
        zoom: 2.6,
        activeIsland: prov.islandGroup,
      });
    }
  };

  const handleResetToNational = () => {
    setSelectedProvinceId(null);
    setSelectedRegencyId(null);
    setSelectedDistrictId(null);
    setHighlightedItemSlug(null);
    setIsMobileDossierOpen(false);
    setCamera({
      lon: 118.0,
      lat: -2.5,
      zoom: 1,
      activeIsland: "Nusantara",
    });
  };

  const activeRegionLabel = selectedRegency
    ? formatTitleCase(selectedRegency.name)
    : selectedProvince
    ? selectedProvince.name
    : "Nusantara";

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[var(--color-paper)]">
      {/* Top HUD & Search Bar */}
      <HeaderHUD
        provinces={hierarchy.provinces}
        regencies={hierarchy.regencies}
        items={culturalItems}
        activeCategory={activeCategoryFilter}
        onSelectCategory={handleSelectCategoryFilter}
        onSelectProvince={handleSelectProvince}
        onSelectRegency={(provId, regId) => {
          setSelectedProvinceId(provId);
          handleSelectRegency(regId);
        }}
        onSelectCulturalItem={handleSelectCulturalItemFromSearch}
        onStartQuiz={() => selectedProvince && setIsQuizOpen(true)}
        activeRegionName={activeRegionLabel}
      />

      {/* Split-Canvas Workspace: Left/Center Vector Map + Right Cultural Dossier */}
      <main className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Cartographic Canvas */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Breadcrumbs
            selectedProvince={selectedProvince}
            selectedRegency={selectedRegency}
            selectedDistrict={selectedDistrict}
            onResetToNational={handleResetToNational}
            onSelectProvince={handleSelectProvince}
            onSelectRegency={(regId) => handleSelectRegency(regId ? regId : null)}
            onSelectDistrict={(distId) => handleSelectDistrict(distId ? distId : null)}
          />

          <IndonesiaMap
            features={geoFeatures}
            regencies={hierarchy.regencies}
            districtsByRegency={hierarchy.districtsByRegency}
            itemCountsByProvince={itemCountsByProvince}
            itemCountsByRegency={itemCountsByRegency}
            selectedProvinceId={selectedProvince ? selectedProvince.id : null}
            selectedRegencyId={selectedRegencyId}
            selectedDistrictId={selectedDistrictId}
            activeCategoryFilter={activeCategoryFilter}
            camera={camera}
            onCameraChange={setCamera}
            onSelectProvince={handleSelectProvince}
            onSelectRegency={(regId) => handleSelectRegency(regId ? regId : null)}
            onSelectDistrict={(distId) => handleSelectDistrict(distId ? distId : null)}
          />

          {/* Mobile Floating Drawer Trigger Bar (<768px) - Only shown when a region is selected */}
          {selectedProvince && (
            <div className="flex items-center justify-between border-t border-[var(--color-rule)] bg-[var(--color-paper-elevated)] px-4 py-2.5 md:hidden">
              <div>
                <p className="font-mono text-[10px] uppercase text-[var(--color-accent)]">
                  Daerah Terpilih
                </p>
                <p className="font-display text-sm font-bold text-[var(--color-ink)]">
                  {activeRegionLabel} ({activeProvinceItems.length} Budaya)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuizOpen(true)}
                  className="hm-interactive flex items-center gap-1 rounded-[var(--radius-input)] border border-[var(--color-accent)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-accent)]"
                >
                  <IconQuiz size={14} />
                  <span>Kuis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileDossierOpen(true)}
                  className="hm-interactive rounded-[var(--radius-input)] bg-[var(--color-ink)] px-3 py-1.5 text-xs font-bold text-[var(--color-paper)]"
                >
                  Lihat Budaya ↑
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Cultural Dossier Side Panel - Only shown when a province is selected */}
        {selectedProvince && (
          <div className="hidden h-full md:block animate-in fade-in duration-200">
            <CulturalDossier
              province={selectedProvince}
              regenciesInProvince={regenciesInProvince}
              selectedRegency={selectedRegency}
              districtsInRegency={districtsInRegency}
              selectedDistrict={selectedDistrict}
              provinceItems={activeProvinceItems}
              activeTab={activeDossierTab}
              highlightedItemSlug={highlightedItemSlug}
              onSelectTab={setActiveDossierTab}
              onSelectRegency={handleSelectRegency}
              onSelectDistrict={handleSelectDistrict}
              onStartQuiz={() => setIsQuizOpen(true)}
              onClose={handleResetToNational}
            />
          </div>
        )}

        {/* Mobile Bottom Sheet Dossier (<768px) - Only shown when a province is selected and opened */}
        {selectedProvince && isMobileDossierOpen && (
          <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 md:hidden">
            <div className="h-[82dvh] w-full overflow-hidden rounded-t-xl bg-[var(--color-paper)] shadow-2xl">
              <CulturalDossier
                province={selectedProvince}
                regenciesInProvince={regenciesInProvince}
                selectedRegency={selectedRegency}
                districtsInRegency={districtsInRegency}
                selectedDistrict={selectedDistrict}
                provinceItems={activeProvinceItems}
                activeTab={activeDossierTab}
                highlightedItemSlug={highlightedItemSlug}
                onSelectTab={setActiveDossierTab}
                onSelectRegency={handleSelectRegency}
                onSelectDistrict={handleSelectDistrict}
                onStartQuiz={() => setIsQuizOpen(true)}
                onCloseMobile={() => setIsMobileDossierOpen(false)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Regional Culture Quiz Modal */}
      {isQuizOpen && selectedProvince && (
        <QuizModal
          key={`${selectedProvince.id}-${selectedRegencyId || "all"}`}
          isOpen={isQuizOpen}
          regionName={activeRegionLabel}
          questions={activeQuizQuestions}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </div>
  );
}

