export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatTitleCase(text: string): string {
  if (!text) return "";
  const minorWords = new Set(["di", "ke", "dari", "dan", "atau", "yang"]);
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (word === "dki" || word === "di" && index === 0) return word.toUpperCase();
      if (index > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Strips any residual source citation lines such as "Sumber Data: ...",
 * "* **Sumber Terverifikasi:** ...", or "Sumber: ..." from AI responses.
 */
export function stripSourceDataLines(text: string): string {
  if (!text) return "";
  return text
    .replace(/^[ \t]*(?:[*-]\s*)?\*{0,2}(?:sumber\s+data|sumber\s+terverifikasi|sumber\s+informasi|sumber\s+arsip|sumber)\*{0,2}\s*:?.*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

