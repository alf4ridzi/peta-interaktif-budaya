# Task Implementation Checklist — Peta Interaktif Budaya

**Document Type:** Engineering Task Breakdown (`tasks.md`)  
**Project:** Peta Interaktif Budaya (Interactive Cultural Map of Indonesia)  
**Status:** Implemented & Verified  
**Language:** English  
**Context:** Spec-Driven Development & Project Context Document  

---

## Phase 1: Environment, Hallmark Tokens & Design Foundation

- [x] **Task 1.1: Hallmark Design Tokens & Global CSS Setup**
  - [x] Create `app/tokens.css` with locked OKLCH color variables (`--color-paper`, `--color-ink`, `--color-accent`, `--color-map-ocean`, `--color-map-land`, `--color-map-border`, `--color-map-hover`, `--color-map-selected`).
  - [x] Implement 4-pt spacing tokens (`--space-3xs` through `--space-2xl`) and radius tokens (`--radius-card`, `--radius-pill`).
  - [x] Import `app/tokens.css` into `app/globals.css`.
  - [x] Enforce root overflow safety: add `html, body { overflow-x: clip; max-width: 100vw; }`.
  - [x] Enforce Hallmark typography rule (Gate 38a): disable italic headings (`h1, h2, h3, h4 { font-style: normal; }`).

- [x] **Task 1.2: Typography & Layout Configuration**
  - [x] Configure `Plus Jakarta Sans` as primary display font in `app/layout.tsx`.
  - [x] Configure `Geist Sans` and `Geist Mono` for body and metadata.
  - [x] Update `app/layout.tsx` metadata with authentic Indonesian cultural title and description.

- [x] **Task 1.3: Supporting Iconography & UI Utilities**
  - [x] Build bespoke SVG iconography in `components/ui/Icons.tsx` for all 5 cultural categories, map controls, and quiz states.
  - [x] Build Mercator / Equirectangular vector projection engine in `lib/geo/geo-service.ts`.
  - [x] Create utility helper `lib/utils.ts` with class merging, slugification, and title casing.

---

## Phase 2: Dataset Ingestion & Geographic Normalization Pipeline

- [x] **Task 2.1: Geographic Hierarchy Ingestion (`dataset/peta-indonesia/`)**
  - [x] Inspect and validate `dataset/peta-indonesia/provinces.json` (34 provinces with lat/lon).
  - [x] Inspect and validate `dataset/peta-indonesia/regencies.json` (514 regencies with province IDs and lat/lon).
  - [x] Inspect and validate `dataset/peta-indonesia/districts.json` (districts with regency IDs and lat/lon).
  - [x] Output normalized hierarchy to `public/data/normalized/geo-hierarchy.json`.

- [x] **Task 2.2: Roadless Indonesia Vector GeoJSON Boundaries**
  - [x] Assemble simplified GeoJSON vector boundaries for all 34 Indonesian provinces (strictly without road routes or highway textures).
  - [x] Save clean vector boundary geometries to `public/data/geo/indonesia-provinces.geojson`.
  - [x] Verify GeoJSON IDs align 1:1 with BPS province IDs (`11` for Aceh through `94` for Papua).

- [x] **Task 2.3: Build Ingestion Scripts for 5 Cultural CSV Datasets**
  - [x] Create `scripts/ingest-datasets.mjs` to parse:
    - `dataset/alat-musik/alat_musik_tradisional.csv` (108 items + Kalimantan Utara enrichment)
    - `dataset/bahasa daerah/dataset_bahasa_daerah.csv` (801 items)
    - `dataset/makanan/dataset_makanan_khas_indonesia_lengkap.csv` (124 items)
    - `dataset/pakaian/pakaian_adat_indonesia.csv` (95 items)
    - `dataset/tarian/ensiklopedi_tari_indonesia.csv` (566 items + supplemental provincial dances)
  - [x] Normalize province names across datasets to match standard names in `dataset/peta-indonesia/provinces.json`.

- [x] **Task 2.4: Origin Resolution for Unspecified Regencies & Districts**
  - [x] Resolve entries where `kabupaten` is `-` or omitted using verified provenance overrides and fuzzy matching against `regencies.json` and `districts.json`.
  - [x] Extract mentioned regencies and sub-districts from `dataset_bahasa_daerah.csv` descriptive text via regex pattern matching.
  - [x] Match `asal_daerah` in `ensiklopedi_tari_indonesia.csv` to regencies in `regencies.json`.
  - [x] Output 1,722 normalized records to `public/data/normalized/unified-culture.json`.

---

## Phase 3: Cultural Media Storage Pipeline & Image Assets

- [x] **Task 3.1: Setup Local Media Directory Structure**
  - [x] Create directories under `public/assets/culture/{bahasa,musik,makanan,pakaian,tarian,fallbacks}/`.

- [x] **Task 3.2: Automated Media Sourcing & Ingestion Pipeline**
  - [x] Create `scripts/fetch-media.mjs` to download authentic photographs from Wikipedia/Wikimedia REST CDN and generate bespoke local SVG plates.
  - [x] Store all 1,722 local image files under `public/assets/culture/`.
  - [x] Link local relative paths (`/assets/culture/[category]/[slug].[jpg|png|svg]`) into `unified-culture.json`.

- [x] **Task 3.3: Thematic SVG Fallback Assets**
  - [x] Generate category fallback SVGs in `public/assets/culture/fallbacks/{bahasa,musik,makanan,pakaian,tarian}.svg` via `scripts/generate-fallbacks.mjs`.

---

## Phase 4: Roadless Vector Map Canvas & Interaction Engine

- [x] **Task 4.1: Build Roadless Vector Map Component (`components/map/IndonesiaMap.tsx`)**
  - [x] Render Indonesia archipelago vector polygons centered at `[118.0, -2.5]`.
  - [x] Apply Hallmark token styling (ocean `--color-map-ocean`, land `--color-map-land`, stroke `--color-map-border`).
  - [x] Ensure ZERO roads, vehicular routes, highway grids, or traffic layers are rendered.
  - [x] Implement responsive auto-scaling and smooth pointer pan/zoom.

- [x] **Task 4.2: Implement Multi-Level Geographic Drilldown**
  - [x] **Level 1 (National View):** All 34 provinces rendered as interactive polygons.
  - [x] **Level 2 (Provincial Zoom):** Clicking a province zooms in, highlights the boundary, and renders its regencies (*Kabupaten/Kota*).
  - [x] **Level 3 (Regency View):** Clicking a regency highlights the regency and displays district centroids (*Kecamatan*).

- [x] **Task 4.3: Region Interactive States (8-State Model)**
  - [x] Implement hover state (`--color-map-hover`, cursor pointer) and instant floating tooltip (<50ms).
  - [x] Implement selected state (`--color-map-selected`) and keyboard focus (`tabIndex={0}`, `:focus-visible`).

- [x] **Task 4.4: Map Controls & Archipelago Quick-Jump (`components/map/MapControls.tsx`)**
  - [x] Zoom In (+), Zoom Out (-), and Reset Archipelago View buttons.
  - [x] Quick-jump island tabs: Seluruh Nusantara, Sumatera, Jawa, Bali & Nusa, Kalimantan, Sulawesi, Maluku & Papua.

---

## Phase 5: Top HUD, Breadcrumb Bar & Universal Search

- [x] **Task 5.1: Build Top HUD Bar (`components/hud/HeaderHUD.tsx`)**
  - [x] Title with cultural identity: "Peta Interaktif Budaya Nusantara".
  - [x] Global search input with instant autocomplete dropdown matching provinces, regencies, and cultural items.
  - [x] 5-Pillar category filter pills (Bahasa, Musik, Makanan, Pakaian, Tarian).

- [x] **Task 5.2: Build Breadcrumb Bar (`components/hud/Breadcrumbs.tsx`)**
  - [x] Render geographic trail: `Indonesia (34 Provinsi) > Provinsi [Nama] > [Kabupaten/Kota] > Kec. [Nama]`.
  - [x] Allow single-click navigation back to parent levels.

---

## Phase 6: Cultural Dossier & Split-Canvas Explorer UI

- [x] **Task 6.1: Build Cultural Dossier Drawer (`components/dossier/CulturalDossier.tsx`)**
  - [x] Implement responsive drawer (desktop: right split-panel; mobile: bottom expandable sheet).
  - [x] Render region header with province name, capital, island badge, Kabupaten/Kota selector, and Kecamatan selector.
  - [x] Render primary CTA: "Uji Wawasan: Mulai Kuis Budaya [Nama Daerah]".

- [x] **Task 6.2: Build 5-Category Tab Switcher (`components/dossier/CategoryTabs.tsx`)**
  - [x] Tabs for: Alat Musik, Makanan, Pakaian, Tarian, Bahasa with item count badges.

- [x] **Task 6.3: Build Cultural Card Component (`components/dossier/CulturalCard.tsx`)**
  - [x] Render local image from `/public/assets/culture/` with automatic fallback handler.
  - [x] Render title, local name, verified origin badge, category attributes, and expandable ethnographic description.

- [x] **Task 6.4: Build Graceful Fallback States**
  - [x] Informative shared provincial heritage notice when a regency inherits provincial items for a category.

---

## Phase 7: Interactive Regional Culture Quiz Engine

- [x] **Task 7.1: Build Quiz Data Generation Engine (`lib/quiz/quiz-engine.ts`)**
  - [x] Pre-generate 170 provincial questions in `public/data/normalized/quizzes.json` and dynamically construct regency-prioritized questions with provincial fallback.

- [x] **Task 7.2: Build Quiz Modal Container (`components/quiz/QuizModal.tsx`)**
  - [x] Accessible modal dialog with progress bar and running score counter.

- [x] **Task 7.3: Build Question Card & Option Buttons (`components/quiz/QuizQuestionCard.tsx`)**
  - [x] Display cultural challenge question, category badge, 4 option buttons, instant emerald/rose validation, and cultural trivia explanation box.

- [x] **Task 7.4: Build Quiz Summary & Mastery Badging (`components/quiz/QuizSummary.tsx`)**
  - [x] Display final score, accuracy percentage, and mastery rank (*Penjelajah Mula*, *Pamong Budaya*, *Maestro Nusantara*).

---

## Phase 8: Mobile Responsiveness, Anti-Slop Audit & Optimization

- [x] **Task 8.1: Mobile Responsive Verification (320px, 375px, 414px, 768px, 1024px, 1440px)**
  - [x] Verify zero horizontal scroll (`overflow-x: clip`).
  - [x] Mobile bottom sheet drawer for `< 768px` viewports.

- [x] **Task 8.2: Hallmark Anti-AI-Slop Audit**
  - [x] Verify no italic headings exist in typography (Gate 38a).
  - [x] Verify all colors and fonts bind to CSS tokens (Gate 48).
  - [x] Verify honest copy with zero fabricated marketing stats (Gate 46).

- [x] **Task 8.3: Production Build & Bundle Optimization**
  - [x] Verify TypeScript (`tsc --noEmit`), ESLint (`npm run lint`), and data verification (`node scripts/verify-data.mjs`).

---

## Phase 9: Verification & End-to-End Walkthrough

- [x] **Task 9.1: Comprehensive Flow Testing**
  - [x] Verify map rendering, province/regency/district drilldown, 5-category dossier, universal search, and regional quiz engine.
- [x] **Task 9.2: Walkthrough Documentation**
  - [x] Document verified features and architectural structure in `walkthrough.md`.

---

## Phase 10: Fitur Tanya AI tentang Budaya Indonesia (Grounded Cultural Chatbot)

- [x] **Task 10.1: Build Knowledge Retrieval & RAG Engine (`lib/ai/culture-rag.ts`)**
  - [x] Implement weighted keyword and concept synonym matching over 1,722 verified records in `unified-culture.json`.
  - [x] Support dual-mode processing: Google Gemini API when `GEMINI_API_KEY` is present; grounded local synthesis when absent.
  - [x] Include authentic reference citations and suggested questions in response payload.

- [x] **Task 10.2: Build Server-Side Chat API Route (`app/api/chat/route.ts`)**
  - [x] Implement POST route with input validation, payload length limits, and error handling.

- [x] **Task 10.3: Build Tanya AI Chat Interface (`components/ai/TanyaAIChat.tsx` & `app/tanya-ai/page.tsx`)**
  - [x] Modern Hallmark chat UI with message bubbles, loading state, error retry, and sample questions.
  - [x] Deep context seeding from query params (`?budaya=[name]&slug=[slug]`) with active context banner.

---

## Phase 11: Fitur Progres Belajar (Interactive Learning Progress & Metrics)

- [x] **Task 11.1: Build Progress Persistence Service (`lib/progress/progress-service.ts`)**
  - [x] Implement `recordLearnedItem` with slug deduplication and view counting.
  - [x] Implement `recordQuizAttempt` with score, accuracy, question count, and timestamp.
  - [x] Implement `getProgressStats` and deterministic `getRecommendations`.
  - [x] Safe client-side `localStorage` storage with `useSyncExternalStore` event synchronization.

- [x] **Task 11.2: Build Learning Progress Dashboard (`components/progress/LearningDashboard.tsx` & `app/progres/page.tsx`)**
  - [x] 4 Key Stat Cards: Total Materi Dipelajari, Kuis Diselesaikan, Nilai Rata-rata, Skor Tertinggi.
  - [x] Category distribution breakdown across 5 cultural pillars.
  - [x] 3 Tabs: Rekomendasi & Ikhtisar, Materi Dipelajari, Riwayat Hasil Kuis.

- [x] **Task 11.3: Cross-Feature Integration**
  - [x] Add "Tanyakan kepada AI tentang budaya ini" button on `CulturalCard.tsx`.
  - [x] Add automatic study tracking on `CulturalCard.tsx`.
  - [x] Add automatic quiz completion logging in `QuizModal.tsx` and link in `QuizSummary.tsx`.
  - [x] Add main navbar navigation links to "Tanya AI" and "Progres Belajar" in `HeaderHUD.tsx`.
