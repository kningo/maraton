import kanjiData from "../data/kanji.json";
import vocabData from "../data/vocab.json";
import grammarData from "../data/grammar.json";
import {
  KanjiItem,
  VocabItem,
  GrammarItem,
  DaySchedule,
  QuizQuestion,
} from "./types";
import { DEFAULT_TARGET_DAYS, MIN_TARGET_DAYS, MAX_TARGET_DAYS } from "./storage";

export const typedKanji: KanjiItem[] = kanjiData as KanjiItem[];
export const typedVocab: VocabItem[] = vocabData as VocabItem[];
export const typedGrammar: GrammarItem[] = grammarData as GrammarItem[];

export interface SliceBounds {
  start: number;
  end: number;
  count: number;
}

/**
 * Computes proportional, non-overlapping boundary indices for any dataset length
 * partitioned across dynamic totalDays, cleanly handling remainders on the final day.
 */
export function calculateSliceBounds(
  dayNumber: number,
  totalItems: number,
  totalDays: number = DEFAULT_TARGET_DAYS
): SliceBounds {
  const safeTotalDays = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, totalDays));
  const safeDay = Math.max(1, Math.min(dayNumber, safeTotalDays));

  const start = Math.floor(((safeDay - 1) * totalItems) / safeTotalDays);
  const end =
    safeDay === safeTotalDays
      ? totalItems
      : Math.floor((safeDay * totalItems) / safeTotalDays);

  const clampedStart = Math.min(start, totalItems);
  const clampedEnd = Math.min(Math.max(clampedStart, end), totalItems);

  return {
    start: clampedStart,
    end: clampedEnd,
    count: clampedEnd - clampedStart,
  };
}

/**
 * Returns the exact daily sliced slices of Kanji, Vocab, and Grammar
 * for any given dayNumber and user-configured totalDays.
 */
export function getDailySlice(
  dayNumber: number,
  totalDays: number = DEFAULT_TARGET_DAYS
): {
  kanji: KanjiItem[];
  vocab: VocabItem[];
  grammar: GrammarItem[];
} {
  const kanjiBounds = calculateSliceBounds(dayNumber, typedKanji.length, totalDays);
  const vocabBounds = calculateSliceBounds(dayNumber, typedVocab.length, totalDays);
  const grammarBounds = calculateSliceBounds(dayNumber, typedGrammar.length, totalDays);

  return {
    kanji: typedKanji.slice(kanjiBounds.start, kanjiBounds.end),
    vocab: typedVocab.slice(vocabBounds.start, vocabBounds.end),
    grammar: typedGrammar.slice(grammarBounds.start, grammarBounds.end),
  };
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate dynamic 3-5 question micro-quiz tailored to the day's sliced content
function generateDayQuiz(
  dayId: number,
  kanjiList: KanjiItem[],
  vocabList: VocabItem[],
  grammarList: GrammarItem[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Question 1: Kanji Meaning
  if (kanjiList.length > 0) {
    const targetKanji = kanjiList[0];
    const otherMeanings = typedKanji
      .filter((k) => k.id !== targetKanji.id)
      .slice(0, 10)
      .map((k) => k.meaning);
    const randomDistractors = shuffle(otherMeanings).slice(0, 3);
    const options = shuffle([targetKanji.meaning, ...randomDistractors]);

    questions.push({
      id: `q-day${dayId}-k1`,
      type: "kanji",
      question: `Apa arti dan makna dari kanji 「${targetKanji.kanji}」?`,
      promptSub: targetKanji.on ? `Onyomi: ${targetKanji.on}` : undefined,
      options,
      correctIndex: options.indexOf(targetKanji.meaning),
      explanation: `Kanji 「${targetKanji.kanji}」 memiliki arti "${targetKanji.meaning}". Onyomi: ${targetKanji.on || "-"}, Kunyomi: ${targetKanji.kun || "-"}.`,
    });
  }

  // Question 2: Kanji Compound (Jukugo)
  if (kanjiList.length > 1 && kanjiList[1].words && kanjiList[1].words.length > 0) {
    const kItem = kanjiList[1];
    const targetWord = kItem.words[0];
    const fakeReadings = [
      targetWord.reading.replace(/([あいうえお])/g, "ん"),
      targetWord.reading + "い",
      targetWord.reading.slice(0, -1) + "う",
    ].filter((r) => r !== targetWord.reading);

    const otherReadings = typedVocab
      .filter((v) => v.reading !== targetWord.reading)
      .slice(0, 6)
      .map((v) => v.reading);

    const distractors = shuffle([...fakeReadings, ...otherReadings]).slice(0, 3);
    const options = shuffle([targetWord.reading, ...distractors]);

    questions.push({
      id: `q-day${dayId}-k2`,
      type: "kanji",
      question: `Bagaimana cara membaca kata majemuk 「${targetWord.word}」?`,
      promptSub: `Arti: ${targetWord.meaning}`,
      options,
      correctIndex: options.indexOf(targetWord.reading),
      explanation: `Kata 「${targetWord.word}」 dibaca「${targetWord.reading}」 yang berarti "${targetWord.meaning}".`,
    });
  }

  // Question 3: Vocabulary Translation
  if (vocabList.length > 0) {
    const targetVocab = vocabList[Math.floor(vocabList.length / 2)];
    const otherMeanings = typedVocab
      .filter((v) => v.id !== targetVocab.id)
      .slice(0, 15)
      .map((v) => v.meaning);
    const distractors = shuffle(otherMeanings).slice(0, 3);
    const options = shuffle([targetVocab.meaning, ...distractors]);

    questions.push({
      id: `q-day${dayId}-v1`,
      type: "vocab",
      question: `Pilihlah terjemahan bahasa Indonesia yang tepat untuk kata 「${targetVocab.word}」 (${targetVocab.reading}):`,
      promptSub: targetVocab.example ? `Contoh: ${targetVocab.example.ja}` : undefined,
      options,
      correctIndex: options.indexOf(targetVocab.meaning),
      explanation: `「${targetVocab.word}」 (${targetVocab.reading}) berarti "${targetVocab.meaning}".`,
    });
  }

  // Question 4: Vocabulary Reading
  if (vocabList.length > 1) {
    const targetVocab2 = vocabList[0];
    const otherReadings = typedVocab
      .filter((v) => v.id !== targetVocab2.id)
      .slice(0, 10)
      .map((v) => v.reading);
    const distractors = shuffle(otherReadings).slice(0, 3);
    const options = shuffle([targetVocab2.reading, ...distractors]);

    questions.push({
      id: `q-day${dayId}-v2`,
      type: "vocab",
      question: `Bagaimana cara membaca kosakata 「${targetVocab2.word}」?`,
      promptSub: `Arti: ${targetVocab2.meaning}`,
      options,
      correctIndex: options.indexOf(targetVocab2.reading),
      explanation: `Kosakata 「${targetVocab2.word}」 dibaca "${targetVocab2.reading}" dan artinya adalah "${targetVocab2.meaning}".`,
    });
  }

  // Question 5: Grammar Pattern & Meaning
  if (grammarList.length > 0) {
    const targetGrammar = grammarList[0];
    const otherGrammarMeanings = typedGrammar
      .filter((g) => g.id !== targetGrammar.id)
      .slice(0, 10)
      .map((g) => g.meaning);
    const distractors = shuffle(otherGrammarMeanings).slice(0, 3);
    const options = shuffle([targetGrammar.meaning, ...distractors]);

    questions.push({
      id: `q-day${dayId}-g1`,
      type: "grammar",
      question: `Pilihlah makna yang tepat untuk pola tata bahasa 「${targetGrammar.pattern}」:`,
      promptSub: `Rumus sambungan: ${targetGrammar.connection}`,
      options,
      correctIndex: options.indexOf(targetGrammar.meaning),
      explanation: `Pola 「${targetGrammar.pattern}」 digunakan untuk menyatakan: "${targetGrammar.meaning}". Sambungan: ${targetGrammar.connection}.`,
    });
  }

  return questions;
}

/**
 * Returns integrated daily lesson content for any dayId under dynamic totalDays
 */
export function getDailyContent(
  dayId: number,
  totalDays: number = DEFAULT_TARGET_DAYS
): DaySchedule {
  const safeTotalDays = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, totalDays));
  const safeDay = Math.max(1, Math.min(dayId, safeTotalDays));

  const { kanji, vocab, grammar } = getDailySlice(safeDay, safeTotalDays);

  const weekNum = Math.ceil(safeDay / 7);
  const dayInWeek = ((safeDay - 1) % 7) + 1;

  const title = `Hari ${safeDay} (Minggu ke-${weekNum}, Hari ke-${dayInWeek})`;
  const focusTheme = vocab[0]?.theme || "Kurikulum Inti JLPT N3";
  const focus = `${focusTheme} & Tata Bahasa Terkait`;

  const quiz = generateDayQuiz(safeDay, kanji, vocab, grammar);

  return {
    dayId: safeDay,
    title,
    focus,
    kanji,
    vocab,
    grammar,
    quiz,
  };
}

export interface DaySummary {
  dayId: number;
  week: number;
  title: string;
  focus: string;
  kanjiCount: number;
  vocabCount: number;
  grammarCount: number;
}

/**
 * Generates summary array for all days dynamically scaled to totalDays
 */
export function getAllDaysSummary(
  totalDays: number = DEFAULT_TARGET_DAYS
): DaySummary[] {
  const safeTotalDays = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, totalDays));
  const summaries: DaySummary[] = [];

  for (let d = 1; d <= safeTotalDays; d++) {
    const kBounds = calculateSliceBounds(d, typedKanji.length, safeTotalDays);
    const vBounds = calculateSliceBounds(d, typedVocab.length, safeTotalDays);
    const gBounds = calculateSliceBounds(d, typedGrammar.length, safeTotalDays);

    const weekNum = Math.ceil(d / 7);
    const dayVocabFirst = typedVocab[vBounds.start];

    summaries.push({
      dayId: d,
      week: weekNum,
      title: `Hari ${d}`,
      focus: dayVocabFirst?.theme || "Materi JLPT N3",
      kanjiCount: kBounds.count,
      vocabCount: vBounds.count,
      grammarCount: gBounds.count,
    });
  }

  return summaries;
}

/**
 * Computes dynamic cumulative mastery based on completed days and target duration
 */
export function getCumulativeProgress(
  completedDays: number[],
  totalDays: number = DEFAULT_TARGET_DAYS
) {
  const safeTotalDays = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, totalDays));
  let kanjiMastered = 0;
  let vocabMastered = 0;
  let grammarMastered = 0;

  const validDays = completedDays.filter((d) => d >= 1 && d <= safeTotalDays);

  validDays.forEach((d) => {
    const kBounds = calculateSliceBounds(d, typedKanji.length, safeTotalDays);
    const vBounds = calculateSliceBounds(d, typedVocab.length, safeTotalDays);
    const gBounds = calculateSliceBounds(d, typedGrammar.length, safeTotalDays);

    kanjiMastered += kBounds.count;
    vocabMastered += vBounds.count;
    grammarMastered += gBounds.count;
  });

  return {
    completedDaysCount: validDays.length,
    totalDays: safeTotalDays,
    kanjiMastered: Math.min(typedKanji.length, kanjiMastered),
    totalKanji: typedKanji.length,
    vocabMastered: Math.min(typedVocab.length, vocabMastered),
    totalVocab: typedVocab.length,
    grammarMastered: Math.min(typedGrammar.length, grammarMastered),
    totalGrammar: typedGrammar.length,
  };
}

/**
 * Returns instant preview estimates of daily load for target configuration UI
 */
export function getDailyLoadEstimates(totalDays: number) {
  const safeTotalDays = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, totalDays));
  const kanjiPerDay = (typedKanji.length / safeTotalDays).toFixed(1);
  const vocabPerDay = (typedVocab.length / safeTotalDays).toFixed(1);
  const grammarPerDay = (typedGrammar.length / safeTotalDays).toFixed(1);
  const totalWeeks = Math.ceil(safeTotalDays / 7);

  return {
    totalDays: safeTotalDays,
    totalWeeks,
    kanjiPerDay: parseFloat(kanjiPerDay),
    vocabPerDay: parseFloat(vocabPerDay),
    grammarPerDay: parseFloat(grammarPerDay),
  };
}

export function findItemById(id: string): {
  type: "kanji" | "vocab" | "grammar";
  item: KanjiItem | VocabItem | GrammarItem;
} | null {
  if (id.startsWith("k-")) {
    const found = typedKanji.find((k) => k.id === id);
    if (found) return { type: "kanji", item: found };
  } else if (id.startsWith("v-")) {
    const found = typedVocab.find((v) => v.id === id);
    if (found) return { type: "vocab", item: found };
  } else if (id.startsWith("g-")) {
    const found = typedGrammar.find((g) => g.id === id);
    if (found) return { type: "grammar", item: found };
  }
  return null;
}

export function getCurriculumStats() {
  return {
    totalKanji: typedKanji.length,
    totalVocab: typedVocab.length,
    totalGrammar: typedGrammar.length,
  };
}
