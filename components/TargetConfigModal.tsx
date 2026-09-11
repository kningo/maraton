"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sliders,
  Calendar,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import {
  getTargetDays,
  setTargetDays,
  DEFAULT_TARGET_DAYS,
  MIN_TARGET_DAYS,
  MAX_TARGET_DAYS,
} from "../lib/storage";
import { getDailyLoadEstimates } from "../lib/scheduler";

interface TargetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (newTargetDays: number) => void;
}

const TARGET_EXAM_DATE = new Date("2026-12-06T09:00:00+09:00");

export function TargetConfigModal({
  isOpen,
  onClose,
  onSave,
}: TargetConfigModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(DEFAULT_TARGET_DAYS);
  const [examAutoDays, setExamAutoDays] = useState<number | null>(null);

  // Load current target days
  useEffect(() => {
    if (isOpen) {
      setSelectedDays(getTargetDays());

      // Calculate days until exam minus 14 days reserved for mock tests
      const now = new Date();
      const diffDays = Math.floor(
        (TARGET_EXAM_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 0) {
        const autoDays = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, diffDays - 14));
        setExamAutoDays(autoDays);
      }
    }
  }, [isOpen]);

  // Dialog lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Modern dialog light dismiss fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isDialogContent) {
        onClose();
      }
    };

    dialog.addEventListener("click", handleBackdropClick);
    return () => dialog.removeEventListener("click", handleBackdropClick);
  }, [onClose]);

  const estimates = getDailyLoadEstimates(selectedDays);

  const presets = [
    { days: 30, label: "30 Hari", sub: "Sprint Kilat", badge: "Tinggi" },
    { days: 45, label: "45 Hari", sub: "Intensif", badge: "Sedang" },
    { days: 60, label: "60 Hari", sub: "Progresif", badge: "Optimal" },
    { days: 70, label: "70 Hari", sub: "Rekomendasi", badge: "Default" },
    { days: 90, label: "90 Hari", sub: "Santai Bertahap", badge: "Rendah" },
  ];

  const handleSave = () => {
    const clamped = Math.max(MIN_TARGET_DAYS, Math.min(MAX_TARGET_DAYS, selectedDays));
    setTargetDays(clamped);
    if (onSave) onSave(clamped);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="target-modal-title"
      {...{ closedby: "any" }}
      className="fixed inset-0 z-50 m-auto h-full w-full max-w-lg bg-transparent p-4 backdrop:bg-slate-950/80 backdrop:backdrop-blur-md outline-none"
    >
      <div className="relative flex flex-col rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sliders size={18} />
            </div>
            <div>
              <h2 id="target-modal-title" className="text-base font-extrabold text-slate-100">
                Kustomisasi Target Durasi Belajar
              </h2>
              <p className="text-xs text-slate-400">
                Porsi harian master dataset akan otomatis disesuaikan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-800 bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Option A: Auto-calculate from Exam Date */}
          {examAutoDays && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock size={14} />
                  <span>Kalkulasi Otomatis Menuju Ujian</span>
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-200 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Ujian 6 Des 2026
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sisa waktu dikurangi 14 hari (dialokasikan khusus untuk tryout/simulasi ujian akhir):
              </p>
              <button
                type="button"
                onClick={() => setSelectedDays(examAutoDays)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedDays === examAutoDays
                    ? "border-amber-400 bg-amber-400/20 text-amber-200 ring-2 ring-amber-400/40"
                    : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-amber-500/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  <span>Gunakan Target Optimal: {examAutoDays} Hari Maraton</span>
                </div>
                <span className="font-mono text-amber-300">{Math.ceil(examAutoDays / 7)} Minggu</span>
              </button>
            </div>
          )}

          {/* Option B: Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Pilihan Preset Durasi Sprint:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((p) => {
                const isSelected = selectedDays === p.days;
                return (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => setSelectedDays(p.days)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-200 ring-2 ring-emerald-500/40 shadow-sm"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-black font-mono">{p.label}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 font-medium">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option C: Custom Slider & Numeric Input */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Atur Jumlah Hari Kustom ({MIN_TARGET_DAYS} - {MAX_TARGET_DAYS} Hari):
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={MIN_TARGET_DAYS}
                  max={MAX_TARGET_DAYS}
                  value={selectedDays}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setSelectedDays(val);
                  }}
                  className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-right text-sm font-bold font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-bold">Hari</span>
              </div>
            </div>

            <input
              type="range"
              min={MIN_TARGET_DAYS}
              max={MAX_TARGET_DAYS}
              step={1}
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>{MIN_TARGET_DAYS} Hari (Intensif)</span>
              <span>70 Hari (Default)</span>
              <span>{MAX_TARGET_DAYS} Hari (Maksimal)</span>
            </div>
          </div>

          {/* Instant Daily Load Preview Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Simulasi Beban Belajar Harian</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                Total {estimates.totalWeeks} Minggu
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <BookOpen size={11} /> Kanji
                </span>
                <p className="text-lg font-black text-slate-100 font-mono mt-0.5">
                  ~{estimates.kanjiPerDay}
                </p>
                <span className="text-[10px] text-slate-400">karakter / hari</span>
              </div>

              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2.5">
                <span className="text-[10px] text-sky-400 font-bold flex items-center justify-center gap-1">
                  <Layers size={11} /> Kosakata
                </span>
                <p className="text-lg font-black text-slate-100 font-mono mt-0.5">
                  ~{estimates.vocabPerDay}
                </p>
                <span className="text-[10px] text-slate-400">kata / hari</span>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
                <span className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
                  <GraduationCap size={11} /> Tata Bahasa
                </span>
                <p className="text-lg font-black text-slate-100 font-mono mt-0.5">
                  ~{estimates.grammarPerDay}
                </p>
                <span className="text-[10px] text-slate-400">pola / hari</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              💡 Jika mengubah target durasi, progress hari yang telah Anda selesaikan tetap tersimpan aman dan rasio persentase akan dihitung ulang secara proporsional.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-750 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-950 transition-all hover:scale-[1.02] active:scale-98"
          >
            Terapkan Target ({selectedDays} Hari)
          </button>
        </div>
      </div>
    </dialog>
  );
}
