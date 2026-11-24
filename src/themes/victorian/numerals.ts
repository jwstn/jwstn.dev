// Roman numerals & catalogue copy for the victorian theme.

const TABLE: readonly (readonly [number, string])[] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function roman(n: number): string {
  let value = Math.max(Math.floor(n), 0);
  let out = "";
  for (const [num, sym] of TABLE) {
    while (value >= num) {
      out += sym;
      value -= num;
    }
  }
  return out;
}

// Engraved catalogue lines ("No. IV — On the Construction of…" voice).
// Facts stay true — each line paraphrases the project's own description.
const CATALOGUE_LINES: Record<string, string> = {
  myvinylcollection:
    "Being a forum for the display & keeping of vinyl collections, kept alive by the entries of its users.",
  signlanguage: "Being an app for the learning of sign-language — ASL & DGS — built by its author, for its author.",
  spotui: "Being a terminal client for the browsing & playing of one's Spotify songs and playlists.",
  "yet-another-todo-app": "Being the story of a note app tailored, over many years, to its author's own hand.",
};

export function catalogueLine(id: string, fallback: string): string {
  return CATALOGUE_LINES[id] ?? fallback;
}
