import { UserProgress, QuizResult, StudyStreak } from "./types";

const STORAGE_KEYS = {
  COMPLETED_DAYS: "jlpt_n3_completed_days",
  BOOKMARKS: "jlpt_n3_bookmarks",
  QUIZ_RESULTS: "jlpt_n3_quiz_results",
  STREAK: "jlpt_n3_streak",
};

export const PROGRESS_EVENT_NAME = "jlpt_n3_storage_update";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function dispatchStorageUpdate() {
  if (isBrowser()) {
    window.dispatchEvent(new Event(PROGRESS_EVENT_NAME));
  }
}

export function getCompletedDays(): number[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading completed days:", err);
    return [];
  }
}

export function isDayCompleted(dayId: number): boolean {
  const completed = getCompletedDays();
  return completed.includes(dayId);
}

export function setDayCompleted(dayId: number, completed: boolean): void {
  if (!isBrowser()) return;
  try {
    const current = getCompletedDays();
    let updated: number[];
    if (completed) {
      if (!current.includes(dayId)) {
        updated = [...current, dayId].sort((a, b) => a - b);
        updateStudyStreak();
      } else {
        updated = current;
      }
    } else {
      updated = current.filter((id) => id !== dayId);
    }
    localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(updated));
    dispatchStorageUpdate();
  } catch (err) {
    console.error("Error setting day completion:", err);
  }
}

export function toggleDayCompletion(dayId: number): boolean {
  const completed = isDayCompleted(dayId);
  setDayCompleted(dayId, !completed);
  return !completed;
}

export function getBookmarks(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading bookmarks:", err);
    return [];
  }
}

export function isBookmarked(id: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.includes(id);
}

export function toggleBookmark(id: string): boolean {
  if (!isBrowser()) return false;
  try {
    const bookmarks = getBookmarks();
    let updated: string[];
    const willBookmark = !bookmarks.includes(id);
    if (willBookmark) {
      updated = [...bookmarks, id];
    } else {
      updated = bookmarks.filter((bId) => bId !== id);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    dispatchStorageUpdate();
    return willBookmark;
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    return false;
  }
}

export function removeBookmark(id: string): void {
  if (!isBrowser()) return;
  try {
    const bookmarks = getBookmarks();
    const updated = bookmarks.filter((bId) => bId !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    dispatchStorageUpdate();
  } catch (err) {
    console.error("Error removing bookmark:", err);
  }
}

export function getQuizResults(): Record<number, QuizResult> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Error reading quiz results:", err);
    return {};
  }
}

export function saveQuizResult(dayId: number, score: number, total: number): QuizResult {
  const passed = score / total >= 0.8;
  const result: QuizResult = {
    score,
    total,
    passed,
    date: new Date().toISOString(),
  };

  if (!isBrowser()) return result;
  try {
    const results = getQuizResults();
    results[dayId] = result;
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results));
    dispatchStorageUpdate();
  } catch (err) {
    console.error("Error saving quiz result:", err);
  }
  return result;
}

export function getStudyStreak(): StudyStreak {
  const fallback: StudyStreak = { current: 0, longest: 0, lastStudyDate: null };
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

export function updateStudyStreak(): StudyStreak {
  if (!isBrowser()) return { current: 0, longest: 0, lastStudyDate: null };
  try {
    const streak = getStudyStreak();
    const today = new Date().toISOString().slice(0, 10);

    if (streak.lastStudyDate === today) {
      return streak; // Already studied today
    }

    if (!streak.lastStudyDate) {
      streak.current = 1;
      streak.longest = Math.max(streak.longest, 1);
      streak.lastStudyDate = today;
    } else {
      const lastDate = new Date(streak.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak.current += 1;
      } else {
        streak.current = 1;
      }
      streak.longest = Math.max(streak.longest, streak.current);
      streak.lastStudyDate = today;
    }

    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    dispatchStorageUpdate();
    return streak;
  } catch (err) {
    console.error("Error updating streak:", err);
    return { current: 1, longest: 1, lastStudyDate: new Date().toISOString().slice(0, 10) };
  }
}

export function getAllProgress(): UserProgress {
  return {
    completedDays: getCompletedDays(),
    bookmarks: getBookmarks(),
    quizResults: getQuizResults(),
    streak: getStudyStreak(),
  };
}

export function resetAllProgress(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_DAYS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    dispatchStorageUpdate();
  } catch (err) {
    console.error("Error resetting progress:", err);
  }
}
