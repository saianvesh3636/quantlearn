# QuantLearn Tasks

> **Project Metadata**
> - **Project Slug**: quantlearn
> - **Total Tasks**: 22 across 5 phases
> - **Focus**: Interactive learning platform for quantitative trading education
> - **Starting Point**: Phase 1: Project Setup
> - **Key Deliverable**: Web app with full curriculum, Google Colab notebooks, and progress tracking

Interactive web-based learning platform with visual lessons, Google Colab notebooks for Python exercises, and Claude context copying for AI-assisted learning.

**Execution Mode**: Sequential
**Source**: Requirements from 2026-01-31

---

## Reference Documents

- REQUIREMENTS.md (source requirements)

---

## Phase 1: Project Setup

- [ ] Create project with single `start.sh` script that runs `npx next dev` (one command to start)
- [ ] Initialize Next.js 14 project with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Install and configure MDX (`@next/mdx`, `@mdx-js/loader`)
- [ ] Set up Tailwind CSS with clean, minimal theme
- [ ] Create directory structure: `app/`, `components/`, `content/lessons/`, `lib/`

## Phase 2: Content & Lessons

- [ ] Create MDX frontmatter schema in `lib/types.ts` (title, module, order, colabUrl, prerequisites)
- [ ] Implement lesson loader in `lib/lessons.ts` to parse MDX files and build curriculum tree
- [ ] Create GitHub repo `quantlearn-notebooks` for Colab notebooks
- [ ] Write pilot lessons with matching Colab notebooks:
  - `content/lessons/basics/01-introduction-to-returns.mdx`
  - `content/lessons/basics/02-descriptive-statistics.mdx`
  - `content/lessons/basics/03-correlation-analysis.mdx`
  - `content/lessons/basics/04-moving-averages.mdx`
  - `content/lessons/basics/05-volatility-measurement.mdx`
- [ ] Build dynamic route `app/lessons/[module]/[slug]/page.tsx` to render lessons
- [ ] Add "Open in Colab" button component linking to notebook

## Phase 3: Navigation & Progress

- [ ] Create `components/Sidebar.tsx` with module/lesson hierarchy
- [ ] Implement progress indicators (not started / in progress / completed)
- [ ] Install Dexie.js and create IndexedDB schema in `lib/db.ts`
- [ ] Create progress functions: `markViewed()`, `markCompleted()`, `getProgress()`
- [ ] Build `providers/ProgressProvider.tsx` for app-wide state
- [ ] Auto-restore progress on page load (pick up where left off)

## Phase 4: Claude Integration

- [ ] Create `components/CopyForClaudeButton.tsx` using Clipboard API
- [ ] Format copied context: lesson title, current topic, sample code from lesson
- [ ] Add success toast on copy
- [ ] Include lesson context in copied text so Claude knows what you're learning

## Phase 5: Polish & Launch

- [ ] Create landing page `app/page.tsx` with curriculum overview
- [ ] Add "Continue where you left off" suggestion on homepage
- [ ] Test progress persistence across browser restart
- [ ] Verify single-command startup with `./start.sh`

---

## Notes

- No Pyodide/browser Python - all Python runs in Google Colab
- Simple setup: clone repo, run `./start.sh`, open browser
- Progress syncs to IndexedDB automatically
- Each lesson: concept explanation → visual example → "Open in Colab" → "Copy for Claude"
