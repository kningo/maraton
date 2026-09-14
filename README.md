# JLPT N3 Marathon (Adaptive Zero-Fatigue Study Engine)

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-green?style=flat)](#)

A high-performance, distraction-free JLPT N3 preparation web application engineered for consistent, long-term retention without cognitive burnout (*zero-fatigue approach*). The application dynamically calibrates daily study loads across **336 Kanji**, **1,155 Vocabulary items**, and **100 Grammar patterns**, offering adaptive pacing ranging from **30 to 120 days** (default: 70-day sprint).

---

## 📑 Table of Contents

- [Core Highlights](#-core-highlights)
- [System Architecture](#-system-architecture)
  - [Next.js 14 App Router](#nextjs-14-app-router)
  - [Client-Side State & Pub/Sub Event Bus](#client-side-state--pubsub-event-bus)
  - [Dynamic Scheduler Mathematical Formulas](#dynamic-scheduler-mathematical-formulas)
- [Project Directory Tree](#-project-directory-tree)
- [Storage Keys Registry](#-storage-keys-registry)
- [Core Developer Constraints & Standards](#-core-developer-constraints--standards)
  - [Priority 0: Strict Data Immutability](#priority-0-strict-data-immutability)
  - [Japanese Typography & HTML `<ruby>` Standards](#japanese-typography--html-ruby-standards)
  - [Hydration Guards & SSR Safety](#hydration-guards--ssr-safety)
- [Getting Started](#-getting-started)
- [License](#-license)

---

## 🌟 Core Highlights

- **Adaptive Sprint Pacing (30–120 Days)**: Dynamic workload slicing recalculates daily Kanji, Vocabulary, and Grammar quotas instantly based on user-defined target durations or custom JLPT exam dates.
- **Cognitive Anti-Fatigue Layout**: Ergonomic dark-mode first design (with Zen Matcha theme support), condensed status bars, and segmented weekly roadmaps to eliminate endless vertical scrolling.
- **Native Ruby Furigana Engine**: Full HTML5 `<ruby>`/`<rt>` annotations strictly positioned on top of Kanji, powered by dynamic bracket parsing `Kanji[furigana]`.
- **Zero-Dependency Universal Search**: Live search across 1,155 vocab, 100 grammar patterns, and 336 kanji with built-in Hepburn Romaji-to-Kana transliteration and Indonesian definition lookup.
- **Multi-Modal Learning Modules**:
  - Daily interactive lessons with Web Speech Japanese audio.
  - Dynamic 5-question micro-quizzes with algorithmic distractors and confetti feedback.
  - Interactive 3D flip flashcards with random shuffle and keyboard shortcuts.
  - Starred items review bank (`Bank Starred`).
  - Ambient Wall TV Mode for passive high-contrast display learning.
- **Persistent Locking Modes**: Switch between free-exploration (*Akses Terbuka*) and strict sequential mastery (*Sekuensial*) with state persisted in `localStorage`.

---

## 🏗️ System Architecture

### Next.js 14 App Router
The project is built on **Next.js 14.2.24** using the React Server Components paradigm alongside tightly-scoped client components:
- `app/layout.tsx`: Root HTML shell with inlined anti-FOUC theme bootstrapping, font declarations, sticky navbar, and footer.
- `app/page.tsx`: Unified dashboard displaying hero countdown, multi-metric gamified progress, universal search toolbar, and weekly roadmap.
- `app/day/[dayId]/page.tsx`: Daily curriculum workspace with Kanji focus switcher (1-column vs 2-column), vocabulary cards, grammar explanations, audio pronunciation, and daily quiz.
- `app/flashcards/page.tsx`: Flashcard module with filterable decks (All, Kanji, Vocab, Grammar).
- `app/review/page.tsx`: Centralized review repository for all bookmarked/starred curriculum items.

### Client-Side State & Pub/Sub Event Bus
To ensure blazing-fast performance and total offline capability without external state dependencies (no Redux, Zustand, or server database overhead), all user data is managed via **native `localStorage`**:
- **Decoupled Architecture (`lib/storage.ts`)**: Pure getter/setter functions handle JSON serialization, schema validation, clamped fallbacks, and error boundaries.
- **Custom Pub/Sub Event Dispatcher**: Whenever any component modifies state, `dispatchStorageUpdate()` broadcasts a window event:
  ```ts
  export const PROGRESS_EVENT_NAME = "jlpt_n3_storage_update";
  
  function dispatchStorageUpdate() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(PROGRESS_EVENT_NAME));
    }
  }
  ```
- All active components subscribe to `PROGRESS_EVENT_NAME` on mount and unsubscribe on unmount, ensuring immediate, reactive UI synchronization across disparate widgets and browser tabs.

### Dynamic Scheduler Mathematical Formulas
The scheduling engine in `lib/scheduler.ts` partitions curriculum datasets into proportional, contiguous, and non-overlapping slices for any arbitrary marathon duration $D \in [30, 120]$:

For day $d \in [1, D]$ and a dataset containing $N$ total items:

$$\text{start}(d) = \left\lfloor \frac{(d - 1) \times N}{D} \right\rfloor$$

$$\text{end}(d) = \begin{cases} N, & \text{if } d = D \\ \left\lfloor \frac{d \times N}{D} \right\rfloor, & \text{if } 1 \le d < D \end{cases}$$

$$\text{count}(d) = \text{end}(d) - \text{start}(d)$$

#### Architectural Invariants:
1. **Contiguous & Non-Overlapping**: $\text{start}(d+1) = \text{end}(d)$ for all $d < D$.
2. **Zero Item Loss**: The final day ($d = D$) explicitly clamps to $N$, absorbing all integer division remainders.
3. **Dynamic Re-indexing**: Changing sprint length (e.g. from 70 days to 45 days) immediately redistributes items dynamically without corrupting historical completion states.

---

## 📂 Project Directory Tree

```text
maraton3/
├── .cursorrules               # Core AI agent rules: Priority 0 immutability, design standards
├── .gitignore                 # Git ignore rules for node_modules, .next, etc.
├── CHANGELOG.md               # Version history and detailed changelog
├── README.md                  # System documentation and developer guide
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and build scripts
├── postcss.config.mjs         # PostCSS plugins configuration
├── tailwind.config.ts         # Tailwind theme, typography, and color tokens
├── tsconfig.json              # TypeScript strict configuration
│
├── app/                       # Next.js 14 App Router routes & pages
│   ├── day/
│   │   └── [dayId]/
│   │       └── page.tsx       # Daily lesson module (Kanji, Vocab, Grammar, Quiz)
│   ├── flashcards/
│   │   └── page.tsx           # Standalone interactive flashcard study suite
│   ├── review/
│   │   └── page.tsx           # Starred items bank and review filter page
│   ├── globals.css            # Tailwind base, dark/matcha theme variables, ruby rules
│   ├── layout.tsx             # Root layout, HTML head, anti-FOUC script, navbar, footer
│   └── page.tsx               # Main dashboard, hero, progress tracker, weekly roadmap
│
├── components/                # Reusable UI widgets and presentation components
│   ├── AudioButton.tsx        # Web Speech Synthesis speech button for Japanese text
│   ├── CountdownTimer.tsx     # Exam target countdown timer with progress indicators
│   ├── DayCard.tsx            # Daily roadmap card with status badges (Locked, Active, Done)
│   ├── FlashcardModal.tsx     # 3D interactive flip flashcard modal with keyboard shortcuts
│   ├── FuriganaSentence.tsx   # Japanese example sentence renderer with ruby furigana
│   ├── FuriganaText.tsx       # Core bracket-notation parser `Kanji[furigana]` to HTML <ruby>
│   ├── GlobalSearchModal.tsx  # Universal search modal with Hepburn Romaji transliteration
│   ├── Navbar.tsx             # Main top navigation with mode links and theme toggle
│   ├── ProgressTracker.tsx    # Single-line progress bar component
│   ├── QuizWidget.tsx         # 5-question micro-quiz with algorithmic distractors & confetti
│   ├── TargetConfigModal.tsx  # Modal for target duration (30-120d) & custom exam date picker
│   ├── TripleProgressTracker.tsx # Compact 4-column gamified dashboard metric summary
│   └── WallDisplayModal.tsx   # Portal-based Ambient TV Wall Display for ambient learning
│
├── data/                      # [STRICTLY IMMUTABLE] Master curriculum datasets
│   ├── grammar.json           # 100 authentic JLPT N3 grammar patterns, formulas, examples
│   ├── kanji.json             # 336 JLPT N3 kanji, on/kun readings, stroke count, jukugo
│   ├── schedule.ts            # Schedule re-exports and dataset helpers
│   └── vocab.json             # 1,155 curated JLPT N3 vocabulary words, themes, examples
│
└── lib/                       # Core business logic, storage, algorithms, types
    ├── romaji.ts              # Zero-dependency Hepburn Romaji-to-Kana normalizer
    ├── scheduler.ts           # Dynamic slicing math, daily quiz generator, load estimator
    ├── storage.ts             # LocalStorage registry, pub/sub dispatcher, date helpers
    └── types.ts               # Core TypeScript interfaces (KanjiItem, VocabItem, DaySchedule)
```

---

## 🔑 Storage Keys Registry

All persistent client data is isolated under the `jlpt_n3_` namespace to avoid key collisions:

| Storage Key | Type | Default Value | Description | Helper Methods |
| :--- | :--- | :--- | :--- | :--- |
| `jlpt_n3_completed_days` | `number[]` (JSON) | `[]` | Array of completed day IDs (e.g. `[1, 2, 5]`) | `getCompletedDays()`, `setDayCompleted()`, `toggleDayCompletion()` |
| `jlpt_n3_bookmarks` | `string[]` (JSON) | `[]` | Array of starred item IDs (`k-*`, `v-*`, `g-*`) | `getBookmarks()`, `isBookmarked()`, `toggleBookmark()`, `removeBookmark()` |
| `jlpt_n3_quiz_results` | `Record<number, QuizResult>` | `{}` | Map of dayId to quiz score, total, date, pass status | `getQuizResults()`, `saveQuizResult()` |
| `jlpt_n3_streak` | `StudyStreak` (JSON) | `{ current: 0, longest: 0, lastStudyDate: null }` | Consecutive study day streak tracking | `getStudyStreak()`, `updateStudyStreak()` |
| `jlpt_n3_target_days` | `number` (stringified) | `70` | Marathon duration in days (clamped: 30–120) | `getTargetDays()`, `setTargetDays()` |
| `jlpt_n3_exam_date` | `string` (ISO) | Upcoming JLPT date | Target JLPT exam date (`YYYY-MM-DD`) | `getExamDate()`, `setExamDate()` |
| `jlpt_n3_theme` | `"dark"` \| `"matcha"` | `"dark"` | Active visual palette theme | `getTheme()`, `setTheme()` |
| `jlpt_n3_allow_free_access` | `"true"` \| `"false"` | `"true"` | Roadmap access mode (`true` = Free, `false` = Sequential) | `getAllowFreeAccess()`, `setAllowFreeAccess()` |
| `jlpt_n3_kanji_cols` | `"1"` \| `"2"` | `"1"` | Daily Kanji section layout (`1` = Focus, `2` = Grid) | Handled in `app/day/[dayId]/page.tsx` |

---

## 🛡️ Core Developer Constraints & Standards

### Priority 0: Strict Data Immutability
- **The `/data` directory is strictly READ-ONLY**.
- Never edit, format, truncate, or delete files inside `/data` (`kanji.json`, `vocab.json`, `grammar.json`).
- All bugfixes, UI customizations, filtering, pagination, and feature developments must be executed strictly within `/app`, `/components`, `/lib`, or `/types`.

### Japanese Typography & HTML `<ruby>` Standards
Furigana provides critical phonetic support for learners and must adhere to strict typographic conventions:
1. **Positioning**: Furigana must **ALWAYS** render directly **ON TOP** of kanji characters, never beside or below them.
   ```css
   ruby, .ruby-position-over {
     ruby-align: center;
     ruby-position: over;
     -webkit-ruby-position: before;
   }
   ```
2. **Bracket Notation Parser**: In sentences and curriculum files, furigana is formatted as `Kanji[furigana]` (e.g. `政治[せいじ]を行う`). Use `components/FuriganaText.tsx` or `components/FuriganaSentence.tsx` to automatically parse these tokens into standard `<ruby><rt>...</rt></ruby>` DOM trees.
3. **Vertical Spacing**: Maintain generous line heights (`leading-[2.2]` to `leading-[2.4]`) on Japanese paragraphs to prevent overlapping between ruby annotations and neighboring text.

### Hydration Guards & SSR Safety
Because Next.js pre-renders pages on the server where `window` and `localStorage` are undefined:
- Always check `typeof window !== "undefined"` before accessing browser APIs.
- Components consuming `localStorage` must utilize a `mounted` state guard to avoid React Hydration Mismatch errors:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <SkeletonLoader />;
  ```
- Root theme bootstrapping is executed synchronously via an inline `<script>` in `app/layout.tsx` to prevent theme flash (FOUC) while setting `suppressHydrationWarning` on `<html>`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17.0 or later
- npm or yarn

### Installation & Development
```bash
# Clone or navigate into the repository
cd maraton3

# Install dependencies
npm install

# Start the local development server (http://localhost:3000)
npm run dev

# Run production build
npm run build

# Start production server
npm start

# Run ESLint validation
npm run lint
```

---

## 📄 License
Private internal curriculum preparation software. All rights reserved.
