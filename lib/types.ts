export interface KanjiCompound {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiItem {
  id: string;
  kanji: string;
  on: string;
  kun: string;
  meaning: string;
  strokes?: number;
  words: KanjiCompound[];
}

export interface VocabExample {
  ja: string;
  reading?: string;
  id: string;
}

export interface VocabItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  theme: string;
  pos?: string;
  example?: VocabExample;
}

export interface GrammarExample {
  japanese: string;
  reading: string;
  indonesian: string;
}

export interface GrammarItem {
  id: string;
  pattern: string;
  meaning: string;
  connection: string;
  examples: GrammarExample[];
}

export interface QuizQuestion {
  id: string;
  type: "kanji" | "vocab" | "grammar";
  question: string;
  promptSub?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DaySchedule {
  dayId: number;
  title: string;
  focus: string;
  kanji: KanjiItem[];
  vocab: VocabItem[];
  grammar: GrammarItem[];
  quiz: QuizQuestion[];
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  date: string;
}

export interface StudyStreak {
  current: number;
  longest: number;
  lastStudyDate: string | null;
}

export interface UserProgress {
  completedDays: number[];
  bookmarks: string[];
  quizResults: Record<number, QuizResult>;
  streak: StudyStreak;
}

export type BookmarkType = "all" | "kanji" | "vocab" | "grammar";
