"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers,
  Star,
  Tv,
  Menu,
  X,
  Flame,
  Award,
} from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { getBookmarks, getStudyStreak, PROGRESS_EVENT_NAME } from "../lib/storage";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setBookmarkCount(getBookmarks().length);
      setStreakCount(getStudyStreak().current);
    };

    update();
    window.addEventListener(PROGRESS_EVENT_NAME, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Roadmap 70 Hari", icon: Compass },
    { href: "/flashcards", label: "Flashcards", icon: Layers },
    { href: "/review", label: "Bank Starred", icon: Star, badge: bookmarkCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      {/* Top Countdown Ribbon */}
      <div className="border-b border-slate-850 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <CountdownTimer compact />
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame size={13} className="fill-amber-400" />
              <span>Streak: {streakCount} Hari</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">JLPT N3 Sukses 2026</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            N3
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors">
                JLPT N3 Marathon
              </span>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                70 Hari
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-japanese">
              Kanji 336 • Goi 1100+ • Bunpou 100
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-850 text-emerald-400 border border-slate-700/80 shadow-sm"
                    : "text-slate-300 hover:text-slate-100 hover:bg-slate-900"
                }`}
              >
                <Icon size={16} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-amber-300 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-850 bg-slate-950 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-850 text-emerald-400 border border-slate-700"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold font-mono text-amber-300 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
