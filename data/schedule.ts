import kanjiData from "./kanji.json";
import vocabData from "./vocab.json";
import grammarData from "./grammar.json";
import {
  KanjiItem,
  VocabItem,
  GrammarItem,
  DaySchedule,
  QuizQuestion,
} from "../lib/types";

export const TOTAL_DAYS = 70;

const typedKanji: KanjiItem[] = kanjiData as KanjiItem[];
const typedVocab: VocabItem[] = vocabData as VocabItem[];
const typedGrammar: GrammarItem[] = grammarData as GrammarItem[];

// Slice range helper guaranteeing zero gap and zero overlap across 70 days
function getSliceRange(dayId: number, totalItems: number, totalDays: number = TOTAL_DAYS) {
  const safeDay = Math.max(1, Math.min(dayId, totalDays));
  const start = Math.floor(((safeDay - 1) * totalItems) / totalDays);
  const end = Math.floor((safeDay * totalItems) / totalDays);
  return { start, end };
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate dynamic 3-5 question micro-quiz for the day
function generateDayQuiz(
  dayId: number,
  kanjiList: KanjiItem[],
  vocabList: VocabItem[],
  grammarList: GrammarItem[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Question 1: Kanji Reading / Meaning
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

  // Question 4: Vocabulary Context / Particle
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

export function getDailyContent(dayId: number): DaySchedule {
  const safeDay = Math.max(1, Math.min(dayId, TOTAL_DAYS));

  const kanjiRange = getSliceRange(safeDay, typedKanji.length, TOTAL_DAYS);
  const vocabRange = getSliceRange(safeDay, typedVocab.length, TOTAL_DAYS);
  const grammarRange = getSliceRange(safeDay, typedGrammar.length, TOTAL_DAYS);

  const dayKanji = typedKanji.slice(kanjiRange.start, kanjiRange.end);
  const dayVocab = typedVocab.slice(vocabRange.start, vocabRange.end);
  const dayGrammar = typedGrammar.slice(grammarRange.start, grammarRange.end);

  const weekNum = Math.ceil(safeDay / 7);
  const dayInWeek = ((safeDay - 1) % 7) + 1;

  const title = `Hari ${safeDay} (Minggu ke-${weekNum}, Hari ke-${dayInWeek})`;
  const focusTheme = dayVocab[0]?.theme || "Kurikulum Inti JLPT N3";
  const focus = `${focusTheme} & Tata Bahasa Terkait`;

  const quiz = generateDayQuiz(safeDay, dayKanji, dayVocab, dayGrammar);

  return {
    dayId: safeDay,
    title,
    focus,
    kanji: dayKanji,
    vocab: dayVocab,
    grammar: dayGrammar,
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

export function getAllDaysSummary(): DaySummary[] {
  const summaries: DaySummary[] = [];

  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const kanjiRange = getSliceRange(d, typedKanji.length, TOTAL_DAYS);
    const vocabRange = getSliceRange(d, typedVocab.length, TOTAL_DAYS);
    const grammarRange = getSliceRange(d, typedGrammar.length, TOTAL_DAYS);

    const weekNum = Math.ceil(d / 7);
    const dayInWeek = ((d - 1) % 7) + 1;
    const dayVocabFirst = typedVocab[vocabRange.start];

    summaries.push({
      dayId: d,
      week: weekNum,
      title: `Hari ${d}`,
      focus: dayVocabFirst?.theme || "Materi JLPT N3",
      kanjiCount: kanjiRange.end - kanjiRange.start,
      vocabCount: vocabRange.end - vocabRange.start,
      grammarCount: grammarRange.end - grammarRange.start,
    });
  }

  return summaries;
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
    totalDays: TOTAL_DAYS,
    totalKanji: typedKanji.length,
    totalVocab: typedVocab.length,
    totalGrammar: typedGrammar.length,
  };
}
