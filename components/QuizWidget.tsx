"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { QuizQuestion, QuizResult } from "../lib/types";
import { saveQuizResult, getQuizResults, setDayCompleted, isDayCompleted, PROGRESS_EVENT_NAME } from "../lib/storage";

interface QuizWidgetProps {
  dayId: number;
  questions: QuizQuestion[];
  onCompletionChange?: (completed: boolean) => void;
}

export function QuizWidget({
  dayId,
  questions,
  onCompletionChange,
}: QuizWidgetProps) {
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [pastResult, setPastResult] = useState<QuizResult | null>(null);
  const [dayDone, setDayDone] = useState<boolean>(false);

  useEffect(() => {
    const results = getQuizResults();
    if (results[dayId]) {
      setPastResult(results[dayId]);
    }
    setDayDone(isDayCompleted(dayId));

    const handleSync = () => {
      setDayDone(isDayCompleted(dayId));
      const res = getQuizResults();
      if (res[dayId]) setPastResult(res[dayId]);
    };

    window.addEventListener(PROGRESS_EVENT_NAME, handleSync);
    return () => window.removeEventListener(PROGRESS_EVENT_NAME, handleSync);
  }, [dayId]);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQIndex];
  const selectedOption = selectedAnswers[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: idx }));
    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const result = saveQuizResult(dayId, correctCount, questions.length);
    setPastResult(result);
    setIsQuizFinished(true);

    if (result.passed) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error("Confetti error:", err);
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsAnswerSubmitted(false);
    setIsQuizFinished(false);
  };

  const handleMarkDayDone = () => {
    setDayCompleted(dayId, true);
    setDayDone(true);
    if (onCompletionChange) onCompletionChange(true);

    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Evaluasi Akhir Hari
            </span>
            {dayDone && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={13} />
                Hari Ini Sudah Selesai
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-2">
            Micro Quiz Pemahaman Materi (Min. 80%)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Uji pemahaman kanji, kosakata, dan pola tata bahasa hari ini sebelum menyelesaikan hari.
          </p>
        </div>

        {pastResult && (
          <div className="flex items-center gap-3 rounded-2xl bg-slate-950/80 border border-slate-800 p-3 self-start sm:self-auto">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                pastResult.passed
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}
            >
              <Award size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Skor Terakhir</span>
              <span className="text-sm font-bold text-slate-200">
                {pastResult.score} / {pastResult.total} (
                {Math.round((pastResult.score / pastResult.total) * 100)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Body */}
      {!isQuizFinished ? (
        <div className="mt-6">
          {/* Question Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold text-slate-300">
              Pertanyaan {currentQIndex + 1} dari {questions.length}
            </span>
            <span className="uppercase text-[11px] font-bold text-emerald-400">
              Kategori: {currentQ.type}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((currentQIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Prompt */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6 mb-6">
            <h4 className="text-base sm:text-lg font-bold text-slate-100">
              {currentQ.question}
            </h4>
            {currentQ.promptSub && (
              <p className="text-xs sm:text-sm text-amber-300 font-mono mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 inline-block">
                {currentQ.promptSub}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = currentQ.correctIndex === idx;

              let optionStyle = "border-slate-800 bg-slate-850 hover:border-slate-700 text-slate-200";

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  optionStyle = "border-emerald-500/70 bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-500/30";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "border-rose-500/70 bg-rose-500/20 text-rose-200 ring-2 ring-rose-500/30";
                } else {
                  optionStyle = "border-slate-800/60 bg-slate-900/40 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm sm:text-base font-medium ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs text-slate-300 font-bold border border-slate-700">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle size={20} className="text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback & Explanation */}
          {isAnswerSubmitted && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                {selectedOption === currentQ.correctIndex ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Benar Sekali!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <XCircle size={16} /> Jawaban Kurang Tepat
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <span>{currentQIndex + 1 < questions.length ? "Lanjut Soal Berikutnya" : "Lihat Hasil Kuis"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Finished View */
        <div className="mt-8 text-center py-4">
          {pastResult?.passed ? (
            <div className="max-w-md mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4">
                <Sparkles size={36} />
              </div>
              <h4 className="text-2xl font-bold text-slate-100">Selamat! Anda Lulus Kuis!</h4>
              <p className="text-sm text-slate-300 mt-2">
                Skor Anda: <strong className="text-emerald-400 font-bold">{pastResult.score} dari {pastResult.total}</strong> ({Math.round((pastResult.score / pastResult.total) * 100)}%).
                Syarat kelulusan minimal 80% terpenuhi.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-750 transition-colors"
                >
                  <RotateCcw size={16} />
                  Ulangi Kuis
                </button>

                {!dayDone && (
                  <button
                    type="button"
                    onClick={handleMarkDayDone}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-emerald-400 shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <CheckCircle2 size={18} />
                    Tandai Hari {dayId} Selesai!
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-4">
                <HelpCircle size={36} />
              </div>
              <h4 className="text-2xl font-bold text-slate-100">Perlu Pengulangan Materi</h4>
              <p className="text-sm text-slate-300 mt-2">
                Skor Anda: <strong className="text-amber-400 font-bold">{pastResult?.score} dari {pastResult?.total}</strong> ({Math.round(((pastResult?.score || 0) / (pastResult?.total || 1)) * 100)}%).
                Minimal 80% jawaban benar diperlukan untuk membuka penyelesaian hari.
              </p>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-900/30"
                >
                  <RotateCcw size={16} />
                  Coba Kuis Lagi Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
