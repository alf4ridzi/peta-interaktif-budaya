import { CulturalCategory } from "./culture";

export interface QuizQuestion {
  id: string;
  provinceId: string;
  provinceName: string;
  regencyId?: string;
  category: CulturalCategory;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanationTrivia: string;
  relatedItemSlug?: string;
}

export interface QuizAnswerSubmission {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export type MasteryRank =
  | "Penjelajah Mula"
  | "Pamong Budaya"
  | "Maestro Nusantara";

export function getMasteryRank(percentage: number): {
  rank: MasteryRank;
  description: string;
} {
  if (percentage >= 90) {
    return {
      rank: "Maestro Nusantara",
      description:
        "Penguasaan luar biasa! Anda memahami detail warisan bahasa, instrumen, kuliner, wastra, dan seni tari daerah ini dengan sangat mendalam.",
    };
  }
  if (percentage >= 60) {
    return {
      rank: "Pamong Budaya",
      description:
        "Pemahaman yang kuat! Anda telah mengenali sebagian besar identitas budaya utama yang hidup di wilayah ini.",
    };
  }
  return {
    rank: "Penjelajah Mula",
    description:
      "Langkah awal yang baik! Mari jelajahi kembali dokumen budaya daerah ini untuk memperkaya wawasan Nusantara Anda.",
  };
}

