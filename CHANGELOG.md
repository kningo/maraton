# Changelog

All notable changes to the **JLPT N3 Marathon** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-09-14

### Added
- **Persistent Sequential Locking Mode**:
  - Added `jlpt_n3_allow_free_access` key in `lib/storage.ts` with `getAllowFreeAccess()` and `setAllowFreeAccess()` helpers.
  - Preserved user choice between *Akses Terbuka* (free access) and *Sekuensial* (locked chain access) across page reloads and browser sessions.
  - Added sequential lock warning banner with `"Ke Roadmap"` quick navigation link on `/day/[dayId]` when a locked day is visited directly.
  - Added disabled lock badge (`<Lock size={13} /> Hari X`) for next-day navigation on incomplete days.
- **Kanji Layout Switcher (1 Baris Fokus vs 2 Baris Grid)**:
  - Added responsive display toggle in the Kanji section of daily lesson pages (`/day/[dayId]`).
  - Implemented persistent column preference stored in `localStorage` under `jlpt_n3_kanji_cols` (defaulting to 1-column Focus mode).
- **Simplified JLPT Exam Date Picker**:
  - Replaced multi-button exam wave lists in `TargetConfigModal` with a clean, direct HTML5 date picker (`type="date"`) and formatted weekday badge.
- **Developer Credit & Utility Footer**:
  - Created modular `components/Footer.tsx` displaying copyright `© 2026 xkningo • JLPT Marathon`, subtitle `Dirancang untuk belajar dengan target kebut semalam.`, bug reporting action (`https://xkningo.my.id`), developer contact link, and monospaced `v1.0.0` version pill.

### Changed
- **Minimalist Dashboard & Roadmap Declutter**:
  - Unified search into a single search input bar with `⌘K` / `Ctrl+K` shortcut positioned above the Weekly Roadmap section.
  - Compacted the **Multi-Metric Gamified Tracker** (`TripleProgressTracker`) from heavy padded containers into a streamlined 4-column horizontal card (`Hari Selesai`, `Kanji N3`, `Kosakata`, `Tata Bahasa`), reducing vertical visual dead-space by ~75%.
  - Consolidated roadmap filters into a single-line control bar with week filter pills (`Semua`, `M1`..`M10`) and status filter segment (`Semua`, `Belum Selesai`, `Selesai`).
- **Jukugo (Kanji Compound) Typography**:
  - Increased font size of kanji compounds in `app/day/[dayId]/page.tsx` from `text-base` (16px) to `text-[1.5rem]` (24px).
  - Scaled ruby `<rt>` furigana font size proportionally to `0.9rem` (14.4px) for sharp, effortless readability.
- **DayCard Polish**:
  - Standardized module subtitle typography to `text-xs text-slate-300` with consistent `min-h-[2rem]` baseline.
  - Updated upcoming/locked day label text to `"Belum Terbuka"` and `"Terkunci"`.

### Fixed
- **Navbar Leak in Ambient TV Wall Display & Global Search Modals**:
  - Resolved Tailwind sibling margin injection (`space-y-*` causing `margin-top: 40px` on fixed overlays).
  - Wrapped modal DOM rendering in `createPortal(..., document.body)` with forced `!m-0`, high z-index (`z-[100]`), and body scroll locking (`document.body.style.overflow = "hidden"`).
- **Client Hydration Guard**:
  - Ensured all client components accessing `localStorage` utilize `mounted` guards to eliminate React hydration warnings.

### Removed
- Removed redundant `"Cari Materi N3 [Ctrl+K]"` button beneath the hero CTA block.
- Removed crowded official exam wave preset buttons from `TargetConfigModal`.
- Removed redundant roadmap/flashcards/starred links from the footer in favor of utility and developer actions.

---

## [0.2.0] - 2026-09-13

### Added
- **Dynamic Pacing & Scheduling Engine (`lib/scheduler.ts`)**:
  - Implemented dynamic proportional mathematical formulas (`calculateSliceBounds`) supporting marathon lengths between 30 and 120 days (default: 70 days).
  - Guaranteed contiguous, non-overlapping slices with zero item loss and remainder absorption on the final day.
  - Built instant daily load preview estimators (Kanji/day, Vocab/day, Grammar/day) and automatic 14-day tryout buffer calculation.
- **Target Exam Customization Modal (`components/TargetConfigModal.tsx`)**:
  - Interactive modal allowing users to configure target duration and exam dates with real-time recalculation of pacing metrics.
- **Universal Global Search Engine (`components/GlobalSearchModal.tsx`)**:
  - Multi-entity live search indexing 1,155 vocabulary words, 100 grammar patterns, and 336 kanji simultaneously.
  - Searchable by Hepburn Romaji, Kanji, Kana, and Indonesian translation.
  - Direct day link indicator showing which sprint day covers each search result.
- **Zero-Dependency Romaji Engine (`lib/romaji.ts`)**:
  - Implemented Hepburn Romaji-to-Kana transliteration and query normalization supporting digraphs (`kya`, `sha`, `cha`), sokuon (`っ`), and prolonged vowels.
- **Dual Visual Theme Architecture**:
  - Added **Zen Matcha & Sage** theme (`matcha`) alongside default **Dark Midnight** theme (`dark`).
  - Added synchronous anti-FOUC initialization script in `app/layout.tsx` and reactive theme switcher in `Navbar.tsx`.
- **Audio Pronunciation**:
  - Added `AudioButton.tsx` utilizing Web Speech Synthesis API (`ja-JP` voice) for native audio playback of Japanese words and sentences.

### Changed
- **Curated JLPT N3 Grammar Dataset (`data/grammar.json`)**:
  - Corrected Kana transcription readings (e.g. `g-24` `母に` reading corrected to `ははに`, `g-35` `魅力だ` reading corrected to `みりょくだ`).
  - Upgraded natural sentence nuance for `g-12` (`〜ようになる`).
  - Replaced duplicate patterns with authentic JLPT N3 essentials: `g-84` (`〜にしろ / にせよ`), `g-95` (`〜げ`), `g-96` (`〜まい / まいか`), `g-100` (`〜にかかわらず / にかかわりなく`).
- **Sanitized JLPT N3 Vocabulary Dataset (`data/vocab.json`)**:
  - Stripped 632 synthetic cloned tags (`（関連N）` and `(istilah konteks N)`).
  - Aligned target word mismatches in example sentences (e.g. `v-127` `宿泊`, `v-169` `見つめる`, `v-388` `振込`, `v-401` `人見知り`).
- **Countdown Timer Modernization**:
  - Upgraded countdown timer in `components/CountdownTimer.tsx` to dynamically track configured exam dates and display sprint progress.

### Fixed
- **Furigana Positioning & Layout**:
  - Standardized `<ruby>` and `<rt>` rendering strictly on top of kanji using `ruby-position: over` and `-webkit-ruby-position: before`.
  - Configured line-height padding (`leading-[2.2]` - `leading-[2.4]`) to prevent ruby overlapping across multiline passages.

---

## [0.1.0] - 2026-09-12

### Added
- **Initial Project Architecture**:
  - Setup Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS.
  - Configured `.cursorrules` establishing Priority 0 data immutability, dark-mode design palette, and Japanese text standards.
  - Setup core typography: Inter (UI/Latin), Noto Sans JP (Japanese characters), and JetBrains Mono (numerical counters).
- **Core Dataset Ingestion (`/data`)**:
  - Integrated master JLPT N3 datasets: `kanji.json` (336 characters), `vocab.json` (1,155 words), and `grammar.json` (100 grammar patterns).
- **Client-Side Persistence Layer (`lib/storage.ts`)**:
  - Built zero-dependency `localStorage` state management covering completed days, bookmarks/starred items, quiz scores, study streak, target days, and theme preferences.
  - Implemented custom event bus (`PROGRESS_EVENT_NAME`) for cross-component and cross-tab reactive updates.
- **70-Day Marathon Roadmap (`app/page.tsx`)**:
  - Interactive grid displaying 10 weeks of daily lesson cards (`DayCard.tsx`).
  - Weekly filter tabs and completion status indicators.
- **Daily Lesson Module (`app/day/[dayId]/page.tsx`)**:
  - Comprehensive daily lesson view with Kanji character cards (meanings, radicals, stroke count, Jukugo), vocabulary tables with Indonesian translations, and grammar pattern cards with connection formulas.
  - Furigana bracket parser (`FuriganaText.tsx`) for `Kanji[furigana]` notation.
- **Interactive Daily Micro-Quiz (`components/QuizWidget.tsx`)**:
  - 5-question algorithmic micro-quiz covering Kanji meanings, Jukugo readings, vocabulary translations, and grammar patterns.
  - Instant score calculation, passing threshold (80%), and celebratory confetti via `canvas-confetti`.
- **Interactive Flashcards (`app/flashcards/page.tsx`, `components/FlashcardModal.tsx`)**:
  - 3D flipping flashcards with category filters and keyboard shortcuts (Space to flip, Arrow keys to navigate).
- **Starred Items Review Bank (`app/review/page.tsx`)**:
  - Dedicated revision page for user-bookmarked kanji, vocabulary, and grammar items.
- **Ambient TV Wall Display Mode (`components/WallDisplayModal.tsx`)**:
  - High-contrast fullscreen carousel mode for ambient TV and desktop displays.
