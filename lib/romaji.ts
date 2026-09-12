/**
 * Lightweight Romaji (Hepburn) to Hiragana converter & search normalizer.
 * Zero external dependencies.
 */

const ROMAJI_TO_HIRAGANA_MAP: Record<string, string> = {
  // Digraphs & trigraphs (3 chars)
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  shi: "し", chi: "ち", tsu: "つ", fu: "ふ",

  // 2-char syllables
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  sa: "さ", si: "し", su: "す", se: "せ", so: "そ",
  ta: "た", ti: "ち", tu: "つ", te: "て", to: "と",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", hu: "ふ", he: "へ", ho: "ほ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  wa: "わ", wo: "を",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  ja: "じゃ", ju: "じゅ", jo: "じょ",

  // Single vowels & n
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  n: "ん",
};

/**
 * Converts romaji text to Hiragana.
 * e.g., "shukuhaku" -> "しゅくはく", "wakenihaitanai" -> "わけにはいかない", "taberu" -> "たべる"
 */
export function romajiToHiragana(romaji: string): string {
  if (!romaji) return "";
  let text = romaji.toLowerCase();

  // Normalize macrons / long vowels
  text = text
    .replace(/ō/g, "ou")
    .replace(/ū/g, "uu")
    .replace(/ā/g, "aa")
    .replace(/ī/g, "ii")
    .replace(/ē/g, "ee");

  let result = "";
  let i = 0;

  while (i < text.length) {
    // Check for double consonants (sokuon っ) except 'nn'
    if (
      i + 1 < text.length &&
      text[i] === text[i + 1] &&
      /[b-df-hj-np-tv-z]/.test(text[i]) &&
      text[i] !== "n"
    ) {
      result += "っ";
      i++;
      continue;
    }

    // Check 3-char chunks
    const c3 = text.substring(i, i + 3);
    if (ROMAJI_TO_HIRAGANA_MAP[c3]) {
      result += ROMAJI_TO_HIRAGANA_MAP[c3];
      i += 3;
      continue;
    }

    // Check 2-char chunks
    const c2 = text.substring(i, i + 2);
    if (ROMAJI_TO_HIRAGANA_MAP[c2]) {
      result += ROMAJI_TO_HIRAGANA_MAP[c2];
      i += 2;
      continue;
    }

    // Check 1-char chunks
    const c1 = text[i];
    // Special check for 'n' followed by a vowel or y
    if (c1 === "n") {
      const next = text[i + 1];
      if (next && (/[aiueoy]/.test(next) || next === "'")) {
        if (next === "'") {
          result += "ん";
          i += 2;
          continue;
        }
      } else {
        result += "ん";
        i++;
        continue;
      }
    }

    if (ROMAJI_TO_HIRAGANA_MAP[c1]) {
      result += ROMAJI_TO_HIRAGANA_MAP[c1];
    } else {
      result += c1;
    }
    i++;
  }

  return result;
}

/**
 * Converts Katakana to Hiragana for uniform Japanese search matching.
 */
export function katakanaToHiragana(text: string): string {
  if (!text) return "";
  return text.replace(/[\u30a1-\u30f6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

/**
 * Normalizes user search query to lowercase and extracts search variants.
 */
export function normalizeSearchQuery(query: string): {
  raw: string;
  lower: string;
  hiragana: string;
} {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const cleanRomaji = lower.replace(/[^a-z0-9]/g, "");
  const hiraganaFromRomaji = romajiToHiragana(cleanRomaji);
  const hiraganaFromKana = katakanaToHiragana(trimmed);

  return {
    raw: trimmed,
    lower,
    hiragana: hiraganaFromRomaji || hiraganaFromKana,
  };
}
