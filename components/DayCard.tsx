"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, ArrowRight, Sparkles, Award } from "lucide-react";

export interface DayCardProps {
  dayNumber: number;
  kanjiCount: number;
  vocabCount: number;
  grammarCount: number;
  status: "completed" | "active" | "locked" | "pending";
  theme?: string;
  quizResult?: { score: number; total: number; passed: boolean } | null;
  className?: string;
}

export function DayCard({
  dayNumber,
  kanjiCount,
  vocabCount,
  grammarCount,
  status,
  theme,
  quizResult,
  className = "",
}: DayCardProps) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLocked = status === "locked";
  const isPending = status === "pending";

  const weekNumber = Math.ceil(dayNumber / 7);
  const dayInWeek = ((dayNumber - 1) % 7) + 1;

  const cardContent = (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border py-4 px-3.5 transition-all duration-200 ${
        isActive
          ? "border-emerald-500/80 bg-slate-900/95 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/30"
          : isCompleted
          ? "border-slate-700/60 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/70"
          : isLocked
          ? "border-slate-800/80 bg-slate-900/60 opacity-80 cursor-not-allowed"
          : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700/80 hover:bg-slate-850/80"
      } ${className}`}
    >
      {/* Top Header: Day Anchor & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`text-base sm:text-lg font-black tracking-tight ${
              isActive
                ? "text-emerald-400"
                : isCompleted
                ? "text-slate-100"
                : "text-slate-300"
            }`}
          >
            Hari {dayNumber}
          </h3>

          <div>
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                <Sparkles size={11} className="text-emerald-400" />
                <span>Hari Ini</span>
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 size={11} />
                <span>Selesai ✓</span>
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Lock size={11} />
                <span>Terkunci</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 font-medium">
                W{weekNumber} • D{dayInWeek}
              </span>
            )}
          </div>
        </div>

        {/* Subtitle / Theme (wraps cleanly into 2 lines with min-height) */}
        <div className="mt-2 min-h-[2.5rem] flex items-center">
          <p
            className={`text-xs leading-snug line-clamp-2 ${
              isActive
                ? "font-bold text-slate-100"
                : isCompleted
                ? "font-medium text-slate-300"
                : "font-medium text-slate-400"
            }`}
            title={theme}
          >
            {theme || `Modul Hari ke-${dayNumber}`}
          </p>
        </div>
      </div>

      {/* Middle: Clean Horizontal Material Summary */}
      <div className="my-2.5 pt-2 border-t border-slate-800/50 text-xs font-medium text-slate-400">
        <span className={isActive ? "text-slate-200 font-semibold" : "text-slate-300"}>
          {kanjiCount} Kanji
        </span>
        <span className="mx-1 text-slate-600">•</span>
        <span className={isActive ? "text-slate-200 font-semibold" : "text-slate-300"}>
          {vocabCount} Goi
        </span>
        <span className="mx-1 text-slate-600">•</span>
        <span className={isActive ? "text-slate-200 font-semibold" : "text-slate-300"}>
          {grammarCount} Bunpou
        </span>
      </div>

      {/* Bottom Footer: State-based Action & Quiz Status */}
      {isActive ? (
        <div className="pt-2 border-t border-slate-800/70">
          <div className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <span>Mulai Belajar</span>
            <ArrowRight size={13} />
          </div>
        </div>
      ) : isCompleted ? (
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {quizResult ? (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                quizResult.passed ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              <Award size={12} />
              <span>Kuis {quizResult.score}/{quizResult.total}</span>
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400/80 font-medium">
              Kuis Siap
            </span>
          )}
          <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <span>Ulas</span>
            <ArrowRight size={12} />
          </span>
        </div>
      ) : isLocked ? (
        <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 font-medium">Terkunci</span>
          <Lock size={12} className="text-slate-400" />
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-400 font-medium">Belum dibuka</span>
          <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 flex items-center gap-1 transition-colors">
            <span>Buka</span>
            <ArrowRight size={12} />
          </span>
        </div>
      )}
    </div>
  );

  if (isLocked) {
    return <div className="h-full select-none cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link
      href={`/day/${dayNumber}`}
      className="h-full block focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-2xl"
    >
      {cardContent}
    </Link>
  );
}
