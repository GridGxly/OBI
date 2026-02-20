export type TimbreParam = "dust" | "warmth" | "crunch";

export type TimbreState = Record<TimbreParam, number>; // 0..100

export type SearchResult = {
  id: string;
  title: string;
  audioUrl: string;
  similarity: number; // 0..1
  tags?: string[];
};

export type FiltersState = {
  timbre: TimbreState;
  swing: number; // 0..100 (UI value)
};