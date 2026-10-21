import { CulturalCategory, CulturalItem } from "@/types/culture";
import { QuizQuestion } from "@/types/quiz";

export function buildRegionalQuizSession(
  provinceId: string,
  regencyId: string | null,
  allQuizzes: QuizQuestion[],
  allItems: CulturalItem[]
): QuizQuestion[] {
  const provinceQuizzes = allQuizzes.filter((q) => q.provinceId === provinceId);

  if (!regencyId) {
    return provinceQuizzes.slice(0, 5);
  }

  // Try building regency-prioritized questions first
  const regencyItems = allItems.filter(
    (item) => item.provinceId === provinceId && item.regencyId === regencyId
  );

  const dynamicQuestions: QuizQuestion[] = [];
  const categories: CulturalCategory[] = [
    "musik",
    "makanan",
    "pakaian",
    "tarian",
    "bahasa",
  ];

  categories.forEach((cat, idx) => {
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
    const correctIndex = (Number(regencyId) + idx) % 4;
    opts.splice(correctIndex, 0, target.name);

    dynamicQuestions.push({
      id: `qz-reg-${regencyId}-${cat}`,
      provinceId,
      provinceName: target.provinceName,
      regencyId,
      category: cat,
      question: `Di wilayah ${target.regencyName || target.provinceName}, warisan budaya kategori ${cat.toUpperCase()} yang memiliki catatan: "${target.summary.replace(new RegExp(target.name, "gi"), "...")}" adalah...`,
      options: [opts[0], opts[1], opts[2], opts[3]],
      correctIndex,
      explanationTrivia: `${target.name} merupakan warisan budaya dari ${target.regencyName ? `${target.regencyName}, ` : ""}Provinsi ${target.provinceName}. ${target.summary}`,
      relatedItemSlug: target.slug,
    });
  });

  // Fallback aggregation (REQ-QZ-006): supplement with parent province questions up to 5
  const combined = [...dynamicQuestions];
  for (const pq of provinceQuizzes) {
    if (combined.length >= 5) break;
    if (!combined.some((q) => q.category === pq.category)) {
      combined.push(pq);
    }
  }
  for (const pq of provinceQuizzes) {
    if (combined.length >= 5) break;
    if (!combined.some((q) => q.id === pq.id)) {
      combined.push(pq);
    }
  }

  return combined.slice(0, 5);
}

