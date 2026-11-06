/** Home page sections in reading order; ids double as URL anchors. */
export const SECTIONS = [
  { id: "abstract", number: "01" },
  { id: "methods", number: "02" },
  { id: "work", number: "03" },
  { id: "results", number: "04" },
  { id: "correspondence", number: "05" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"] | "references";

export function sectionNumber(id: SectionId): string | undefined {
  return SECTIONS.find((section) => section.id === id)?.number;
}
