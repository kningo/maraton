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
import { getCompletedDays, getBookmarks, getStudyStreak, PROGRESS_EVENT_NAME } from "../lib/storage";
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
      const cumulative = getCumulativeProgress(completed);
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
      className={`rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 p-6 sm:p-7 shadow-xl ${className}`}
    >
      {/* Header with Gamified Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
            <Trophy size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-100">
                Multi-Metric Gamified Tracker
              </h3>
              <span
                className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${levelColor}`}
              >
                <Sparkles size={11} />
                <span>{levelTitle}</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Pantau penguasaan kumulatif materi N3 yang terhitung otomatis dari modul selesai.
            </p>
          </div>
        </div>

        {/* Streak & Starred Quick Badges */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-amber-300">
            <Flame size={18} className="text-amber-400 fill-amber-400/40 animate-pulse" />
            <div className="text-left">
              <span className="block text-[10px] text-amber-400/90 uppercase font-bold tracking-wider">
                Streak
              </span>
              <span className="text-sm font-extrabold font-mono text-amber-200">
                {streak} Hari
              </span>
            </div>
          </div>

          <a
            href="/review"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
          >
            <Star size={16} className="text-amber-400 fill-amber-400/40" />
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Starred
              </span>
              <span className="text-sm font-extrabold font-mono text-slate-100">
                {starredCount}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Main Overall Days Progress Bar */}
      <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
            <CalendarCheck2 size={16} className="text-emerald-400" />
            <span>Progress Hari Maraton:</span>
            <strong className="text-slate-100 font-mono">
              {progress.completedDaysCount} / {progress.totalDays} Hari
            </strong>
          </span>
          <span className="text-sm font-extrabold font-mono text-emerald-400">
            {overallPct}%
          </span>
        </div>

        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-500 rounded-full shadow-lg shadow-emerald-500/20"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Triple Curriculum Mastery Bars: Kanji, Vocab, Grammar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Metric 1: Kanji Mastery (Emerald) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen size={14} />
                <span>Kanji Mastery</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-300">
                {kanjiPct}%
              </span>
            </div>

            <div className="my-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                {progress.kanjiMastered}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {progress.totalKanji} Kanji
              </span>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-2">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full shadow-sm shadow-emerald-500/30"
              style={{ width: `${kanjiPct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Vocabulary Mastery (Sky/Blue) */}
        <div className="rounded-2xl border border-sky-500/30 bg-slate-950/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers size={14} />
                <span>Vocabulary / Goi</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-sky-300">
                {vocabPct}%
              </span>
            </div>

            <div className="my-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                {progress.vocabMastered}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {progress.totalVocab} Kata
              </span>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-2">
            <div
              className="h-full bg-sky-500 transition-all duration-500 rounded-full shadow-sm shadow-sky-500/30"
              style={{ width: `${vocabPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Grammar Mastery (Amber/Orange) */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <GraduationCap size={14} />
                <span>Grammar / Bunpou</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-amber-300">
                {grammarPct}%
              </span>
            </div>

            <div className="my-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                {progress.grammarMastered}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {progress.totalGrammar} Pola
              </span>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-2">
            <div
              className="h-full bg-amber-500 transition-all duration-500 rounded-full shadow-sm shadow-amber-500/30"
              style={{ width: `${grammarPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
