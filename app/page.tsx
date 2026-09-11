"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  PlayCircle,
  Sparkles,
  Search,
  Tv,
  ArrowRight,
  Unlock,
  Lock,
  Calendar,
  CheckCircle2,
  Sliders,
  X,
} from "lucide-react";
import { CountdownTimer } from "../components/CountdownTimer";
import { TripleProgressTracker } from "../components/TripleProgressTracker";
import { DayCard } from "../components/DayCard";
import { WallDisplayModal } from "../components/WallDisplayModal";
import { TargetConfigModal } from "../components/TargetConfigModal";
import {
  getAllDaysSummary,
  getDailyContent,
  getDailyLoadEstimates,
} from "../data/schedule";
import {
  getCompletedDays,
  getQuizResults,
  getTargetDays,
  DEFAULT_TARGET_DAYS,
  PROGRESS_EVENT_NAME,
} from "../lib/storage";
import { FlashcardItem } from "../components/FlashcardModal";

export default function DashboardPage() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [targetDays, setTargetDays] = useState<number>(DEFAULT_TARGET_DAYS);
  const [quizResults, setQuizResults] = useState<Record<number, any>>({});
  const [selectedWeek, setSelectedWeek] = useState<number | "all">(1);
  const [hasUserSelectedWeek, setHasUserSelectedWeek] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowFreeAccess, setAllowFreeAccess] = useState(true);
  const [isWallModeOpen, setIsWallModeOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [featuredCards, setFeaturedCards] = useState<FlashcardItem[]>([]);

  // Dynamically partition master curriculum into targetDays
  const allSummaries = useMemo(() => getAllDaysSummary(targetDays), [targetDays]);
  const estimates = useMemo(() => getDailyLoadEstimates(targetDays), [targetDays]);
  const totalWeeks = useMemo(() => Math.ceil(targetDays / 7), [targetDays]);

  // Compute next incomplete day within current targetDays
  const nextIncompleteDay = useMemo(() => {
    for (let d = 1; d <= targetDays; d++) {
      if (!completedDays.includes(d)) return d;
    }
    return 1;
  }, [completedDays, targetDays]);

  // Synchronize storage
  useEffect(() => {
    const update = () => {
      const completed = getCompletedDays();
      const currentTarget = getTargetDays();
      setCompletedDays(completed);
      setTargetDays(currentTarget);
      setQuizResults(getQuizResults());

      const computedWeeks = Math.ceil(currentTarget / 7);

      // Auto set default active week to the current unfinished day's week (if user hasn't explicitly chosen another)
      if (!hasUserSelectedWeek) {
        let firstUnfinished = 1;
        for (let d = 1; d <= currentTarget; d++) {
          if (!completed.includes(d)) {
            firstUnfinished = d;
            break;
          }
        }
        const activeWeek = Math.min(computedWeeks, Math.ceil(firstUnfinished / 7));
        setSelectedWeek(activeWeek);
      }
    };

    update();
    window.addEventListener(PROGRESS_EVENT_NAME, update);
    window.addEventListener("storage", update);

    // Preload cards for Wall Mode
    const d1 = getDailyContent(1, getTargetDays());
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
        back: {
          meaning: g.meaning,
          connection: g.connection,
          example: g.examples[0]
            ? { ja: g.examples[0].japanese, id: g.examples[0].indonesian }
            : undefined,
        },
      })),
    ];
    setFeaturedCards(initialWallCards);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, [hasUserSelectedWeek]);

  // When totalWeeks shrinks, clamp selectedWeek if outside bounds
  useEffect(() => {
    if (selectedWeek !== "all" && selectedWeek > totalWeeks) {
      setSelectedWeek(totalWeeks);
    }
  }, [totalWeeks, selectedWeek]);

  // Handle manual week selection
  const handleSelectWeek = (week: number | "all") => {
    setSelectedWeek(week);
    setHasUserSelectedWeek(true);
  };

  // Toast notification callback when user alters target days
  const handleTargetSaved = (newDays: number) => {
    setTargetDays(newDays);
    const newWeeks = Math.ceil(newDays / 7);
    if (selectedWeek !== "all" && selectedWeek > newWeeks) {
      setSelectedWeek(newWeeks);
    }
    setToastMessage(
      `Target sprint disesuaikan ke ${newDays} hari (${newWeeks} minggu). Porsi materi harian berhasil dikalkulasi ulang secara proporsional!`
    );
    setTimeout(() => {
      setToastMessage((cur) => (cur?.includes(`${newDays}`) ? null : cur));
    }, 5500);
  };

  // Week statistics helper for pills
  const weekStats = useMemo(() => {
    const stats: Record<number, { completed: number; total: number }> = {};
    for (let w = 1; w <= totalWeeks; w++) {
      const daysInThisWeek = allSummaries.filter((d) => d.week === w);
      const doneCount = daysInThisWeek.filter((d) => completedDays.includes(d.dayId)).length;
      stats[w] = { completed: doneCount, total: daysInThisWeek.length };
    }
    return stats;
  }, [allSummaries, completedDays, totalWeeks]);

  // Filter summaries based on week, status, and search
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

  const nextDaySummary = useMemo(() => {
    return allSummaries.find((d) => d.dayId === nextIncompleteDay) || allSummaries[0];
  }, [allSummaries, nextIncompleteDay]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Non-blocking Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-4 text-slate-100 shadow-2xl backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-emerald-300">Target Belajar Diperbarui!</p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">{toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
                <Sparkles size={14} className="text-emerald-400" />
                <span>Program Intensif JLPT N3 ({targetDays} Hari • {totalWeeks} Minggu)</span>
              </div>

              <button
                type="button"
                onClick={() => setIsTargetModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1 text-xs font-bold text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-slate-800 transition-all shadow-sm"
              >
                <Sliders size={13} className="text-emerald-400" />
                <span>Ubah Sprint Target</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 leading-tight">
              Taklukkan Ujian N3 dengan{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Roadmap Bebas Fatigue
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              336 Kanji, 1155 Kosakata, dan 100 Tata Bahasa terdistribusi adaptif dalam sprint {targetDays} hari. Beban harian terkalibrasi proporsional agar penguasaan materi optimal tanpa rasa lelah.
            </p>

            {/* Daily Load Estimator Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1 text-xs font-medium">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Kanji / Hari
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                  ~{estimates.kanjiPerDay}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">karakter/hari</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Kosakata / Hari
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-cyan-400">
                  ~{estimates.vocabPerDay}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">kata/hari</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Bunpou / Hari
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-indigo-400">
                  ~{estimates.grammarPerDay}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">pola/hari</span>
              </div>
            </div>

            {/* Prominent Sticky Quick Resume Banner */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-950/80 p-3.5 sm:p-4 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/20">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 animate-pulse">
                    <PlayCircle size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] uppercase font-extrabold tracking-wider text-emerald-400 block">
                      Lanjutkan Belajar Sekarang
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-100">
                        Hari ke-{nextIncompleteDay}
                        <span className="text-xs font-normal text-slate-400 ml-1.5 font-mono">
                          dari {targetDays} Hari
                        </span>
                      </span>
                      <span className="text-xs text-slate-300 font-medium line-clamp-1">
                        • {nextDaySummary?.focus}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/day/${nextIncompleteDay}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-md shadow-emerald-950 transition-all hover:scale-[1.02] active:scale-98 shrink-0"
                >
                  <span>Mulai Belajar</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Auxiliary actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsTargetModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-colors"
              >
                <Sliders size={16} className="text-emerald-400" />
                <span>Atur Target Durasi ({targetDays} Hari)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWallModeOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Tv size={16} className="text-emerald-400" />
                <span>Mode Wall Ambient TV</span>
              </button>
            </div>
          </div>

          {/* Exam Countdown Component */}
          <div className="w-full lg:w-96 shrink-0">
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Triple-Metric Gamified Progress Tracker */}
      <section>
        <TripleProgressTracker />
      </section>

      {/* Roadmap & Week-Grouped Navigation Section */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Compass size={24} className="text-emerald-400" />
              <h2 className="text-2xl font-black tracking-tight text-slate-100">
                Roadmap Modul Mingguan
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Pilih tab minggu di bawah ini untuk melihat modul harian yang terbagi proporsional dalam {totalWeeks} minggu ({targetDays} hari total).
            </p>
          </div>

          {/* Search & Free Access Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hari / tema materi..."
                className="w-48 sm:w-60 rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setAllowFreeAccess((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                allowFreeAccess
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
              title="Ganti antara mode bebas pilih hari atau mode terkunci berantai"
            >
              {allowFreeAccess ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{allowFreeAccess ? "Akses Terbuka" : "Sekuensial"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Week-based Tab/Pills Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pilih Minggu Studi:
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {selectedWeek === "all"
                ? `Menampilkan Seluruh ${targetDays} Hari (${totalWeeks} Minggu)`
                : `Minggu ${selectedWeek} (Hari ${(Number(selectedWeek) - 1) * 7 + 1} s.d. ${Math.min(targetDays, Number(selectedWeek) * 7)})`}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All Weeks Pill */}
            <button
              type="button"
              onClick={() => handleSelectWeek("all")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedWeek === "all"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950 font-black ring-2 ring-emerald-400/50"
                  : "bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-850 border border-slate-800"
              }`}
            >
              <Calendar size={14} />
              <span>Semua Minggu ({targetDays} Hari)</span>
            </button>

            {/* Dynamic Week 1 to totalWeeks Pills */}
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
              const stat = weekStats[week];
              const isSelected = selectedWeek === week;
              const isWeekAllDone = stat && stat.total > 0 && stat.completed === stat.total;

              return (
                <button
                  key={week}
                  type="button"
                  onClick={() => handleSelectWeek(week)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-950 font-black ring-2 ring-emerald-400/40"
                      : isWeekAllDone
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40"
                      : "bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-850 border-slate-800"
                  }`}
                >
                  <span>Minggu {week}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? "bg-slate-950/30 text-slate-950 font-extrabold"
                        : isWeekAllDone
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {stat ? `${stat.completed}/${stat.total}` : "0"}
                  </span>
                  {isWeekAllDone && !isSelected && (
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter Toolbar */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === "all" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua Modul
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === "pending" ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Belum Selesai
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === "completed" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sudah Selesai
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Menampilkan <strong className="text-slate-200">{filteredSummaries.length}</strong> modul
          </span>
        </div>

        {/* Responsive Grid Layout
            Mobile (<640px): 1 or 2 columns (grid-cols-1 sm:grid-cols-2)
            Tablet (640px - 1024px): 3 or 4 columns (md:grid-cols-3 lg:grid-cols-4)
            Desktop (>1024px): 7 columns (xl:grid-cols-7), mirroring a natural 7-day weekly calendar
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 sm:gap-4">
          {filteredSummaries.map((day) => {
            const isCompleted = completedDays.includes(day.dayId);
            const isActive = day.dayId === nextIncompleteDay;
            const isLocked = !allowFreeAccess && day.dayId > nextIncompleteDay;
            const quiz = quizResults[day.dayId];

            let cardStatus: "completed" | "active" | "locked" = "active";
            if (isCompleted) {
              cardStatus = "completed";
            } else if (isLocked) {
              cardStatus = "locked";
            } else if (isActive) {
              cardStatus = "active";
            }

            return (
              <DayCard
                key={day.dayId}
                dayNumber={day.dayId}
                kanjiCount={day.kanjiCount}
                vocabCount={day.vocabCount}
                grammarCount={day.grammarCount}
                status={cardStatus}
                theme={day.focus}
                quizResult={quiz}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSummaries.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-300">
            <p className="text-base font-bold text-slate-100">
              Tidak ada modul yang cocok dengan kriteria filter.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Coba reset filter minggu, status kelulusan, atau hapus kata kunci pencarian.
            </p>
            <button
              type="button"
              onClick={() => {
                handleSelectWeek("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* Target Duration Configuration Modal */}
      <TargetConfigModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        onSave={handleTargetSaved}
      />

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
