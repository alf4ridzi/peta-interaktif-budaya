import { CulturalCategory, CulturalItem } from "@/types/culture";

export interface LearnedItemRecord {
  slug: string;
  itemId: string;
  name: string;
  category: CulturalCategory;
  provinceId: string;
  provinceName: string;
  regencyName?: string;
  districtName?: string;
  thumbnailPath?: string;
  firstLearnedAt: string;
  lastLearnedAt: string;
  viewCount: number;
}

export interface QuizHistoryRecord {
  id: string;
  provinceId: string;
  provinceName: string;
  regencyId?: string | null;
  regencyName?: string | null;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  completedAt: string;
  durationSeconds?: number;
}

export interface AnsweredQuizRecord {
  questionId: string;
  answeredAt: string;
  isCorrect: boolean;
  selectedOption: number;
}

export interface ProgressSummaryStats {
  totalLearned: number;
  totalQuizzes: number;
  totalAnsweredQuestions: number;
  averageScore: number;
  highestScore: number;
  categoryCounts: Record<CulturalCategory, number>;
  masteryTitle: string;
}

export interface RecommendationItem {
  item: CulturalItem;
  reason: "weak_category" | "unexplored_region" | "popular_heritage";
  badgeText: string;
}

const STORAGE_KEY = "peta_budaya_progress_v1";
const EVENT_NAME = "culture-progress-updated";

export interface StoredData {
  learnedItems: Record<string, LearnedItemRecord>;
  quizHistory: QuizHistoryRecord[];
  answeredQuestions: Record<string, AnsweredQuizRecord>;
}

export const EMPTY_PROGRESS_DATA: StoredData = Object.freeze({
  learnedItems: {},
  quizHistory: [],
  answeredQuestions: {},
});

let cachedData: StoredData = EMPTY_PROGRESS_DATA;
let cachedRaw: string | null = null;
let isCacheInitialized = false;

function loadFromLocalStorage(): StoredData {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS_DATA;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedData = EMPTY_PROGRESS_DATA;
      isCacheInitialized = true;
      return EMPTY_PROGRESS_DATA;
    }
    if (isCacheInitialized && raw === cachedRaw) {
      return cachedData;
    }
    cachedRaw = raw;
    const parsed = JSON.parse(raw);
    cachedData = {
      learnedItems: parsed.learnedItems || {},
      quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
      answeredQuestions: parsed.answeredQuestions || {},
    };
    isCacheInitialized = true;
    return cachedData;
  } catch (err) {
    console.warn("Failed to read culture progress from localStorage", err);
    cachedRaw = null;
    cachedData = EMPTY_PROGRESS_DATA;
    isCacheInitialized = true;
    return EMPTY_PROGRESS_DATA;
  }
}

function saveData(data: StoredData): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(data);
    cachedRaw = raw;
    cachedData = data;
    isCacheInitialized = true;
    localStorage.setItem(STORAGE_KEY, raw);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch (err) {
    console.warn("Failed to save culture progress to localStorage", err);
  }
}

/**
 * Record a cultural item as studied by the user.
 * Deduplicates by slug and increments viewCount while updating lastLearnedAt.
 */
export function recordLearnedItem(item: CulturalItem): void {
  const current = loadFromLocalStorage();
  const now = new Date().toISOString();
  const existing = current.learnedItems[item.slug];

  const updatedLearned = {
    ...current.learnedItems,
    [item.slug]: {
      slug: item.slug,
      itemId: item.id,
      name: item.name,
      category: item.category,
      provinceId: item.provinceId,
      provinceName: item.provinceName,
      regencyName: item.regencyName,
      districtName: item.districtName,
      thumbnailPath: item.media?.localImagePath,
      firstLearnedAt: existing ? existing.firstLearnedAt : now,
      lastLearnedAt: now,
      viewCount: (existing?.viewCount || 0) + 1,
    },
  };

  const newData: StoredData = {
    learnedItems: updatedLearned,
    quizHistory: current.quizHistory,
    answeredQuestions: current.answeredQuestions,
  };

  saveData(newData);
}

/**
 * Record a completed regional quiz session.
 */
export function recordQuizAttempt(record: Omit<QuizHistoryRecord, "id" | "completedAt">): QuizHistoryRecord {
  const current = loadFromLocalStorage();
  const completedAt = new Date().toISOString();
  const newAttempt: QuizHistoryRecord = {
    ...record,
    id: `quiz-att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    completedAt,
  };

  const newData: StoredData = {
    learnedItems: current.learnedItems,
    quizHistory: [newAttempt, ...current.quizHistory],
    answeredQuestions: current.answeredQuestions,
  };

  saveData(newData);
  return newAttempt;
}

/**
 * Record an individual answered quiz question in persistent history.
 */
export function recordAnsweredQuestion(
  questionId: string,
  isCorrect: boolean,
  selectedOption = 0
): void {
  const current = loadFromLocalStorage();
  const answeredAt = new Date().toISOString();
  const newData: StoredData = {
    ...current,
    answeredQuestions: {
      ...current.answeredQuestions,
      [questionId]: {
        questionId,
        answeredAt,
        isCorrect,
        selectedOption,
      },
    },
  };

  saveData(newData);
}

/**
 * Retrieve the Set of question IDs previously answered by the user.
 */
export function getAnsweredQuestionIds(data?: StoredData): Set<string> {
  const state = data || getStoredProgress();
  return new Set(Object.keys(state.answeredQuestions || {}));
}

/**
 * Retrieve cached learning progress data for useSyncExternalStore getSnapshot.
 * Returns reference-stable cached snapshot when data has not changed.
 */
export function getStoredProgress(): StoredData {
  return loadFromLocalStorage();
}

/**
 * Invalidate the memory cache when external storage events occur.
 */
export function invalidateProgressCache(): void {
  isCacheInitialized = false;
  cachedRaw = null;
}

/**
 * Compute key dashboard statistics from recorded data.
 */
export function getProgressStats(data?: StoredData): ProgressSummaryStats {
  const state = data || getStoredProgress();
  const learnedList: LearnedItemRecord[] = Object.values(state.learnedItems);
  const totalLearned = learnedList.length;
  const totalQuizzes = state.quizHistory.length;
  const totalAnsweredQuestions = Object.keys(state.answeredQuestions || {}).length;

  let scoreSum = 0;
  let highestScore = 0;

  for (const q of state.quizHistory) {
    scoreSum += q.scorePercent;
    if (q.scorePercent > highestScore) highestScore = q.scorePercent;
  }

  const averageScore = totalQuizzes > 0 ? Math.round(scoreSum / totalQuizzes) : 0;

  const categoryCounts: Record<CulturalCategory, number> = {
    bahasa: 0,
    musik: 0,
    makanan: 0,
    pakaian: 0,
    tarian: 0,
  };

  for (const item of learnedList) {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
  }

  let masteryTitle = "Penjelajah Mula";
  if (totalLearned >= 25 || (totalQuizzes >= 5 && averageScore >= 80)) {
    masteryTitle = "Maestro Nusantara";
  } else if (totalLearned >= 10 || totalQuizzes >= 3) {
    masteryTitle = "Pamong Budaya";
  }

  return {
    totalLearned,
    totalQuizzes,
    totalAnsweredQuestions,
    averageScore,
    highestScore,
    categoryCounts,
    masteryTitle,
  };
}

function pickDeterministic<T>(arr: T[], seedOffset = 0): T {
  const index = Math.abs(seedOffset) % arr.length;
  return arr[index];
}

/**
 * Smart recommendation engine based on user history and category proficiency.
 */
export function getRecommendations(
  allItems: CulturalItem[],
  data?: StoredData
): RecommendationItem[] {
  const state = data || getStoredProgress();
  const learnedSlugs = new Set(Object.keys(state.learnedItems));
  const unlearned = allItems.filter((i) => !learnedSlugs.has(i.slug));

  if (unlearned.length === 0) return [];

  const recommendations: RecommendationItem[] = [];

  // 1. Identify least studied category
  const stats = getProgressStats(state);
  const categories: CulturalCategory[] = ["bahasa", "musik", "makanan", "pakaian", "tarian"];
  categories.sort((a, b) => stats.categoryCounts[a] - stats.categoryCounts[b]);
  const leastStudiedCategory = categories[0];

  const categoryMatches = unlearned.filter((i) => i.category === leastStudiedCategory);
  if (categoryMatches.length > 0) {
    recommendations.push({
      item: pickDeterministic(categoryMatches, stats.totalLearned * 3 + 1),
      reason: "weak_category",
      badgeText: `Perluas Domain ${leastStudiedCategory.toUpperCase()}`,
    });
  }

  // 2. Identify unexplored provinces
  const exploredProvinces = new Set(Object.values(state.learnedItems).map((i: LearnedItemRecord) => i.provinceId));
  const unexploredMatches = unlearned.filter((i) => !exploredProvinces.has(i.provinceId));
  if (unexploredMatches.length > 0) {
    const picked = pickDeterministic(unexploredMatches, stats.totalLearned * 7 + 2);
    recommendations.push({
      item: picked,
      reason: "unexplored_region",
      badgeText: `Eksplorasi Provinsi Baru: ${picked.provinceName}`,
    });
  }

  // 3. Iconic heritage picks
  const iconicNames = ["gamelan", "batik", "rendang", "tari saman", "reog ponorogo", "sasando", "ulos", "angklung"];
  const iconicMatch = unlearned.find((i) =>
    iconicNames.some((name) => i.name.toLowerCase().includes(name))
  );
  if (iconicMatch && !recommendations.some((r) => r.item.slug === iconicMatch.slug)) {
    recommendations.push({
      item: iconicMatch,
      reason: "popular_heritage",
      badgeText: "Warisan Mahakarya Terkemuka",
    });
  }

  // 4. Fill up to 4 recommendations from unlearned items
  let fillOffset = 0;
  while (recommendations.length < 4 && unlearned.length > recommendations.length && fillOffset < 50) {
    const candidate = pickDeterministic(unlearned, stats.totalLearned * 11 + fillOffset);
    if (!recommendations.some((r) => r.item.slug === candidate.slug)) {
      recommendations.push({
        item: candidate,
        reason: "popular_heritage",
        badgeText: `Warisan ${candidate.provinceName}`,
      });
    }
    fillOffset++;
  }

  return recommendations;
}

/**
 * Clear all stored learning progress (for test or reset functionality).
 */
export function clearStoredProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedData = EMPTY_PROGRESS_DATA;
    isCacheInitialized = true;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: EMPTY_PROGRESS_DATA }));
  } catch (err) {
    console.warn("Failed to clear progress", err);
  }
}
