"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Layers,
  Star,
  Menu,
  X,
} from "lucide-react";
import {
  getBookmarks,
  getTargetDays,
  getTheme,
  setTheme,
  AppTheme,
  PROGRESS_EVENT_NAME,
} from "../lib/storage";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [targetDays, setTargetDays] = useState(70);
  const [theme, setThemeState] = useState<AppTheme>("dark");

  useEffect(() => {
    const update = () => {
      setBookmarkCount(getBookmarks().length);
      setTargetDays(getTargetDays());
      setThemeState(getTheme());
    };

    update();
    window.addEventListener(PROGRESS_EVENT_NAME, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: AppTheme = theme === "dark" ? "matcha" : "dark";
    setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  const navLinks = [
    { href: "/", label: `Roadmap ${targetDays} Hari`, icon: Compass },
    { href: "/flashcards", label: "Flashcards", icon: Layers },
    { href: "/review", label: "Bank Starred", icon: Star, badge: bookmarkCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/95 border border-slate-700/60 p-0.5 shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Mogu Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors">
                Mogu
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Bite-sized Daily Learning
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links & Theme Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-1.5">
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

          <div className="h-4 w-px bg-slate-800" />

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700/80 bg-slate-900 text-slate-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shadow-sm active:scale-95"
            title={theme === "dark" ? "Aktifkan Mode Zen Matcha" : "Aktifkan Mode Gelap"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <>
                <span className="text-sm">🍵</span>
                <span>Mode Zen</span>
              </>
            ) : (
              <>
                <span className="text-sm">🌙</span>
                <span>Mode Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 text-sm flex items-center justify-center"
            title={theme === "dark" ? "Aktifkan Mode Zen Matcha" : "Aktifkan Mode Gelap"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "🍵" : "🌙"}
          </button>
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

          <div className="pt-2 border-t border-slate-850">
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-850 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{theme === "dark" ? "🍵" : "🌙"}</span>
                <span>{theme === "dark" ? "Ganti ke Mode Zen Matcha" : "Ganti ke Mode Dark"}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                {theme === "dark" ? "Matcha" : "Dark"}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
