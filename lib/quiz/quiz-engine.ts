import { CulturalCategory, CulturalItem } from "@/types/culture";
import { QuizQuestion } from "@/types/quiz";

const CATEGORIES: CulturalCategory[] = [
  "musik",
  "makanan",
  "pakaian",
  "tarian",
  "bahasa",
];

function pseudoShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let currentSeed = Math.abs(seed) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildRegionalQuizSession(
  provinceId: string,
  regencyId: string | null,
  allQuizzes: QuizQuestion[],
  allItems: CulturalItem[],
  answeredQuestionIds?: Set<string> | string[],
  seedOffset: number = 0
): QuizQuestion[] {
  const answered =
    answeredQuestionIds instanceof Set
      ? answeredQuestionIds
      : new Set(answeredQuestionIds || []);

  const provinceQuizzes = allQuizzes.filter((q) => q.provinceId === provinceId);
  const regencyQuizzes = regencyId
    ? provinceQuizzes.filter((q) => q.regencyId === regencyId)
    : [];

  const unansweredRegency = regencyQuizzes.filter((q) => !answered.has(q.id));
  const unansweredProvince = provinceQuizzes.filter((q) => !answered.has(q.id));

  const answeredRegency = regencyQuizzes.filter((q) => answered.has(q.id));
  const answeredProvince = provinceQuizzes.filter((q) => answered.has(q.id));

  const selected: QuizQuestion[] = [];
  const chosenIds = new Set<string>();

  const tryAdd = (q: QuizQuestion): boolean => {
    if (selected.length < 5 && !chosenIds.has(q.id)) {
      selected.push(q);
      chosenIds.add(q.id);
      return true;
    }
    return false;
  };

  // 1. If regency specified, prioritize unanswered questions from this regency
  if (regencyId && unansweredRegency.length > 0) {
    const shuffledReg = pseudoShuffle(unansweredRegency, seedOffset + 17);
    for (const q of shuffledReg) {
      if (selected.length >= 3) break; // Leave room for other provincial questions
      tryAdd(q);
    }
  }

  // 2. Add unanswered questions prioritizing category diversity
  const shuffledUnansweredProv = pseudoShuffle(
    unansweredProvince,
    seedOffset + 31
  );

  for (const cat of CATEGORIES) {
    if (selected.length >= 5) break;
    if (!selected.some((q) => q.category === cat)) {
      const match = shuffledUnansweredProv.find(
        (q) => q.category === cat && !chosenIds.has(q.id)
      );
      if (match) tryAdd(match);
    }
  }

  // 3. Fill up to 5 from any remaining unanswered province questions
  for (const q of shuffledUnansweredProv) {
    if (selected.length >= 5) break;
    tryAdd(q);
  }

  // 4. If user already answered all/most questions in this region (< 5 remaining),
  // fallback to previously answered questions (shuffled) so the quiz is never empty
  if (selected.length < 5) {
    const fallbackPool = pseudoShuffle(
      [...answeredRegency, ...answeredProvince],
      seedOffset + 79
    );
    for (const q of fallbackPool) {
      if (selected.length >= 5) break;
      tryAdd(q);
    }
  }

  // 5. Ultimate fallback if allQuizzes has fewer than 5 total questions for this province:
  // Dynamically synthesize from allItems
  if (selected.length < 5) {
    const regencyItems = regencyId
      ? allItems.filter(
          (item) => item.provinceId === provinceId && item.regencyId === regencyId
        )
      : allItems.filter((item) => item.provinceId === provinceId);

    CATEGORIES.forEach((cat, idx) => {
      if (selected.length >= 5) return;
      if (selected.some((q) => q.category === cat)) return;

      const matching = regencyItems.filter((i) => i.category === cat);
      if (matching.length === 0) return;

      const target = matching[0];
      const distractors = allItems
        .filter((i) => i.category === cat && i.provinceId !== provinceId)
        .slice(idx * 3, idx * 3 + 3)
        .map((i) => i.name);

      while (distractors.length < 3) {
        distractors.push(`Tradisi Nusantara ${distractors.length + 1}`);
      }

      const opts = [...distractors];
      const correctIndex = (Number(regencyId || provinceId) + idx) % 4;
      opts.splice(correctIndex, 0, target.name);

      const safeEscaped = target.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      tryAdd({
        id: `qz-dyn-${target.id}-${cat}`,
        provinceId,
        provinceName: target.provinceName,
        regencyId: target.regencyId,
        category: cat,
        question: `Di wilayah ${target.regencyName || target.provinceName}, warisan budaya kategori ${cat.toUpperCase()} yang memiliki catatan: "${target.summary.replace(new RegExp(safeEscaped, "gi"), "...")}" adalah...`,
        options: [opts[0], opts[1], opts[2], opts[3]],
        correctIndex,
        explanationTrivia: `${target.name} merupakan warisan budaya dari ${target.regencyName ? `${target.regencyName}, ` : ""}Provinsi ${target.provinceName}. ${target.summary}`,
        relatedItemSlug: target.slug,
      });
    });
  }

  return selected.slice(0, 5);
}

