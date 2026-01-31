# QuantLearn Tasks

> **Project Metadata**
> - **Project Slug**: quantlearn
> - **Total Tasks**: 28 across 6 phases
> - **Focus**: Interactive quantitative trading education platform
> - **Starting Point**: Phase 1 - Project Setup
> - **Key Deliverable**: Fully functional self-hosted learning platform with sequential curriculum, visualizations, and quiz-gated progression

Interactive learning platform for quantitative trading with Brilliant.org-style visual explanations, enforced progression, and hands-on practice.

**Execution Mode**: Sequential
**Source**: Requirements from 2026-01-31

---

## Reference Documents

- REQUIREMENTS.md

---

## Phase 1: Project Setup

- [x] Initialize Next.js 14+ project with App Router, TypeScript 5+, and Tailwind CSS 3+ in `quantlearn/`
- [x] Configure `@next/mdx` for MDX content compilation in `next.config.js`
- [x] Install visx visualization library and `idb` IndexedDB wrapper
- [x] Create project directory structure: `src/app/`, `src/components/visualizations/`, `src/content/`, `src/lib/`, `src/types/`
- [x] Create `start.sh` script that runs `next build - [ ] Create `start.sh` script that runs `next build && next export` and serves `/out` on localhost:3000 using `npx serve`- [ ] Create `start.sh` script that runs `next build && next export` and serves `/out` on localhost:3000 using `npx serve` next export` and serves `/out` on localhost:3000 using `npx serve`

---

## Phase 2: Core Data Structures and Progress System

- [x] Define TypeScript interfaces for `Lesson`, `QuizQuestion`, `Module`, and `LessonProgress` in `src/types/curriculum.ts`
- [x] Create `src/lib/curriculum.ts` with full curriculum structure (6 modules, lesson metadata, quiz placeholders)
- [x] Implement IndexedDB progress store in `src/lib/progress.ts` using `idb` wrapper with `getLessonProgress`, `setLessonProgress`, `getAllProgress` functions
- [x] Add export/import progress functions that handle JSON serialization in `src/lib/progress.ts`
- [x] Create `useProgress` React hook for accessing and updating lesson progress state

---

## Phase 3: Interactive Visualizations (ALL Types - User is Visual Learner)

- [x] Create base chart wrapper component in `src/components/visualizations/ChartWrapper.tsx` with consistent sizing and styling
- [x] Implement line chart with slider controls in `src/components/visualizations/LineChart.tsx` (equity curves, time series, moving averages)
- [x] Implement histogram/distribution chart in `src/components/visualizations/Histogram.tsx` (normal, log-normal, returns)
- [x] Implement scatter plot with annotations in `src/components/visualizations/ScatterPlot.tsx` (correlation, regression, pairs)
- [x] Implement probability tree in `src/components/visualizations/ProbabilityTree.tsx` (interactive node expansion for Bayes)
- [x] Implement matrix/heatmap in `src/components/visualizations/Heatmap.tsx` (correlation matrices, covariance)
- [x] Implement candlestick chart in `src/components/visualizations/CandlestickChart.tsx` (with signal overlays, entry/exit markers)
- [x] Implement order book depth chart in `src/components/visualizations/OrderBook.tsx` (market microstructure)
- [x] Implement equity curve with drawdown in `src/components/visualizations/EquityCurve.tsx` (backtesting results)
- [x] Implement parameter sensitivity heatmap in `src/components/visualizations/SensitivityHeatmap.tsx` (overfitting visualization)
- [x] Implement regime overlay chart in `src/components/visualizations/RegimeChart.tsx` (HMM states on price)
- [x] Implement efficient frontier plot in `src/components/visualizations/EfficientFrontier.tsx` (portfolio optimization)
- [x] Add performance guard to cap data points at 1000 in all visualization components

---

## Phase 4: Quiz and Progression System

- [x] Create `src/components/Quiz.tsx` with multiple choice questions, answer selection, and submit functionality
- [x] Implement quiz validation logic requiring 2/3 correct answers to pass
- [x] Add incorrect answer feedback display (shows which were wrong without revealing correct answers on first attempt)
- [x] Integrate quiz completion with IndexedDB progress store to unlock next lesson
- [x] Create lesson lock/unlock logic based on previous lesson's `quizPassed` status in progress store

---

## Phase 5: UI Components and Navigation

- [x] Create `src/components/ProgressBar.tsx` showing module and overall curriculum completion
- [x] Build lesson navigation sidebar in `src/components/Sidebar.tsx` with completed (checkmark), current (highlight), and locked (lock icon) states
- [x] Create homepage in `src/app/page.tsx` with "Continue where you left off" button showing last incomplete lesson
- [x] Add progress export/import buttons on homepage with JSON file download/upload and IndexedDB unavailability warning
- [x] Implement "Copy for Claude" button component that copies lesson title and context to clipboard with toast confirmation
- [x] Create "Open in Colab" button component for lessons with `colabUrl` that opens in new tab

---

## Phase 6: Content Infrastructure and Lesson Pages

- [x] Create MDX lesson page template in `src/app/lesson/[moduleId]/[lessonId]/page.tsx` with title, module context, and embedded visualizations
- [x] Configure syntax highlighting for code blocks in MDX content
- [x] Create 2-3 sample lessons in `src/content/module-1/` with embedded visualization components and quiz questions
- [x] Build module overview page in `src/app/module/[moduleId]/page.tsx` showing learning objectives and lesson list
- [x] Wire up lesson navigation between lessons within a module with proper lock state enforcement

---

## Notes

- Quiz questions (60-150 total) need authoring as content is developed - consider using Claude to draft initial questions from lesson content
- Colab notebooks managed separately in Google Drive - establish naming convention matching lesson IDs
- Chrome-only testing simplifies visualization QA
- ALL visualization types built upfront - user is a visual learner, every lesson needs interactive visuals
