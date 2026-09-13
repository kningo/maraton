"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  Star,
  BookOpen,
  Layers,
  GraduationCap,
  CalendarCheck2,
  Sparkles,
  Award,
} from "lucide-react";
import { getCompletedDays, getBookmarks, getStudyStreak, getTargetDays, PROGRESS_EVENT_NAME } from "../lib/storage";
import { getCumulativeProgress } from "../data/schedule";

export function TripleProgressTracker({ className = "" }: { className?: string }) {
  const [progress, setProgress] = useState({
    completedDaysCount: 0,
    totalDays: 70,
    kanjiMastered: 0,
    totalKanji: 336,
    vocabMastered: 0,
    totalVocab: 1155,
    grammarMastered: 0,
    totalGrammar: 100,
  });

  const [streak, setStreak] = useState(0);
  const [starredCount, setStarredCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const completed = getCompletedDays();
      const tDays = getTargetDays();
      const cumulative = getCumulativeProgress(completed, tDays);
      setProgress(cumulative);

      const s = getStudyStreak();
      setStreak(s.current);

      const b = getBookmarks();
      setStarredCount(b.length);
    };

    update();
    window.addEventListener(PROGRESS_EVENT_NAME, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const overallPct = Math.round((progress.completedDaysCount / progress.totalDays) * 100);
  const kanjiPct = Math.round((progress.kanjiMastered / progress.totalKanji) * 100);
  const vocabPct = Math.round((progress.vocabMastered / progress.totalVocab) * 100);
  const grammarPct = Math.round((progress.grammarMastered / progress.totalGrammar) * 100);

  // Gamification Level Title
  let levelTitle = "N3 Rookie (Pemula)";
  let levelColor = "text-slate-300 border-slate-700 bg-slate-800/80";
  if (overallPct >= 100) {
    levelTitle = "N3 Champion! 🏆";
    levelColor = "text-emerald-300 border-emerald-500/50 bg-emerald-500/20";
  } else if (overallPct >= 75) {
    levelTitle = "Exam Ready Veteran";
    levelColor = "text-emerald-400 border-emerald-500/40 bg-emerald-500/15";
  } else if (overallPct >= 50) {
    levelTitle = "Marathon Strategist";
    levelColor = "text-sky-300 border-sky-500/40 bg-sky-500/15";
  } else if (overallPct >= 25) {
    levelTitle = "Grammar & Kanji Challenger";
    levelColor = "text-amber-300 border-amber-500/40 bg-amber-500/15";
  } else if (overallPct > 0) {
    levelTitle = "Active Runner";
    levelColor = "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  }

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 py-3 px-4 sm:px-5 shadow-lg ${className}`}
    >
      {/* Header: Gamified Level & Compact Quick Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Trophy size={15} />
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-100">
            Progress Maraton N3
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-bold ${levelColor}`}
          >
            <Sparkles size={10} />
            <span>{levelTitle}</span>
          </span>
        </div>

        {/* Streak & Starred Quick Badges */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300 font-mono font-bold">
            <Flame size={13} className="text-amber-400 fill-amber-400/40 animate-pulse" />
            <span>{streak} Hari Streak</span>
          </div>

          <a
            href="/review"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-colors font-mono font-bold"
            title="Buka Bank Review & Flashcard Berbintang"
          >
            <Star size={13} className="text-amber-400 fill-amber-400/40" />
            <span>{starredCount} Starred</span>
          </a>
        </div>
      </div>

      {/* Merged Streamlined 4-Metric Progress Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 pt-2.5">
        {/* Metric 1: Overall Days */}
        <div className="rounded-xl border border-emerald-500/20 bg-slate-950/60 p-2 sm:p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <CalendarCheck2 size={12} />
              <span>Hari Selesai</span>
            </span>
            <span className="font-mono text-emerald-300">{overallPct}%</span>
          </div>
          <div className="my-1 flex items-baseline gap-1 font-mono">
            <span className="text-base sm:text-lg font-black text-slate-100">
              {progress.completedDaysCount}
            </span>
            <span className="text-[10px] text-slate-400">/ {progress.totalDays} Hari</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Kanji */}
        <div className="rounded-xl border border-emerald-500/20 bg-slate-950/60 p-2 sm:p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <BookOpen size={12} />
              <span>Kanji N3</span>
            </span>
            <span className="font-mono text-emerald-300">{kanjiPct}%</span>
          </div>
          <div className="my-1 flex items-baseline gap-1 font-mono">
            <span className="text-base sm:text-lg font-black text-slate-100">
              {progress.kanjiMastered}
            </span>
            <span className="text-[10px] text-slate-400">/ {progress.totalKanji} Kanji</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${kanjiPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Vocabulary */}
        <div className="rounded-xl border border-sky-500/20 bg-slate-950/60 p-2 sm:p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-sky-400 flex items-center gap-1">
              <Layers size={12} />
              <span>Kosakata</span>
            </span>
            <span className="font-mono text-sky-300">{vocabPct}%</span>
          </div>
          <div className="my-1 flex items-baseline gap-1 font-mono">
            <span className="text-base sm:text-lg font-black text-slate-100">
              {progress.vocabMastered}
            </span>
            <span className="text-[10px] text-slate-400">/ {progress.totalVocab} Kata</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${vocabPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Grammar */}
        <div className="rounded-xl border border-amber-500/20 bg-slate-950/60 p-2 sm:p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-amber-400 flex items-center gap-1">
              <GraduationCap size={12} />
              <span>Tata Bahasa</span>
            </span>
            <span className="font-mono text-amber-300">{grammarPct}%</span>
          </div>
          <div className="my-1 flex items-baseline gap-1 font-mono">
            <span className="text-base sm:text-lg font-black text-slate-100">
              {progress.grammarMastered}
            </span>
            <span className="text-[10px] text-slate-400">/ {progress.totalGrammar} Pola</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${grammarPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
