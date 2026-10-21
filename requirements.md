# Requirements Specification — Peta Interaktif Budaya (Interactive Cultural Map of Indonesia)

**Document Type:** Product Requirements Document (PRD)  
**Standard:** Easy Approach to Requirements Syntax (EARS)  
**Status:** Approved Specification  
**Language:** English  
**Context:** Spec-Driven Development & Project Context Document  

---

## 1. System Overview & Objectives

**Peta Interaktif Budaya** is an interactive, cartographic exploration web application dedicated to presenting the authentic cultural heritage of Indonesia across its administrative hierarchy:
- **Provinces (*Provinsi*)** (referenced in `dataset/peta-indonesia/provinces.json`)
- **Regencies / Cities (*Kabupaten / Kota*)** (referenced in `dataset/peta-indonesia/regencies.json`)
- **Sub-districts (*Kecamatan*)** (referenced in `dataset/peta-indonesia/districts.json`)

The application integrates five distinct cultural pillars provided in the project datasets:
1. **Regional Languages (*Bahasa Daerah*)** — Sourced from `dataset/bahasa daerah/dataset_bahasa_daerah.csv` (801 entries).
2. **Traditional Musical Instruments (*Alat Musik*)** — Sourced from `dataset/alat-musik/alat_musik_tradisional.csv` (108 entries).
3. **Traditional Foods & Culinary Heritage (*Makanan*)** — Sourced from `dataset/makanan/dataset_makanan_khas_indonesia_lengkap.csv` (124 entries).
4. **Traditional Attire & Textiles (*Pakaian Adat*)** — Sourced from `dataset/pakaian/pakaian_adat_indonesia.csv` (95 entries).
5. **Traditional Dances (*Tarian*)** — Sourced from `dataset/tarian/ensiklopedi_tari_indonesia.csv` (566 entries).

The core user experience is an interactive, thematic map of Indonesia (conceptually inspired by clean vector map exploration, but strictly **roadless** and tailored to cultural discovery). When a user clicks any province or regency, the system displays an editorial cultural dossier detailing the 5 cultural domains for that region and enables an interactive **regional culture quiz**.

---

## 2. Source Datasets & Data Characteristics

| Dataset Domain | Source File | Key Raw Columns | Identified Data Gaps / Normalization Needs |
|---|---|---|---|
| **Administrative Map** | `dataset/peta-indonesia/provinces.json`, `regencies.json`, `districts.json`, `indonesia-region.min.json` | `id, name, alt_name, latitude, longitude, province_id, regency_id` | Contains centroids and hierarchical codes. Requires accompanying clean vector boundary polygon geometries (road-free). |
| **Alat Musik** | `dataset/alat-musik/alat_musik_tradisional.csv` | `no, nama_alat_musik, provinsi, kabupaten, kecamatan, deskripsi` | Several rows have `-` for `kabupaten` and `kecamatan` (e.g., Serune Kale, Gambus). System must resolve origins via web research. |
| **Bahasa Daerah** | `dataset/bahasa daerah/dataset_bahasa_daerah.csv` | `no, bahasa, provinsi, deskripsi` | Textual description contains explicit mention of villages, sub-districts (*kecamatan*), and regencies (*kabupaten*). Requires text extraction & normalization. |
| **Makanan** | `dataset/makanan/dataset_makanan_khas_indonesia_lengkap.csv` | `Pulau, Provinsi, Nama Makanan, Deskripsi` | Lacks dedicated regency/city columns. Cultural provenance must be resolved via web research to map foods to specific regencies (e.g., *Sate Matang* -> Bireuen, *Gudeg* -> Yogyakarta). |
| **Pakaian Adat** | `dataset/pakaian/pakaian_adat_indonesia.csv` | `Pulau, Provinsi, Pakaian Adat, Pengguna, Ciri Khas/Material` | Sub-regional ethnic origins are embedded in parentheses or names (e.g., *Batak Toba* -> Toba Samosir/Tapanuli). |
| **Tarian** | `dataset/tarian/ensiklopedi_tari_indonesia.csv` | `nama, provinsi, asal_daerah, dasar_penentuan_lokasi, deskripsi` | Rich regional data in `asal_daerah` (e.g. "Kajang kabupaten Bulukumba", "Jeneponto", "Sengkang"). Needs fuzzy alignment with `regencies.json`. |

---

## 3. EARS-Formatted Functional Requirements

*Notation Guide:*
- **Ubiquitous (Always active):** `THE SYSTEM SHALL [system action]`
- **Event-Driven (Triggered by user or external event):** `WHEN [event occurs], THE SYSTEM SHALL [system action]`
- **State-Driven (Active during specific mode/state):** `WHILE [in state], THE SYSTEM SHALL [system action]`
- **Unwanted Behavior / Fallback (Handling errors/exceptions):** `IF [unwanted event], THEN THE SYSTEM SHALL [system action]`
- **Optional Feature:** `WHERE [optional condition], THE SYSTEM SHALL [system action]`

---

### 3.1 Cartographic Navigation & Visual Boundaries

1. **REQ-MAP-001 (Zero-Roads Vector Map):**  
   THE SYSTEM SHALL render an administrative vector map of Indonesia completely devoid of road networks, vehicular routes, traffic lanes, or street highway grids.

2. **REQ-MAP-002 (Hierarchical Geographic Levels):**  
   THE SYSTEM SHALL support navigation across three administrative levels synchronized with `dataset/peta-indonesia/`:
   - Level 1: Provinces (*Provinsi*)
   - Level 2: Regencies and Cities (*Kabupaten / Kota*)
   - Level 3: Sub-districts (*Kecamatan*)

3. **REQ-MAP-003 (Region Hover Feedback):**  
   WHEN the user hovers over any geographic region on the map canvas,  
   THE SYSTEM SHALL apply a highlight state to the polygon within 50ms and display a minimalist tooltip showing the region's name, administrative classification, and total registered cultural assets.

4. **REQ-MAP-004 (Region Click & Camera Focus):**  
   WHEN the user clicks a province or regency on the map canvas,  
   THE SYSTEM SHALL execute a smooth camera zoom-and-pan transition to focus the viewport on that region's coordinates and immediately open the corresponding Cultural Dossier in the side panel.

5. **REQ-MAP-005 (Administrative Breadcrumb Navigation):**  
   WHEN a sub-provincial territory is active,  
   THE SYSTEM SHALL display an interactive breadcrumb trail (e.g., `Indonesia > Sumatera Barat > Kabupaten Tanah Datar`) allowing single-click navigation back to parent administrative levels.

6. **REQ-MAP-006 (Archipelago Pan & Zoom Bounds):**  
   WHEN the user pans or zooms the map,  
   THE SYSTEM SHALL clamp the camera within Indonesia's geographic bounding envelope [Latitude: 6.5° N to 11.5° S, Longitude: 94.5° E to 141.5° E] to prevent empty viewport drifting.

---

### 3.2 Cultural Heritage Presentation (5 Pillars)

1. **REQ-CUL-001 (Five-Pillar Dossier Display):**  
   WHEN a region is selected,  
   THE SYSTEM SHALL render cultural heritage items grouped across the five dataset domains:
   - **Bahasa Daerah** (from `dataset_bahasa_daerah.csv`)
   - **Alat Musik** (from `alat_musik_tradisional.csv`)
   - **Makanan** (from `dataset_makanan_khas_indonesia_lengkap.csv`)
   - **Pakaian Adat** (from `pakaian_adat_indonesia.csv`)
   - **Tarian** (from `ensiklopedi_tari_indonesia.csv`)

2. **REQ-CUL-002 (Cultural Item Dossier Detail):**  
   THE SYSTEM SHALL render each cultural card with:
   - Item name and local ethnic designation
   - Verified administrative location (Province and Regency/Kecamatan)
   - High-resolution authentic image served from local storage (`/public/assets/culture/...`)
   - Cultural synopsis and historical background
   - Domain-specific attributes (e.g. instrument sound type and playing method; food primary ingredients and culinary notes; clothing gender and material; dance style and performer composition; language dialect and speaker territory).

3. **REQ-CUL-003 (Category Tab Switching):**  
   WHEN the user clicks a category tab (Bahasa, Musik, Makanan, Pakaian, Tarian),  
   THE SYSTEM SHALL immediately filter the dossier display to the selected category without page reload or layout shift.

4. **REQ-CUL-004 (Web-Assisted Origin Resolution):**  
   IF a cultural item in the dataset has missing or unspecified regency/district origin (marked `-` or omitted),  
   THEN THE SYSTEM SHALL execute a web-assisted provenance resolution procedure to verify its authentic territorial root (e.g. resolving *Serune Kale* to Pidie/Aceh Besar, *Gambus* to Riau coastal regencies, *Sate Matang* to Bireuen Regency) before indexing in the application catalog.

5. **REQ-CUL-005 (Missing Category Graceful State):**  
   IF a selected regency has no recorded items under a specific cultural category in the dataset,  
   THEN THE SYSTEM SHALL display an informative fallback state showing items from the overarching province and indicating provincial shared heritage.

---

### 3.3 Media Storage & Image Management

1. **REQ-MED-001 (Local Asset Storage Pipeline):**  
   THE SYSTEM SHALL store all vetted cultural imagery in local project storage (`/public/assets/culture/[category]/[slug].[webp|jpg]`) to guarantee zero hotlinking failures, reliable offline resilience, and fast edge delivery.

2. **REQ-MED-002 (Automated Media Sourcing & Ingestion):**  
   WHEN a cultural item from the dataset is indexed,  
   THE SYSTEM SHALL source an authentic, representative photograph via targeted web image search, validate its aspect ratio, optimize it to WebP format (max size ≤ 120 KB), and commit the local file path to the catalog.

3. **REQ-MED-003 (Image Loading Fallback):**  
   IF an image fails to load or is momentarily missing,  
   THEN THE SYSTEM SHALL display a curated thematic SVG placeholder corresponding to that cultural pillar and log the asset identifier for maintenance.

---

### 3.4 Interactive Regional Culture Quiz

1. **REQ-QZ-001 (Quiz Launching):**  
   WHEN the user clicks the "Mulai Kuis Budaya [Nama Daerah]" (Start Regional Quiz) action in the cultural dossier,  
   THE SYSTEM SHALL open the Quiz Modal populated with questions specifically generated from the active territory's cultural assets.

2. **REQ-QZ-002 (Question Format & Options):**  
   THE SYSTEM SHALL present each quiz question with:
   - A clear cultural challenge question
   - Category pill (e.g., "Alat Musik", "Makanan")
   - Four distinct multiple-choice options with exactly one correct answer
   - An optional visual or contextual clue.

3. **REQ-QZ-003 (Instant Feedback & Cultural Trivia):**  
   WHEN the user clicks an answer option,  
   THE SYSTEM SHALL immediately evaluate the submission, highlight the selected option as correct (emerald) or incorrect (rose), reveal the correct option if missed, and display a cultural trivia explanation box highlighting the background story.

4. **REQ-QZ-004 (Session Progress & Score Tracking):**  
   WHILE a quiz session is active,  
   THE SYSTEM SHALL display progress (e.g. `Pertanyaan 2 dari 5`), lock submitted options from re-answering, and maintain the live score.

5. **REQ-QZ-005 (Quiz Completion & Mastery Ranking):**  
   WHEN all questions in a session are completed,  
   THE SYSTEM SHALL display a completion summary card with total score, percentage, and an Indonesian cultural mastery rank:
   - 0% – 40%: *Penjelajah Mula* (Beginner Explorer)
   - 60% – 80%: *Pamong Budaya* (Cultural Custodian)
   - 100%: *Maestro Nusantara* (Archipelago Maestro)

---

### 3.5 Universal Search & Discovery

1. **REQ-SCH-001 (Real-time Autocomplete Search):**  
   WHEN the user types into the global search bar,  
   THE SYSTEM SHALL perform real-time debounce matching across provinces, regencies, cultural item names, and local synonyms.

2. **REQ-SCH-002 (Search Result Activation):**  
   WHEN the user selects a search result,  
   THE SYSTEM SHALL fly the map camera to that item's territorial origin, highlight the boundary, and automatically reveal the item in the cultural dossier.

---

### 3.6 Hallmark Anti-AI-Slop & Quality Standards

1. **REQ-DES-001 (Hallmark Anti-AI-Slop Conformity):**  
   THE SYSTEM SHALL comply with all Hallmark design criteria:
   - Zero generic purple/cyan neon cards or futuristic AI glow.
   - All headings and titles SHALL be Roman (`font-style: normal`), strictly forbidding italic display headers.
   - Honest copy: no fabricated user metrics or fake marketing stats.
   - Clean, tactile typography and warm organic color palette rooted in Indonesian natural tones.

2. **REQ-DES-002 (Eight-State Component Discipline):**  
   THE SYSTEM SHALL explicitly implement all 8 interaction states (`default`, `hover`, `:focus-visible`, `:active`, `disabled`, `loading`, `error`, `success`) on all interactive buttons, tabs, region paths, and quiz choices.

3. **REQ-DES-003 (Mobile Responsiveness):**  
   THE SYSTEM SHALL ensure zero horizontal overflow (`overflow-x: clip`) and full interactive usability across mobile, tablet, and desktop viewports (tested at 320px, 375px, 414px, 768px, 1024px, and 1440px). On mobile screens (<768px), the Cultural Dossier SHALL transform into a touch-friendly bottom sheet.

---

### 3.7 Tanya AI tentang Budaya Indonesia (Grounded Cultural Chatbot)

1. **REQ-AI-001 (Dedicated Chat Interface):**  
   WHEN the user accesses `/tanya-ai`,  
   THE SYSTEM SHALL render a dedicated conversational interface featuring page title, AI companion description, conversation history area, auto-resizing input box, send button, loading indicator, and responsive layout for mobile and desktop.

2. **REQ-AI-002 (Grounded Retrieval-Augmented Generation):**  
   WHEN processing a culture inquiry,  
   THE SYSTEM SHALL perform weighted context retrieval against the 1,722 verified cultural records in `unified-culture.json` and ground the AI response on verified provenance, returning authentic reference citations.

3. **REQ-AI-003 (Dual-Mode Execution & Fallback Resilience):**  
   IF `GEMINI_API_KEY` is present in server environment,  
   THE SYSTEM SHALL execute full generative reasoning via Google Gemini API;  
   IF `GEMINI_API_KEY` is absent,  
   THE SYSTEM SHALL synthesize a structured, grounded answer from the verified local cultural database without failing or providing static dummy text.

4. **REQ-AI-004 (Deep Cross-Feature Context Seeding):**  
   WHEN the user clicks "Tanyakan kepada AI tentang budaya ini" on any cultural card in the Dossier,  
   THE SYSTEM SHALL redirect to `/tanya-ai?budaya=[name]&slug=[slug]`, seed the conversation with that specific culture, display an active context banner, and prioritize that cultural topic in the AI response.

---

### 3.8 Progres Belajar (Interactive Learning Progress & Metrics)

1. **REQ-PRG-001 (Learning Dashboard Metrics):**  
   WHEN the user navigates to `/progres`,  
   THE SYSTEM SHALL render an informative dashboard calculating:
   - Total distinct cultural items studied (out of 1,722)
   - Total regional quizzes completed
   - Average quiz accuracy score (percentage)
   - Highest quiz score achieved
   - Cultural domain distribution across all 5 pillars
   - Mastery rank badge (*Penjelajah Mula*, *Pamong Budaya*, *Maestro Nusantara*)

2. **REQ-PRG-002 (Automated Study Tracking & Deduplication):**  
   WHEN a user views or explores a cultural card,  
   THE SYSTEM SHALL automatically record the item into the learned registry, updating `lastLearnedAt` and incrementing `viewCount` while deduplicating by item slug.

3. **REQ-PRG-003 (Automated Quiz Session History):**  
   WHEN a user finishes any regional quiz in `QuizModal`,  
   THE SYSTEM SHALL record the session attempt with region name, question count, correct answers, percentage score, and timestamp.

4. **REQ-PRG-004 (Smart Recommendations Engine):**  
   THE SYSTEM SHALL generate deterministic, personalized learning recommendations based on categories with the lowest quiz proficiency and unexplored provinces, providing direct action links to "Lihat di Peta" and "Tanya AI".

5. **REQ-PRG-005 (Local Persistence & Hydration Safety):**  
   THE SYSTEM SHALL persist learning progress across browser reloads using client-side `localStorage` with `useSyncExternalStore` subscription, ensuring zero hydration mismatch.

