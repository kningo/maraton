"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  Lock,
  Unlock,
  PlayCircle,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Tv,
  ArrowRight,
} from "lucide-react";
import { CountdownTimer } from "../components/CountdownTimer";
import { ProgressTracker } from "../components/ProgressTracker";
import { WallDisplayModal } from "../components/WallDisplayModal";
import { getAllDaysSummary, TOTAL_DAYS, getDailyContent } from "../data/schedule";
import { getCompletedDays, getQuizResults, PROGRESS_EVENT_NAME } from "../lib/storage";
import { FlashcardItem } from "../components/FlashcardModal";

export default function DashboardPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<Record<number, any>>({});
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowFreeAccess, setAllowFreeAccess] = useState(true);
  const [isWallModeOpen, setIsWallModeOpen] = useState(false);
  const [featuredCards, setFeaturedCards] = useState<FlashcardItem[]>([]);

  const allSummaries = useMemo(() => getAllDaysSummary(), []);

  useEffect(() => {
    const update = () => {
      setCompletedDays(getCompletedDays());
      setQuizResults(getQuizResults());
    };

    update();
    window.addEventListener(PROGRESS_EVENT_NAME, update);
    window.addEventListener("storage", update);

    // Preload Day 1 cards for Wall Mode preview
    const d1 = getDailyContent(1);
    const initialWallCards: FlashcardItem[] = [
      ...d1.kanji.map((k) => ({
        id: k.id,
        type: "kanji" as const,
        front: { title: k.kanji, sub: `On: ${k.on || "-"} • Kun: ${k.kun || "-"}`, badge: "Kanji N3" },
        back: { reading: k.on || k.kun, meaning: k.meaning },
      })),
      ...d1.vocab.map((v) => ({
        id: v.id,
        type: "vocab" as const,
        front: { title: v.word, sub: v.reading, badge: v.theme },
        back: { reading: v.reading, meaning: v.meaning, example: v.example },
      })),
      ...d1.grammar.map((g) => ({
        id: g.id,
        type: "grammar" as const,
        front: { title: g.pattern, sub: g.connection, badge: "Grammar N3" },
        back: { meaning: g.meaning, connection: g.connection, example: g.examples[0] ? { ja: g.examples[0].japanese, id: g.examples[0].indonesian } : undefined },
      })),
    ];
    setFeaturedCards(initialWallCards);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  // Find next day to resume
  const nextIncompleteDay = useMemo(() => {
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (!completedDays.includes(d)) return d;
    }
    return 1;
  }, [completedDays]);

  // Filter summaries
  const filteredSummaries = useMemo(() => {
    return allSummaries.filter((day) => {
      // Week filter
      if (selectedWeek !== "all" && day.week !== selectedWeek) {
        return false;
      }
      // Status filter
      const isDone = completedDays.includes(day.dayId);
      if (statusFilter === "completed" && !isDone) return false;
      if (statusFilter === "pending" && isDone) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchDay = `hari ${day.dayId}`.includes(query) || `day ${day.dayId}`.includes(query);
        const matchTheme = day.focus.toLowerCase().includes(query);
        if (!matchDay && !matchTheme) return false;
      }

      return true;
    });
  }, [allSummaries, selectedWeek, statusFilter, searchQuery, completedDays]);

  const totalWeeks = 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles size={14} />
              <span>Program Intensif JLPT N3 Maraton</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100">
              Kuasai N3 dalam{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                70 Hari Belajar
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Struktur materi komprehensif dari 3 referensi terbaik: 336 Kanji, 1100+ Kosakata, dan 100 Pola Tata Bahasa dilengkapi furigana, audio pelafalan, kuis micro berstandar, dan flashcard interaktif.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/day/${nextIncompleteDay}`}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950 hover:from-emerald-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-98"
              >
                <PlayCircle size={20} />
                <span>
                  {completedDays.length === 0
                    ? "Mulai Hari 1 Sekarang"
                    : `Lanjutkan Belajar: Hari ${nextIncompleteDay}`}
                </span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={() => setIsWallModeOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              >
                <Tv size={18} className="text-emerald-400" />
                <span>Mode Wall Ambient TV</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="w-full lg:w-96 space-y-4">
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Progress Tracker Section */}
      <section>
        <ProgressTracker />
      </section>

      {/* 70-Day Matrix Roadmap Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Compass size={22} className="text-emerald-400" />
              <h2 className="text-2xl font-black text-slate-100">
                Matriks Roadmap 70 Hari
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pilih modul hari untuk mempelajari kanji, kosakata, tata bahasa, dan mengerjakan evaluasi kuis harian.
            </p>
          </div>

          {/* Free Access & Search controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hari / tema..."
                className="w-48 sm:w-56 rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Access Mode Toggle */}
            <button
              type="button"
              onClick={() => setAllowFreeAccess((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                allowFreeAccess
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
              title="Aktifkan untuk bebas membuka hari mana pun tanpa urutan berantai"
            >
              {allowFreeAccess ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{allowFreeAccess ? "Mode Bebas Akses" : "Mode Sekuensial"}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Weeks & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Week Tab Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedWeek("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedWeek === "all"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Semua (70 Hari)
            </button>

            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => setSelectedWeek(week)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedWeek === week
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                Mgg {week}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "all" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "pending" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Belum
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === "completed" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* 70 Days Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSummaries.map((day) => {
            const isCompleted = completedDays.includes(day.dayId);
            const isCurrent = day.dayId === nextIncompleteDay;
            const isLocked = !allowFreeAccess && day.dayId > nextIncompleteDay;
            const quiz = quizResults[day.dayId];

            return (
              <div
                key={day.dayId}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                  isCompleted
                    ? "border-emerald-500/40 bg-slate-900/90 shadow-lg shadow-emerald-950/20"
                    : isCurrent
                    ? "border-cyan-500/60 bg-slate-850 ring-2 ring-cyan-500/30 shadow-lg"
                    : isLocked
                    ? "border-slate-850 bg-slate-950/40 opacity-60"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-slate-400">
                      M{day.week}
                    </span>
                    <span className="text-base font-black text-slate-100">
                      Hari {day.dayId}
                    </span>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={16} />
                      </span>
                    ) : isCurrent ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
                        <PlayCircle size={16} />
                      </span>
                    ) : isLocked ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
                        <Lock size={14} />
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 font-mono">
                        Tersedia
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Theme */}
                <div className="my-4">
                  <p className="text-xs font-semibold text-slate-300 line-clamp-1">
                    {day.focus}
                  </p>

                  {/* Modules count chips */}
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 rounded bg-slate-950 px-1.5 py-0.5 border border-slate-800 font-mono">
                      <BookOpen size={11} className="text-emerald-400" />
                      {day.kanjiCount}
                    </span>
                    <span className="flex items-center gap-1 rounded bg-slate-950 px-1.5 py-0.5 border border-slate-800 font-mono">
                      <Layers size={11} className="text-cyan-400" />
                      {day.vocabCount}
                    </span>
                    <span className="flex items-center gap-1 rounded bg-slate-950 px-1.5 py-0.5 border border-slate-800 font-mono">
                      <GraduationCap size={11} className="text-indigo-400" />
                      {day.grammarCount}
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {quiz ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        quiz.passed
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      Kuis: {quiz.score}/{quiz.total}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Belum Kuis</span>
                  )}

                  {isLocked ? (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Lock size={12} />
                      Terkunci
                    </span>
                  ) : (
                    <Link
                      href={`/day/${day.dayId}`}
                      className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                        isCompleted
                          ? "text-emerald-400 hover:text-emerald-300"
                          : isCurrent
                          ? "text-cyan-400 hover:text-cyan-300"
                          : "text-slate-300 hover:text-emerald-400"
                      }`}
                    >
                      <span>{isCompleted ? "Review" : "Pelajari"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSummaries.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-300">
              Tidak ada modul hari yang cocok dengan filter atau pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedWeek("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* Wall Display Mode Modal */}
      <WallDisplayModal
        isOpen={isWallModeOpen}
        onClose={() => setIsWallModeOpen(false)}
        cards={featuredCards}
        dayTitle="JLPT N3 Marathon • Wall Ambient Display"
      />
    </div>
  );
}
