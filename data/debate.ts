/**
 * Debate awards by year. Each award is either a team result or a speaker
 * (individual) result. Used by <DebateAccordion />.
 *
 * To update: add a new year key with an array of {tournament, award, type}.
 */

export type AwardType = "team" | "individual";

export interface Award {
  tournament: string;
  award: string;
  type: AwardType;
}

export const DEBATE: Record<number, Award[]> = {
  2026: [
    {
      tournament: "WSDC Team Japan '26",
      award: "Top 8 Candidate",
      type: "team",
    },
    {
      tournament: "Keio Debate Open",
      award: "Rookie Finalist",
      type: "team",
    },
    {
      tournament: "Keio Debate Open",
      award: "2nd Best Speaker",
      type: "individual",
    },
  ],
  2025: [
    { tournament: "PDA", award: "5th Best Team", type: "team" },
    { tournament: "PDA", award: "Best Speaker", type: "individual" },
    { tournament: "KDO", award: "Rookie Finalist", type: "team" },
    { tournament: "KDO", award: "2nd Best Rookie Speaker", type: "individual" },
    { tournament: "Kamalig Novice AP", award: "3rd Breaking Team", type: "team" },
    {
      tournament: "Kamalig Novice AP",
      award: "2nd Best Open Speaker · Best High School Speaker",
      type: "individual",
    },
    { tournament: "Curtin Debate Open", award: "14th Breaking Team (Novice)", type: "team" },
    { tournament: "Curtin Debate Open", award: "5th Best Novice Speaker", type: "individual" },
    { tournament: "TSO 2025", award: "Semifinalist", type: "team" },
    {
      tournament: "TSO 2025",
      award: "7th Best Open Speaker · 3rd Best Novice Speaker",
      type: "individual",
    },
    { tournament: "Calcutta Debate Open", award: "Open Quarterfinalist", type: "team" },
    { tournament: "Vivataam Pre-ABP", award: "Novice Quarter Finalist", type: "team" },
    { tournament: "Vivataam Pre-ABP", award: "6th Best Novice Speaker", type: "individual" },
    { tournament: "Angkor WSDC", award: "Open Semifinalist", type: "team" },
    { tournament: "Angkor WSDC", award: "7th Best Open Speaker", type: "individual" },
  ],
  2024: [
    { tournament: "Sophistry WSDC", award: "Grand Finalist", type: "team" },
    { tournament: "Sophistry WSDC", award: "2nd Best Speaker", type: "individual" },
    { tournament: "HPDU", award: "2nd Best Team", type: "team" },
    { tournament: "HPDU", award: "10th Best Open Speaker", type: "individual" },
    { tournament: "TSO 2024", award: "Open Semifinalist", type: "team" },
    { tournament: "TSO 2024", award: "7th Best Novice Speaker", type: "individual" },
    { tournament: "Henda", award: "2nd Best Attack Speaker", type: "individual" },
    { tournament: "Indo-Pacific ABP", award: "7th Best Novice Team", type: "team" },
    { tournament: "Indo-Pacific ABP", award: "13th Best Novice Speaker", type: "individual" },
    { tournament: "Mixidea", award: "10th Best Team", type: "team" },
  ],
};

export const YEARS_DESC = Object.keys(DEBATE)
  .map(Number)
  .sort((a, b) => b - a);
