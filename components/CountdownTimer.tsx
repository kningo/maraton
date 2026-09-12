"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import {
  getCompletedDays,
  getTargetDays,
  PROGRESS_EVENT_NAME,
  getExamDate,
  parseExamDate,
  formatExamDateLabel,
  formatExamDateCompact,
  formatExamDateMedium,
  getUpcomingOfficialDates,
} from "../lib/storage";

interface CountdownTimerProps {
  compact?: boolean;
  className?: string;
}

export function CountdownTimer({ compact = false, className = "" }: CountdownTimerProps) {
  const [examDate, setExamDate] = useState<string>(getExamDate());
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

    const updateState = () => {
      setCompletedCount(getCompletedDays().length);
      setTargetDays(getTargetDays());
      const currentExam = getExamDate();
      setExamDate(currentExam);
      runCalculation(currentExam);
    };

    const runCalculation = (dateStrToUse?: string) => {
      const activeExamStr = dateStrToUse || getExamDate();
      const targetDate = parseExamDate(activeExamStr);
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

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

    updateState();
    window.addEventListener(PROGRESS_EVENT_NAME, updateState);
    window.addEventListener("storage", updateState);

    const interval = setInterval(() => {
      runCalculation();
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(PROGRESS_EVENT_NAME, updateState);
      window.removeEventListener("storage", updateState);
    };
  }, []);

  // Pace and progress calculations
  const safeTargetDays = Math.max(1, targetDays);
  const remainingStudyDays = Math.max(0, safeTargetDays - completedCount);
  const daysUntilExam = timeLeft.days;
  const progressPercent = Math.min(100, Math.round((completedCount / safeTargetDays) * 100));

  const upcomingOfficial = getUpcomingOfficialDates();
  const matchedOfficial = upcomingOfficial.find((o) => o.dateStr === examDate);
  const waveBadgeText = matchedOfficial
    ? `(${matchedOfficial.subLabel.replace("Sesi ", "")})`
    : "(Target Kustom)";

  let paceLabel = "On Track";
  let paceBadgeClass = "bg-emerald-950/60 border-emerald-800/60 text-emerald-400";
  let pulseDotClass = "bg-emerald-400";
  let paceNoteIcon = "✓";
  let paceNoteText = "Ritme belajar ideal untuk target ujian ini.";
  let paceNoteColor = "text-emerald-400/90";

  const daysPerModule = Math.max(1, Math.floor(daysUntilExam / Math.max(1, remainingStudyDays)));

  if (timeLeft.isPast) {
    paceLabel = "Hari Ujian Tiba";
    paceBadgeClass = "bg-amber-950/60 border-amber-800/60 text-amber-400";
    pulseDotClass = "bg-amber-400";
    paceNoteIcon = "⚠️";
    paceNoteText = "Tanggal ujian telah tiba atau telah terlewati.";
    paceNoteColor = "text-amber-400/90";
  } else if (completedCount >= safeTargetDays) {
    paceLabel = "Maraton Selesai! 🎉";
    paceBadgeClass = "bg-emerald-950/60 border-emerald-800/60 text-emerald-400";
    pulseDotClass = "bg-emerald-400";
    paceNoteIcon = "🎉";
    paceNoteText = "Seluruh kurikulum maraton telah selesai dikuasai.";
    paceNoteColor = "text-emerald-400/90";
  } else if (daysUntilExam < remainingStudyDays) {
    paceLabel = "Behind Schedule";
    paceBadgeClass = "bg-amber-950/60 border-amber-800/60 text-amber-400";
    pulseDotClass = "bg-amber-400";
    paceNoteIcon = "⚠️";
    paceNoteText = `Perlu menyelesaikan ~1 modul tiap ${daysPerModule} hari kalender.`;
    paceNoteColor = "text-amber-400/90";
  } else if (daysUntilExam > remainingStudyDays * 1.5) {
    paceLabel = "Ahead of Schedule";
    paceBadgeClass = "bg-cyan-950/60 border-cyan-800/60 text-cyan-400";
    pulseDotClass = "bg-cyan-400";
    paceNoteIcon = "🚀";
    paceNoteText = "Ritme belajar sangat cepat dan melampaui target.";
    paceNoteColor = "text-cyan-400/90";
  } else {
    paceLabel = "On Track";
    paceBadgeClass = "bg-emerald-950/60 border-emerald-800/60 text-emerald-400";
    pulseDotClass = "bg-emerald-400";
    paceNoteIcon = "✓";
    paceNoteText = "Ritme belajar ideal untuk target ujian ini.";
    paceNoteColor = "text-emerald-400/90";
  }

  if (!mounted) {
    if (compact) {
      return (
        <div className={`flex items-center gap-3 text-xs sm:text-sm animate-pulse ${className}`}>
          <div className="h-4 w-36 rounded bg-slate-800/60" />
          <div className="h-4 w-16 rounded-full bg-slate-800/60" />
        </div>
      );
    }

    return (
      <div className={`animate-pulse rounded-2xl bg-slate-900/90 border border-slate-800/80 p-5 h-full ${className}`}>
        <div className="h-5 w-32 rounded bg-slate-800/60 mb-3" />
        <div className="h-7 w-48 rounded bg-slate-800/60 mb-5" />
        <div className="grid grid-cols-4 gap-2.5 my-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-800/50" />
          ))}
        </div>
        <div className="h-4 w-full rounded bg-slate-800/50 mt-4" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 text-xs sm:text-sm ${className}`}>
        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
          <Calendar size={14} className="text-amber-400" />
          <span>JLPT {formatExamDateCompact(examDate)}:</span>
          <span className="font-bold text-amber-400 font-mono">
            {timeLeft.isPast ? (
              "Hari Ujian Telah Tiba!"
            ) : (
              `${timeLeft.days}h ${timeLeft.hours}j ${timeLeft.minutes}m`
            )}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${paceBadgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${pulseDotClass} animate-pulse`} />
          {paceLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg h-full ${className}`}
    >
      {/* Header Section */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Jadwal Ujian Resmi
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${paceBadgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pulseDotClass} animate-pulse`} />
            {paceLabel}
          </span>
        </div>

        <div className="flex items-baseline gap-2 whitespace-nowrap overflow-hidden">
          <h3 className="text-base font-bold text-slate-100 truncate">
            {formatExamDateMedium(examDate)}
          </h3>
          <span className="text-xs text-slate-400 font-normal shrink-0">
            {waveBadgeText}
          </span>
        </div>
      </div>

      {/* Countdown Grid */}
      <div className="grid grid-cols-4 gap-2.5 my-4">
        {[
          {
            label: "HARI",
            val: String(timeLeft.isPast ? 0 : timeLeft.days),
            color: "text-amber-400",
          },
          {
            label: "JAM",
            val: String(timeLeft.isPast ? 0 : timeLeft.hours).padStart(2, "0"),
            color: "text-slate-100",
          },
          {
            label: "MENIT",
            val: String(timeLeft.isPast ? 0 : timeLeft.minutes).padStart(2, "0"),
            color: "text-slate-100",
          },
          {
            label: "DETIK",
            val: String(timeLeft.isPast ? 0 : timeLeft.seconds).padStart(2, "0"),
            color: "text-emerald-400",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 border border-slate-800/70 rounded-xl py-2.5 flex flex-col items-center justify-center"
          >
            <span className={`text-2xl font-black font-mono leading-none ${item.color}`}>
              {item.val}
            </span>
            <span className="text-[9px] tracking-widest text-slate-400 font-semibold mt-1.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer / Progress Tracker */}
      <div className="pt-3 border-t border-slate-800/60 space-y-2">
        {/* Row 1: Label and Value */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Progres Maraton</span>
          <span className="font-semibold text-slate-200">
            {completedCount} dari {safeTargetDays} Hari{" "}
            <span className="text-slate-500 font-normal">({progressPercent}%)</span>
          </span>
        </div>

        {/* Row 2: Sleek 1.5-unit Progress Bar */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Row 3: Single-line Status Badge */}
        <p className={`text-[11px] flex items-center gap-1.5 pt-0.5 whitespace-nowrap overflow-hidden text-ellipsis ${paceNoteColor}`}>
          <span className="shrink-0">{paceNoteIcon}</span>
          <span className="truncate">{paceNoteText}</span>
        </p>
      </div>
    </div>
  );
}

export default CountdownTimer;
