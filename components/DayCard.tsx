"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, ArrowRight, Sparkles, Award } from "lucide-react";

export interface DayCardProps {
  dayNumber: number;
  kanjiCount: number;
  vocabCount: number;
  grammarCount: number;
  status: "completed" | "active" | "locked";
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

  const weekNumber = Math.ceil(dayNumber / 7);
  const dayInWeek = ((dayNumber - 1) % 7) + 1;

  const cardContent = (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isActive
          ? "border-emerald-500/80 bg-slate-850 ring-2 ring-emerald-500 shadow-xl shadow-emerald-950/50 scale-[1.01]"
          : isCompleted
          ? "border-emerald-500/30 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900/90 shadow-sm"
          : isLocked
          ? "border-slate-800/80 bg-slate-950/50 opacity-75 cursor-not-allowed"
          : "border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850/90 shadow-sm"
      } ${className}`}
    >
      {/* Top Header: Day & Status Indicator */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold tracking-wider uppercase ${
                isActive
                  ? "text-emerald-400"
                  : isCompleted
                  ? "text-emerald-400/80"
                  : "text-slate-400"
              }`}
            >
              W{weekNumber} • D{dayInWeek}
            </span>
          </div>

          <div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                <CheckCircle2 size={12} />
                <span>Selesai</span>
              </span>
            ) : isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-300 animate-pulse">
                <Sparkles size={12} />
                <span>Aktif</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                <Lock size={12} />
              </span>
            )}
          </div>
        </div>

        {/* Day Title & High-Contrast Theme */}
        <div className="mt-2.5">
          <h3 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-1.5">
            <span>Hari {dayNumber}</span>
          </h3>

          {theme && (
            <p className="text-xs font-medium text-slate-200 mt-1 line-clamp-1">
              {theme}
            </p>
          )}
        </div>
      </div>

      {/* Middle: Clean Three-Badge Counters */}
      <div className="my-3.5 flex flex-wrap items-center gap-1.5">
        {/* Kanji badge - emerald */}
        <span className="inline-flex items-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[11px] font-bold text-emerald-300 font-mono">
          {kanjiCount} Kanji
        </span>

        {/* Goi badge - sky */}
        <span className="inline-flex items-center rounded-lg bg-sky-500/15 border border-sky-500/30 px-2 py-1 text-[11px] font-bold text-sky-300 font-mono">
          {vocabCount} Goi
        </span>

        {/* Bunpou badge - amber */}
        <span className="inline-flex items-center rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-[11px] font-bold text-amber-300 font-mono">
          {grammarCount} Bunpou
        </span>
      </div>

      {/* Bottom Footer: Quiz result or action link */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {quizResult ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              quizResult.passed
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
            }`}
          >
            <Award size={11} />
            <span>Kuis {quizResult.score}/{quizResult.total}</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">
            {isLocked ? "Terkunci" : "Belum Kuis"}
          </span>
        )}

        {!isLocked && (
          <span
            className={`font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5 ${
              isActive
                ? "text-emerald-400"
                : isCompleted
                ? "text-slate-300 group-hover:text-emerald-400"
                : "text-slate-300 group-hover:text-emerald-400"
            }`}
          >
            <span>{isCompleted ? "Ulas" : "Mulai"}</span>
            <ArrowRight size={13} />
          </span>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="h-full select-none">{cardContent}</div>;
  }

  return (
    <Link href={`/day/${dayNumber}`} className="h-full block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl">
      {cardContent}
    </Link>
  );
}
