# Graph Report - peta-interaktif-budaya  (2026-10-21)

## Corpus Check
- 181 files · ~2,087,118 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1348 nodes · 1654 edges · 98 communities (67 shown, 30 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `62179d22`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Assets — sourcing canon for icons, logos, illustrations, photography, video
- Critical (ships as slop)
- macrostructures.md
- Theme — Lumen
- Theme — Hum
- devDependencies
- Custom craft — how to hand-build hero artwork
- Custom theme — protocol
- compilerOptions
- Design flow (default)
- Recipes
- Study — extracting design DNA from a screenshot or URL
- Hero enrichment — when, what, and how much
- Theme — Carnival
- hallmark/SKILL.md
- Interaction and states
- Major (looks AI-generated)
- Slop test — 58 gates + pre-emit self-critique
- Copy
- Typography
- component-cookbook.md
- Archetype index — load ONLY the picks you need
- Theme — Cobalt
- Theme - Grid
- Responsive
- The six axes
- Genre — atmospheric
- Genre — modern-minimal
- Genre — playful
- Imagery kit — curated abstract assets, hosted, ready
- Genre — editorial (default)
- § Multi-page flow — design.md first, then redesign
- Layout and space
- Motion
- design.md — opt-in portable design system
- Export formats
- Colour
- Macrostructures
- Floating nav on scroll — the cross-fade morph
- layout.tsx
- Output contract & scope
- README.md
- AGENTS.md
- lib.mjs
- c2-inline-form-as-cta.md
- LearningDashboard.tsx
- c4-sticky-bottom-bar.md
- culture.ts
- Partial Prefetching optimizer
- next-cache-components-adoption
- f6-product-card-grid.md
- Review checklist
- ingest-datasets.mjs
- ft4-dense-typographic.md
- Icons.tsx
- Bundle optimizer
- next-cache-components-optimizer
- Technical Architecture & Design Document — Peta Interaktif Budaya
- next-partial-prefetching-adoption
- TanyaAIChat.tsx
- Microinteraction tells
- RED-test robustness: verify the RED before optimizing
- What the rig must define
- What the rig must define
- h7-demo-video-clipped-by-viewport-edge.md
- Minor (small taste issues)
- h9-custom-illustration-centerpiece.md
- next-dev-loop
- n13-inline-cmdk-pill.md
- IndonesiaMap.tsx
- 3. EARS-Formatted Functional Requirements
- Task Implementation Checklist — Peta Interaktif Budaya
- n3-side-rail.md
- n4-hidden-behind-k.md
- f3-tabular-spec-sheet.md
- fetch-media.mjs
- n8-terminal-command.md
- Test template: the instant() guard
- ft3-index-style-category-list.md
- s2-hanging.md
- verify-data.mjs
- generate-fallbacks.mjs
- rules/graphify.md
- t1-pull-quote-with-marginalia.md
- t3-single-huge-quote.md
- t4-numbered-stat-strip.md
- render.sh
- f4-step-sequence.md
- workflows/graphify.md
- GEMINI.md
- CulturalAtlasExplorer.tsx
- eslint.config.mjs
- next.config.ts
- ft6-letter-close.md
- n2-floating-chip.md
- n7-brutal-slab.md
- s4-inline-no-break.md

## God Nodes (most connected - your core abstractions)
1. `CulturalCategory` - 20 edges
2. `Major (looks AI-generated)` - 20 edges
3. `Slop test — 58 gates + pre-emit self-critique` - 19 edges
4. `Theme — Hum` - 18 edges
5. `next-cache-components-optimizer` - 18 edges
6. `CulturalItem` - 17 edges
7. `Critical (ships as slop)` - 17 edges
8. `Theme — Lumen` - 17 edges
9. `label()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `LearningDashboardProps` --references--> `CulturalItem`  [EXTRACTED]
  components/progress/LearningDashboard.tsx → types/culture.ts
- `POST()` --calls--> `processCultureChat()`  [EXTRACTED]
  app/api/chat/route.ts → lib/ai/culture-rag.ts
- `CulturalAtlasExplorerProps` --references--> `CulturalItem`  [EXTRACTED]
  components/CulturalAtlasExplorer.tsx → types/culture.ts
- `CulturalAtlasExplorer()` --calls--> `formatTitleCase()`  [EXTRACTED]
  components/CulturalAtlasExplorer.tsx → lib/utils.ts
- `CategoryTabsProps` --references--> `CulturalCategory`  [EXTRACTED]
  components/dossier/CategoryTabs.tsx → types/culture.ts

## Import Cycles
- None detected.

## Communities (98 total, 30 thin omitted)

### Community 0 - "Assets — sourcing canon for icons, logos, illustrations, photography, video"
Cohesion: 0.05
Nodes (44): Abstract backgrounds, App mockups / device frames, Assets — sourcing canon for icons, logos, illustrations, photography, video, Avoid, Avoid, Avoid, Avoid, Avoid (+36 more)

### Community 1 - "Critical (ships as slop)"
Cohesion: 0.12
Nodes (17): Aurora-blob background, Card-in-card, Critical (ships as slop), Default-attractor sameness, Floating-orb decoration, Full-viewport centred hero, Inter-everywhere, Lazy-loaded LCP (+9 more)

### Community 2 - "macrostructures.md"
Cohesion: 0.05
Nodes (21): 01 · Bento Grid, 02 · Long Document, 03 · Marquee Hero, 04 · Stat-Led, 05 · Workbench, 06 · Conversational FAQ, 07 · Manifesto, 08 · Photographic (+13 more)

### Community 3 - "Theme — Lumen"
Cohesion: 0.06
Nodes (33): 1. Hand-built apparatus (no orb), 2. Lowercase headline with verb-landmark (no italics), 3. Mono eyebrow above every section, 4. Blueprint grid background (4% opacity), 5. Meter strip (below the hero), 6. Hairline cards with inner emission, 7. Three-stat row with Instrument Serif numerals + tabular-nums, Anti-patterns (theme-specific) (+25 more)

### Community 4 - "Theme — Hum"
Cohesion: 0.06
Nodes (32): 1. The button system — three variations, the press is the feedback, 2. Multi-accent section bands, 3. Color-shift card grid, 4. Streak / counter tick-up, 5. Character moment — one small reacting mark, 6. Big rounded everything, 7. Star-burst micro-celebration on success, Anti-patterns (theme-specific) (+24 more)

### Community 5 - "devDependencies"
Cohesion: 0.06
Nodes (32): eslint, eslint-config-next, next, dependencies, next, react, react-dom, devDependencies (+24 more)

### Community 6 - "Custom craft — how to hand-build hero artwork"
Cohesion: 0.07
Nodes (30): A hand-built SVG with declarative animation, A worked example — the bakery loaf as a single div, Animation choices for SVG in 2026, Anti-patterns of CSS art, Anti-patterns of declarative animation, Anti-patterns of generated stills, Anti-patterns of hand-built SVG, Anti-patterns of Three.js / WebGL (+22 more)

### Community 7 - "Custom theme — protocol"
Cohesion: 0.07
Nodes (29): § A · The one follow-up question, B.1 · Anchor accent first, B.2 · Paper, B.3 · Ink, B.4 · Supporting greys, B.5 · Focus, B.6 · Accent-ink (overlay text colour on accent), B.7 · Verification (+21 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "Design flow (default)"
Cohesion: 0.07
Nodes (28): 0. Pre-flight scan, 1. Design-context gate, 2.5. Check project memory, 2.6. Theme route — studied-DNA, catalog, or custom, 2. Pick a macrostructure FIRST, 3. Load the visual ruleset, 4. Decide on hero enrichment, 5. Preview (+20 more)

### Community 10 - "Recipes"
Cohesion: 0.07
Nodes (27): Accessibility ground truth, Button press, Command palette navigation, Copy-to-clipboard, Drag handle, Dropdown / menu, Form validation, Hard rules for default-on motion (+19 more)

### Community 11 - "Study — extracting design DNA from a screenshot or URL"
Cohesion: 0.08
Nodes (26): After the file is written, Emitting a `design.md` from `study`, Image-mode template, Junk-or-blocked detection, Limits and disclaimers, Refusal — when not to study, Remote URL safety, Source mode — image or URL (+18 more)

### Community 12 - "Hero enrichment — when, what, and how much"
Cohesion: 0.09
Nodes (23): Animation discipline (hero specifically), Common mistakes — and the fixes, E1 · Demo Video — Clipped-by-viewport-edge, E2 · Demo Video — Full-bleed muted loop with ghost overlay, E3 · Mock App Screenshot — Browser-framed split, E4 · Mock App Screenshot — Floating no-frame, E5 · Custom Illustration Centerpiece, E6 · Animated Loop — pure CSS / SVG / Motion (+15 more)

### Community 13 - "Theme — Carnival"
Cohesion: 0.09
Nodes (22): Anti-patterns (theme-specific), Axes (diversification), Build hint, Drop 01 · Cold Snap *(default)*, Drop 02 · Citrus Riot, Drop 03 · Diner Sign, Drop 04 · Studio Night, Drop 05 · Aqua Park (+14 more)

### Community 15 - "Interaction and states"
Cohesion: 0.10
Nodes (21): Bans, Computation, Contrast discipline, Don't, list, Dropdowns, tooltips, popovers, Focus rings, Forms, Heights and rhythm (+13 more)

### Community 16 - "Major (looks AI-generated)"
Cohesion: 0.10
Nodes (20): AI-illustration look, Animate-on-scroll on everything, Bounce and elastic easing, Centred everything, Eyebrow on every section, Generic emoji as feature icon, Glassmorphism without purpose, Hover-only affordances (+12 more)

### Community 17 - "Slop test — 58 gates + pre-emit self-critique"
Cohesion: 0.11
Nodes (19): Contrast & readability, Diversification gates, Hero enrichment gates, Honest copy · no fabricated content, Implementation gates, Input-state gate, Layout-safety gates, Microinteractions (+11 more)

### Community 18 - "Copy"
Cohesion: 0.11
Nodes (17): Austere, Banned opening lines (anti-patterns), Brutalist, Buttons, Copy, Editorial, Empty states, Error messages (+9 more)

### Community 19 - "Typography"
Cohesion: 0.12
Nodes (17): Banned defaults, Bans, Body text rules, Free body faces, Free display faces, Free mono / outlier faces, Headings rules, Hero headline sizing — match size to copy length (+9 more)

### Community 20 - "component-cookbook.md"
Cohesion: 0.03
Nodes (28): C1 · Outlined chip, C3 · Typographic link, F1 · Bento grid, F2 · Sticky-scroll stack, F5 · Annotated screenshot, Ft1 · Mast-headed, Ft2 · Inline-rule single line, Ft5 · Statement (+20 more)

### Community 21 - "Archetype index — load ONLY the picks you need"
Cohesion: 0.14
Nodes (14): Archetype index — load ONLY the picks you need, Component cookbook, CTAs / signups, Feature blocks, Footers, Heroes, Mobile collapse — per archetype, Navigation (+6 more)

### Community 22 - "Theme — Cobalt"
Cohesion: 0.14
Nodes (13): Anti-patterns, Axes (diversification), Build hint, How Cobalt differs from neighbouring themes, Macrostructure affinity, Macrostructure rejection, Motion, Reference register (+5 more)

### Community 23 - "Theme - Grid"
Cohesion: 0.14
Nodes (13): Axes (diversification), Build hint, Do-nots (this theme's own failure modes), How Grid differs from its neighbours, Material, Motion, Reference register, The marks kit (+5 more)

### Community 24 - "Responsive"
Cohesion: 0.15
Nodes (13): Bans, Breakpoints, Clickable text — never wraps, Fluid scaling, Images, Internationalisation, Mobile — non-negotiable, Pointer and hover queries (+5 more)

### Community 25 - "The six axes"
Cohesion: 0.15
Nodes (13): 1. Section-heading placement, 2. Body composition, 3. Divider language, 4. Button voice, 5. Image treatment, 6. Reveal pattern, Anti-patterns of structural sameness, Domain → trio (offer these three; never default) (+5 more)

### Community 26 - "Genre — atmospheric"
Cohesion: 0.20
Nodes (10): Genre — atmospheric, Nav and footer voice, Reference register, Stamp signature, Themes that belong, Voice, Voice fixtures, What this genre allows (+2 more)

### Community 27 - "Genre — modern-minimal"
Cohesion: 0.20
Nodes (10): Genre — modern-minimal, Nav and footer voice, Reference register (for the LLM, not credited to anyone), Stamp signature, Themes that belong, Voice, Voice fixtures, What this genre allows (+2 more)

### Community 28 - "Genre — playful"
Cohesion: 0.20
Nodes (10): Genre — playful, Nav and footer voice, Reference register, Stamp signature, Themes that belong, Voice, Voice fixtures, What this genre allows (+2 more)

### Community 29 - "Imagery kit — curated abstract assets, hosted, ready"
Cohesion: 0.18
Nodes (11): Anti-patterns, Categories, Decoration, Empty state, Generation pipeline (out-of-band, one-time), Imagery kit — curated abstract assets, hosted, ready, Layered hero composition (the masterclass move), Manifest (placeholder until generation pass ships) (+3 more)

### Community 30 - "Genre — editorial (default)"
Cohesion: 0.22
Nodes (9): Genre — editorial (default), Nav and footer voice, Stamp signature, Themes that belong, Voice, Voice fixtures, What this genre allows, What this genre disallows (+1 more)

### Community 31 - "§ Multi-page flow — design.md first, then redesign"
Cohesion: 0.20
Nodes (10): 1. Read the project, then pause, 2. Produce `design.md` at the project root, 3. Redesign each page reading from `design.md`, 4. Diversification rule — INVERTED for multi-page, 5. When to amend `design.md` instead of overriding, `hallmark redesign`, § Multi-page flow — design.md first, then redesign, Non-destructive implementation rule (+2 more)

### Community 32 - "Layout and space"
Cohesion: 0.22
Nodes (9): Asymmetry techniques, Bans, Depth, Grids, Layout and space, Page-edge clipping, Principles, The spacing scale (+1 more)

### Community 33 - "Motion"
Cohesion: 0.22
Nodes (9): Bans, Durations, Easings, Motion, Page-load orchestration, Principles, Reduced motion, Scroll-linked motion (+1 more)

### Community 34 - "design.md — opt-in portable design system"
Cohesion: 0.25
Nodes (8): After the file is written, CTA — surface the offer in the Step 5 preview, design.md — opt-in portable design system, Format (the tight version), Scope, Triggers (phrase-only — no new verb), Two emission paths (default vs study), Why opt-in (not auto-emit)

### Community 35 - "Export formats"
Cohesion: 0.25
Nodes (7): Export formats, Format 1 — `tokens.css`, Format 2 — Tailwind v4 `@theme`, Format 3 — DTCG `tokens.json`, Format 4 — shadcn/ui CSS variables, Output rule, Token taxonomy — Hallmark's source of truth

### Community 36 - "Colour"
Cohesion: 0.29
Nodes (7): Bans, Colour, Contrast, Dark mode recipe, Palette construction, Principles, Use of the accent

### Community 37 - "Macrostructures"
Cohesion: 0.29
Nodes (7): Diversification rule (mandatory), Hero polish patterns, How to pick, Macrostructures, Nav and footer voice, SaaS page sequence, The 21 macrostructures — index

### Community 38 - "Floating nav on scroll — the cross-fade morph"
Cohesion: 0.22
Nodes (7): N10 · Floating-on-scroll morph, Anti-patterns Hallmark refuses, Floating nav on scroll — the cross-fade morph, The four laws — non-negotiable, The property morph (10 properties, one curve), The scroll handler, The structure

### Community 40 - "Output contract & scope"
Cohesion: 0.50
Nodes (3): Output contract, Output contract & scope, Scope and limits

### Community 41 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 43 - "lib.mjs"
Cohesion: 0.10
Nodes (32): dir, here, out, badge(), bracketCaption(), browserWindow(), callout(), card() (+24 more)

### Community 45 - "LearningDashboard.tsx"
Cohesion: 0.16
Nodes (21): metadata, CategoryTabsProps, CATEGORY_ICONS, LearningDashboard(), LearningDashboardProps, subscribeProgress(), clearStoredProgress(), getInitialData() (+13 more)

### Community 47 - "culture.ts"
Cohesion: 0.20
Nodes (17): CulturalCard(), CulturalCardProps, CulturalDossier(), CulturalDossierProps, Breadcrumbs(), BreadcrumbsProps, HeaderHUD(), HeaderHUDProps (+9 more)

### Community 48 - "Partial Prefetching optimizer"
Cohesion: 0.06
Nodes (32): Common false REDs, Contract already GREEN, Differential, Lock engagement, The trigger is part of the test, Trustworthy RED and differential, Verification gate, What each signal rules out (+24 more)

### Community 49 - "next-cache-components-adoption"
Cohesion: 0.06
Nodes (29): dev-only validation sweep, gotchas, the loop, what the build misses, when this shrinks, when to run it, deciding what to do with a blocking read, per-page decisions: removing `instant = false` (+21 more)

### Community 51 - "Review checklist"
Cohesion: 0.07
Nodes (27): Against the references, Both themes, Composition, Edges and padding, Files, Meaning, Review checklist, Text (+19 more)

### Community 52 - "ingest-datasets.mjs"
Cohesion: 0.09
Nodes (24): RFC-4180, allItems, allQuizzes, buildProvincesGeoJSON(), compactDistricts, districtsByRegency, districtsRaw, findDistrictInRegency() (+16 more)

### Community 54 - "Icons.tsx"
Cohesion: 0.17
Nodes (16): CategoryTabs(), ICONS, CATEGORY_ICON_MAP, MapControls(), IconBahasa(), IconChevronRight(), IconCompass(), IconMakanan() (+8 more)

### Community 55 - "Bundle optimizer"
Cohesion: 0.10
Nodes (17): Duplicate browser dependency, Fix patterns, Lazy interaction feature, Other attributed assets, Server-rendered display work, Clustering — find logical communities, Conditional min cut — detach a target, Graph methods (+9 more)

### Community 56 - "next-cache-components-optimizer"
Cohesion: 0.11
Nodes (18): 0. SETUP: discover this project's rig, once per repo, A. RIG: a production build with the testing API exposed, After optimization, B. BASELINE (unlocked): development scaffold, do not ship, C. RED (locked) + the VERIFY-RED gate, D. FIX: apply the documented pattern, Driving the navigation in tests, E. PARITY: the refactor changed only whether the route is instant (+10 more)

### Community 57 - "Technical Architecture & Design Document — Peta Interaktif Budaya"
Cohesion: 0.11
Nodes (18): 1. Executive Summary & The Kitchen Secret Recipe, 2.1 Hallmark Pre-Flight & Creative DNA, 2.2 Locked Design Tokens (`tokens.css`), 2.3 Strict 8-State Matrix for Interactive Components, 2. Hallmark Design System & Anti-AI-Slop Tokens, 3. System Architecture & Component Breakdown, 4.1 Geographic Entity Schemas, 4.2 Cultural Entity Schema (5 Pillars) (+10 more)

### Community 58 - "next-partial-prefetching-adoption"
Cohesion: 0.12
Nodes (15): background, Choose what to preserve and how to verify it, further reading, next-partial-prefetching-adoption, notes, preservation gate, requires, step 1: audit `<Link prefetch={true}>` navigations (before enabling) (+7 more)

### Community 59 - "TanyaAIChat.tsx"
Cohesion: 0.16
Nodes (14): POST(), metadata, DEFAULT_SAMPLE_QUESTIONS, Message, nextMsgId(), TanyaAIChat(), IconArrowLeft(), ChatResponsePayload (+6 more)

### Community 60 - "Microinteraction tells"
Cohesion: 0.14
Nodes (14): Animated hover gradients, Auto-rotating carousels with no pause, Bouncy overshoot easings on UI, Celebratory success toasts, Confirmation dialogs for reversible actions, Cursor follower dots, Focus rings that animate in, Microinteraction tells (+6 more)

### Community 61 - "RED-test robustness: verify the RED before optimizing"
Cohesion: 0.15
Nodes (12): Cookie and session reads are not lock probes, Determinism and the rig, Differential check (capture in the PR), `instant()` guards need no retries and no prefetch warming, `instant()` is not a stopwatch, RED-test robustness: verify the RED before optimizing, Silent no-op: the testing API must be exposed in the measured build, Taxonomy: red for the wrong reason (+4 more)

### Community 62 - "What the rig must define"
Cohesion: 0.15
Nodes (12): Artifact liveness, Check the rig before writing the baseline, Drift, Iteration loop, Production build and server, Production `instant()` rig, Test command and base URL, Test context (+4 more)

### Community 63 - "What the rig must define"
Cohesion: 0.15
Nodes (12): Artifact liveness, Check the rig before writing the baseline, Drift, Iteration loop, Production build and server, Production `instant()` rig, Test command and base URL, Test context (+4 more)

### Community 65 - "Minor (small taste issues)"
Cohesion: 0.18
Nodes (11): 100vw widths, Anti-patterns — the named tells, Double-hyphen dashes, Every section padded the same, How `hallmark audit` should report, Minor (small taste issues), Placeholder names, Startup-cliché product names (+3 more)

### Community 67 - "next-dev-loop"
Cohesion: 0.18
Nodes (10): after the edit — verify, before the edit — narrow the scope, gotchas, loop, next-dev-loop, preflight, reference, Report Next.js friction (+2 more)

### Community 69 - "IndonesiaMap.tsx"
Cohesion: 0.24
Nodes (15): IndonesiaMap(), TooltipState, MapControlsProps, GeoCoordinates, geometryToSvgPath(), IslandViewportPreset, LAT_MAX, LAT_MIN (+7 more)

### Community 70 - "3. EARS-Formatted Functional Requirements"
Cohesion: 0.15
Nodes (12): 1. System Overview & Objectives, 2. Source Datasets & Data Characteristics, 3.1 Cartographic Navigation & Visual Boundaries, 3.2 Cultural Heritage Presentation (5 Pillars), 3.3 Media Storage & Image Management, 3.4 Interactive Regional Culture Quiz, 3.5 Universal Search & Discovery, 3.6 Hallmark Anti-AI-Slop & Quality Standards (+4 more)

### Community 71 - "Task Implementation Checklist — Peta Interaktif Budaya"
Cohesion: 0.15
Nodes (12): Phase 10: Fitur Tanya AI tentang Budaya Indonesia (Grounded Cultural Chatbot), Phase 11: Fitur Progres Belajar (Interactive Learning Progress & Metrics), Phase 1: Environment, Hallmark Tokens & Design Foundation, Phase 2: Dataset Ingestion & Geographic Normalization Pipeline, Phase 3: Cultural Media Storage Pipeline & Image Assets, Phase 4: Roadless Vector Map Canvas & Interaction Engine, Phase 5: Top HUD, Breadcrumb Bar & Universal Search, Phase 6: Cultural Dossier & Split-Canvas Explorer UI (+4 more)

### Community 75 - "fetch-media.mjs"
Cohesion: 0.29
Nodes (9): CATALOG_PATH, downloadFile(), escapeXml(), fetchWikiRestThumb(), generateCustomSvgPlate(), items, main(), PALETTE_BY_CAT (+1 more)

### Community 77 - "Test template: the instant() guard"
Cohesion: 0.33
Nodes (5): Baseline scaffold: do not ship, Initial load (hard navigation), Self-validating variant (recommended for routes with deferred content), Soft navigation (client-side navigation), Test template: the instant() guard

### Community 80 - "verify-data.mjs"
Cohesion: 0.33
Nodes (5): culture, geo, hierarchy, quizzes, ROOT

### Community 81 - "generate-fallbacks.mjs"
Cohesion: 0.50
Nodes (3): FALLBACK_DIR, FALLBACKS, ROOT

### Community 91 - "CulturalAtlasExplorer.tsx"
Cohesion: 0.16
Nodes (18): CulturalAtlasExplorer(), CulturalAtlasExplorerProps, ProvinceGeoFeature, QuizModal(), QuizModalProps, QuizQuestionCard(), QuizQuestionCardProps, QuizSummary() (+10 more)

## Knowledge Gaps
- **892 isolated node(s):** `here`, `out`, `dir`, `themes`, `sans` (+887 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 930 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Assets — sourcing canon for icons, logos, illustrations, photography, video` connect `Assets — sourcing canon for icons, logos, illustrations, photography, video` to `hallmark/SKILL.md`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Anti-patterns — the named tells` connect `Minor (small taste issues)` to `Major (looks AI-generated)`, `Critical (ships as slop)`, `Microinteraction tells`, `hallmark/SKILL.md`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Hallmark` connect `Design flow (default)` to `hallmark/SKILL.md`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `here`, `out`, `dir` to the rest of the system?**
  _892 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Assets — sourcing canon for icons, logos, illustrations, photography, video` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `Critical (ships as slop)` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `macrostructures.md` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._