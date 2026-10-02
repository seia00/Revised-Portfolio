/**
 * The three words, read out inside <HandsPlate /> as the picture assembles.
 *
 * `style` is the word's own typographic treatment and travels with it, so the
 * same word is set the same way wherever it appears.
 */

export interface Word {
  word: string;
  numeral: string;
  syllables: string;
  ipa: string;
  definition: string;
  style: string;
}

export const WORDS: Word[] = [
  {
    word: "Relentless",
    numeral: "i.",
    syllables: "re·lent·less",
    ipa: "/rɪˈlɛnt.ləs/",
    definition: "Unyielding in pursuit; refusing to slow down or give up.",
    style: "font-sans font-extrabold uppercase tracking-[-0.035em]",
  },
  {
    word: "Curious",
    numeral: "ii.",
    syllables: "cu·ri·ous",
    ipa: "/ˈkjʊə.ri.əs/",
    definition: "Eager to know or learn something; compelled to ask why.",
    style: "font-serif italic tracking-[-0.02em]",
  },
  {
    word: "Driven",
    numeral: "iii.",
    syllables: "driv·en",
    ipa: "/ˈdrɪv.ən/",
    definition: "Propelled by an inner need to reach a goal.",
    style: "font-sans font-extrabold uppercase tracking-[-0.035em] text-outline",
  },
];
