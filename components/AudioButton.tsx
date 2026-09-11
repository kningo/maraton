"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

export function AudioButton({
  text,
  size = "sm",
  className = "",
  title = "Dengarkan pelafalan audio",
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser Anda tidak mendukung Web Speech API.");
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.88; // slightly slower for better learning clarity

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
      setIsPlaying(false);
    }
  };

  const iconSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
  const paddingClass =
    size === "sm"
      ? "p-1.5"
      : size === "md"
      ? "p-2"
      : "p-2.5";

  return (
    <button
      type="button"
      onClick={speak}
      title={title}
      aria-label={`Dengarkan pelafalan: ${text}`}
      className={`inline-flex items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 transition-all hover:border-emerald-500/50 hover:bg-slate-700 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 active:scale-95 ${paddingClass} ${
        isPlaying ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/40" : ""
      } ${className}`}
    >
      <Volume2
        size={iconSize}
        className={isPlaying ? "animate-pulse text-emerald-400" : ""}
      />
    </button>
  );
}
