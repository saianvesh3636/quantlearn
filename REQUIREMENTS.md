# QuantLearn Requirements

> **Quick Summary**
> - **Building**: Interactive quantitative trading education platform with Brilliant.org-style visual learning
> - **For**: Single user (personal learning tool) - aspiring quant trader learning from scratch
> - **Core Features**: Sequential curriculum (math → strategies), quiz-gated progression, interactive visualizations, Colab notebooks
> - **Tech**: Static Next.js, visx visualizations, MDX content, IndexedDB progress
> - **Scope**: Medium MVP (~30-50 lessons across 6 modules)

## Overview

QuantLearn is a self-hosted interactive learning platform that teaches quantitative trading through visual explanations, enforced sequencing (math foundations before strategies), and hands-on practice. It follows the pedagogical approach used by Brilliant.org and professional quant firms. The platform runs locally via `./start.sh` and integrates with Claude Code for contextual help.

## Must Have (MVP)

### Feature 1: Sequential Curriculum with Enforced Progression
- Description: 6 modules that must be completed in order, with lessons unlocking only after passing the previous lesson's quiz
- Acceptance Criteria:
  - [ ] Module 1 (Math Foundations) is unlocked by default
  - [ ] Each lesson requires passing a 2-3 question quiz (2/3 correct) to unlock the next
  - [ ] Locked lessons show as grayed out with lock icon
  - [ ] Completed lessons remain accessible for review
  - [ ] Progress persists across browser sessions via IndexedDB
- Technical Notes: Curriculum defined in `curriculum.ts` with typed lesson/module structure

### Feature 2: Interactive Visualizations (EVERY LESSON)
- Description: EVERY lesson must have interactive visualizations - user is a visual learner
- Acceptance Criteria:
  - [ ] Line chart with sliders (equity curves, time series, moving averages)
  - [ ] Histogram/distribution chart (normal, log-normal, return distributions)
  - [ ] Scatter plot with annotations (correlation, regression, pairs trading)
  - [ ] Probability tree (interactive node expansion for Bayes theorem)
  - [ ] Matrix/heatmap visualization (correlation matrices, covariance)
  - [ ] Candlestick chart with signal overlays (trend strategies, entry/exit)
  - [ ] Order book depth chart (market microstructure)
  - [ ] Equity curve with drawdown overlay (backtesting results)
  - [ ] Parameter sensitivity heatmap (overfitting visualization)
  - [ ] Regime overlay chart (HMM states on price)
  - [ ] Efficient frontier plot (portfolio optimization)
  - [ ] All visualizations update in real-time as sliders change
  - [ ] Visualizations render correctly in Chrome
- Technical Notes: Use visx (D3 wrapper for React). Cap data points at 1000 for performance. ALL visualization types needed from day one.

### Feature 3: Quiz-Gated Lesson Completion
- Description: Multiple choice quizzes that gate progression to the next lesson
- Acceptance Criteria:
  - [ ] Each lesson ends with 2-3 multiple choice questions
  - [ ] User must answer 2/3 correctly to mark lesson complete
  - [ ] Incorrect answers show which were wrong (no correct answer reveal on first attempt)
  - [ ] Unlimited retries allowed
  - [ ] Quiz passed status stored in IndexedDB
- Technical Notes: Simple React form component. No backend validation. Questions hand-authored per lesson.

### Feature 4: Progress Persistence and Backup
- Description: Learning progress saved locally with export/import capability
- Acceptance Criteria:
  - [ ] Progress stored in IndexedDB (lesson completion, quiz pass status)
  - [ ] "Continue where you left off" button on homepage shows last incomplete lesson
  - [ ] "Export Progress" button downloads JSON file
  - [ ] "Import Progress" button restores from JSON file
  - [ ] Warning shown if IndexedDB unavailable (private browsing)
- Technical Notes: Use `idb` wrapper for IndexedDB. Progress data structure: `{lessonId: {completed: boolean, quizPassed: boolean, completedAt?: Date}}`

### Feature 5: MDX Lesson Content with Embedded Visualizations
- Description: Lessons authored in MDX (Markdown + React components)
- Acceptance Criteria:
  - [ ] Lessons render markdown prose with embedded React visualization components
  - [ ] Syntax highlighting for code blocks
  - [ ] Lessons load from `/content/module-X/lesson-Y.mdx` structure
  - [ ] Each lesson displays title, module context, and estimated reading content
- Technical Notes: Use `@next/mdx` for compilation. Each lesson is a standalone MDX file.

### Feature 6: Colab Notebook Links (Optional Enrichment)
- Description: Links to Google Colab notebooks for hands-on Python practice
- Acceptance Criteria:
  - [ ] Lessons with Colab notebooks show "Open in Colab" button
  - [ ] Button opens notebook in new browser tab
  - [ ] Notebooks use synthetic data (no licensing issues)
  - [ ] Expected outputs documented in notebook for self-verification
  - [ ] Completing Colab is NOT required for progression (optional enrichment)
- Technical Notes: Notebooks managed manually in Google Drive. No programmatic verification of completion.

### Feature 7: Copy for Claude Integration
- Description: Button to copy lesson context for use with Claude Code CLI
- Acceptance Criteria:
  - [ ] "Copy for Claude" button on each lesson
  - [ ] Copies lesson title, current section, and relevant context to clipboard
  - [ ] Does NOT include file paths or system information
  - [ ] Confirmation toast shown after copy
- Technical Notes: Clipboard API. Content-only, no sensitive data.

### Feature 8: Simple Local Deployment
- Description: One command to run the entire platform locally
- Acceptance Criteria:
  - [ ] `./start.sh` starts the platform on localhost:3000
  - [ ] Works on macOS with Chrome
  - [ ] No external services required (fully offline after build)
  - [ ] Static files served from `/out` directory
- Technical Notes: `next build && next export` creates static site. `start.sh` runs `npx serve out/ -l 3000`.

## Should Have (Post-MVP)

### Math Foundations Diagnostic Quiz
- Description: 10-question quiz to skip Module 1 for users with existing math knowledge
- Acceptance Criteria:
  - [ ] Offered before starting Module 1
  - [ ] Passing (8/10 correct) unlocks Module 2 directly
  - [ ] Failing allows normal progression through Module 1
- Technical Notes: Same quiz component, just longer. Results stored in IndexedDB.

### Learning Objectives Display
- Description: Show what user will learn before starting each module
- Acceptance Criteria:
  - [ ] Module overview page shows 3-5 learning objectives
  - [ ] "After this module, you'll be able to..." format
- Technical Notes: Stored in `curriculum.ts` per module.

### Lesson Navigation Sidebar
- Description: Persistent sidebar showing curriculum structure and progress
- Acceptance Criteria:
  - [ ] Shows all modules and lessons
  - [ ] Visual indicators: completed (checkmark), current (highlight), locked (lock icon)
  - [ ] Click to navigate to any completed lesson
- Technical Notes: React sidebar component reading from progress store.

## Nice to Have (Future)

### Spaced Repetition Reminders
- Email or notification reminders to review past concepts
- Requires external service integration

### Local Jupyter Option
- Run notebooks locally instead of Colab
- Adds setup complexity (Python environment, kernel management)

### Progress Analytics
- Time spent per lesson
- Quiz attempt history
- Learning velocity tracking

## Out of Scope

- **Multi-user support** - Single user only, no authentication
- **Real market data** - Synthetic data only (avoids licensing complexity)
- **Automated Colab verification** - No programmatic check of notebook completion
- **Mobile support** - Chrome desktop only
- **Cross-browser support** - Chrome only (simplifies visualization testing)
- **Gamification** - No streaks, badges, or points
- **Backend server** - Fully static site, no API
- **Real-time collaboration** - Solo learning tool

## Technical Constraints

### Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 14+ |
| Visualizations | visx | Latest |
| Content | MDX | Via @next/mdx |
| Progress Storage | IndexedDB | Via `idb` wrapper |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |

### Performance Requirements
- Visualizations: Max 1000 data points per chart
- Build time: Under 2 minutes for 50 MDX files
- Page load: Under 3 seconds on localhost

### Data Structures

**Curriculum (curriculum.ts)**
```typescript
interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  order: number;
  contentPath: string;
  colabUrl?: string;
  quiz: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
  lessons: Lesson[];
  diagnosticQuiz?: QuizQuestion[];
}
```

**Progress (IndexedDB)**
```typescript
interface LessonProgress {
  lessonId: string;
  completed: boolean;
  quizPassed: boolean;
  completedAt?: Date;
}
```

### Project Structure
```
quantlearn/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── visualizations/     # visx chart components
│   │   ├── Quiz.tsx
│   │   └── ProgressBar.tsx
│   ├── content/                # MDX lesson files
│   ├── lib/
│   │   ├── curriculum.ts
│   │   └── progress.ts
│   └── types/
├── public/
├── start.sh
└── next.config.js
```

## Curriculum Structure (Reference)

### Module 1: Mathematical Foundations
1. Probability Theory
2. Statistics for Trading
3. Normal & Log-Normal Distributions
4. Linear Algebra Basics
5. Covariance & Correlation

### Module 2: Core Trading Concepts
1. Returns & Risk Measurement
2. Market Microstructure
3. Time Series Basics

### Module 3: Backtesting & Scientific Method
1. Scientific Method in Trading
2. Backtesting Fundamentals
3. Common Pitfalls
4. Walk-Forward Analysis
5. Sensitivity Analysis
6. Sample Size Requirements

### Module 4: Strategy Types
1. Trend Following
2. Mean Reversion
3. Market Making Basics

### Module 5: Advanced Quant Techniques
1. Making Strategies Adaptive
2. Regime Detection
3. Blending Uncorrelated Signals
4. Orthogonal Dimensions
5. Portfolio Optimization

### Module 6: Production Skills
1. Notebooks to Production Scripts
2. Fast Backtesting Techniques
3. TradFi Data Nuances
4. Options Strategy Basics
5. Live Execution Case Study

## Open Questions

1. **Quiz question authoring**: 60-150 questions needed across all lessons. Consider using Claude to help draft initial questions from lesson content.

2. **Colab notebook maintenance**: Notebooks live separately in Google Drive. Need a naming convention and folder structure to match curriculum.
