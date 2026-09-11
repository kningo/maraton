"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  Star,
  CheckCircle,
  BookOpen,
  Layers,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import {
  getCompletedDays,
  getBookmarks,
  getStudyStreak,
  resetAllProgress,
  PROGRESS_EVENT_NAME,
} from "../lib/storage";
import { TOTAL_DAYS, getCurriculumStats } from "../data/schedule";

export function ProgressTracker() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [streak, setStreak] = useState<{ current: number; longest: number }>({
    current: 0,
    longest: 0,
  });
  const [stats, setStats] = useState(getCurriculumStats());

  useEffect(() => {
    const update = () => {
      setCompletedDays(getCompletedDays());
      setBookmarks(getBookmarks());
      const s = getStudyStreak();
      setStreak({ current: s.current, longest: s.longest });
    };

    update();
    window.addEventListener(PROGRESS_EVENT_NAME, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const completedCount = completedDays.length;
  const percentage = Math.round((completedCount / TOTAL_DAYS) * 100);

  // Estimates of items covered based on completed days
  const estimatedKanji = Math.min(stats.totalKanji, Math.round((completedCount / TOTAL_DAYS) * stats.totalKanji));
  const estimatedVocab = Math.min(stats.totalVocab, Math.round((completedCount / TOTAL_DAYS) * stats.totalVocab));
  const estimatedGrammar = Math.min(stats.totalGrammar, Math.round((completedCount / TOTAL_DAYS) * stats.totalGrammar));

  const handleReset = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mereset seluruh progress maraton, streak, dan nilai kuis? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      resetAllProgress();
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 shadow-xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Trophy size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Progress Maraton Belajar</h3>
            <p className="text-xs text-slate-400">
              {completedCount} dari {TOTAL_DAYS} modul hari telah diselesaikan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-300">
            <Flame size={18} className="text-amber-400 fill-amber-400/30 animate-pulse" />
            <div className="text-left">
              <span className="block text-[10px] text-amber-400/80 uppercase font-semibold">Streak</span>
              <span className="text-sm font-bold font-mono">{streak.current} Hari</span>
            </div>
          </div>

          {/* Bookmarks Count */}
          <a
            href="/review"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
          >
            <Star size={16} className="text-amber-400 fill-amber-400/40" />
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Starred</span>
              <span className="text-sm font-bold font-mono">{bookmarks.length}</span>
            </div>
          </a>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          <span className="text-slate-300">Target Kurikulum 70 Hari</span>
          <span className="text-emerald-400 font-mono text-sm">{percentage}% Selesai</span>
        </div>
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-500 rounded-full shadow-lg shadow-emerald-500/20"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Mastery Grid */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <BookOpen size={12} className="text-emerald-400" /> Kanji
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-100 font-mono mt-1">
            {estimatedKanji} <span className="text-xs text-slate-500 font-normal">/ {stats.totalKanji}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Layers size={12} className="text-cyan-400" /> Kosakata
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-100 font-mono mt-1">
            {estimatedVocab} <span className="text-xs text-slate-500 font-normal">/ {stats.totalVocab}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <GraduationCap size={12} className="text-indigo-400" /> Tata Bahasa
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-100 font-mono mt-1">
            {estimatedGrammar} <span className="text-xs text-slate-500 font-normal">/ {stats.totalGrammar}</span>
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-5 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
        <span>Rekor Streak Terpanjang: {streak.longest} hari</span>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={11} />
            <span>Reset Progress</span>
          </button>
        )}
      </div>
    </div>
  );
}
