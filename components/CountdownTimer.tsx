"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { getCompletedDays, getTargetDays, PROGRESS_EVENT_NAME } from "../lib/storage";

interface CountdownTimerProps {
  compact?: boolean;
  className?: string;
}

const TARGET_EXAM_DATE = new Date("2026-12-06T09:00:00+09:00");

export function CountdownTimer({ compact = false, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const [completedCount, setCompletedCount] = useState<number>(0);
  const [targetDays, setTargetDays] = useState<number>(70);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateCompleted = () => {
      setCompletedCount(getCompletedDays().length);
      setTargetDays(getTargetDays());
    };

    updateCompleted();
    window.addEventListener(PROGRESS_EVENT_NAME, updateCompleted);
    window.addEventListener("storage", updateCompleted);

    const calculateTime = () => {
      const now = new Date();
      const diff = TARGET_EXAM_DATE.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(PROGRESS_EVENT_NAME, updateCompleted);
      window.removeEventListener("storage", updateCompleted);
    };
  }, []);

  // Pace calculations
  const safeTargetDays = Math.max(1, targetDays);
  const remainingStudyDays = Math.max(0, safeTargetDays - completedCount);
  const daysUntilExam = timeLeft.days;

  let paceStatus: "ahead" | "on-track" | "behind" | "completed" = "on-track";
  let paceLabel = "On Track";
  let paceColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  if (completedCount >= safeTargetDays) {
    paceStatus = "completed";
    paceLabel = "Maraton Selesai! 🎉";
    paceColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  } else if (daysUntilExam < remainingStudyDays) {
    paceStatus = "behind";
    paceLabel = "Behind Schedule";
    paceColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  } else if (daysUntilExam > remainingStudyDays * 1.5) {
    paceStatus = "ahead";
    paceLabel = "Ahead of Schedule";
    paceColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  } else {
    paceStatus = "on-track";
    paceLabel = "On Track";
    paceColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  }

  if (!mounted) {
    return (
      <div className={`animate-pulse rounded-xl bg-slate-800/40 p-4 ${className}`}>
        <div className="h-6 w-48 rounded bg-slate-700/50"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 text-xs sm:text-sm ${className}`}>
        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
          <Calendar size={14} className="text-amber-400" />
          <span>JLPT 6 Des 2026:</span>
          <span className="font-bold text-amber-400 font-mono">
            {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${paceColor}`}
        >
          {paceStatus === "behind" ? (
            <AlertTriangle size={11} />
          ) : (
            <CheckCircle2 size={11} />
          )}
          {paceLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-5 sm:p-6 shadow-xl backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock size={22} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Countdown Ujian Resmi JLPT N3
            </h3>
            <p className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Minggu, 6 Desember 2026</span>
              <span className="text-xs font-normal text-slate-400 hidden sm:inline">
                (Sesi Gelombang 2)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${paceColor}`}
          >
            {paceStatus === "behind" ? (
              <AlertTriangle size={13} />
            ) : paceStatus === "ahead" ? (
              <TrendingUp size={13} />
            ) : (
              <CheckCircle2 size={13} />
            )}
            {paceLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-5">
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 sm:p-3.5">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-amber-400">
            {timeLeft.days}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">HARI</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 sm:p-3.5">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-slate-200">
            {String(timeLeft.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">JAM</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 sm:p-3.5">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-slate-200">
            {String(timeLeft.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">MENIT</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/60 p-2 sm:p-3.5">
          <span className="text-2xl sm:text-4xl font-extrabold font-mono text-emerald-400">
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">DETIK</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <span>Target Maraton:</span>
          <strong className="text-slate-200 font-medium">
            {completedCount} dari {targetDays} Hari Selesai
          </strong>
          <span className="text-slate-500">
            ({Math.round((completedCount / safeTargetDays) * 100)}%)
          </span>
        </div>
        <div className="text-slate-400">
          {paceStatus === "behind" ? (
            <span className="text-amber-400">
              ⚠️ Perlu menyelesaikan ~1 hari belajar tiap {Math.max(1, Math.floor(daysUntilExam / Math.max(1, remainingStudyDays)))} hari kalender.
            </span>
          ) : (
            <span className="text-emerald-400/90">
              ✓ Ritme belajar Anda ideal untuk menguasai N3 sebelum hari H!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
