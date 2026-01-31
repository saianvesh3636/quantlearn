# QuantLearn Requirements

> **Quick Summary**
> - **Building**: Interactive web-based learning platform for quantitative trading education
> - **For**: Aspiring quant traders, developers transitioning to finance, self-learners
> - **Core Features**: Brilliant-style interactive lessons, Python code playgrounds, progress tracking, Claude context copying
> - **Tech**: Next.js static site, Google Colab for Python notebooks, IndexedDB storage
> - **Scope**: Medium (pilot with 3-5 lessons, expandable architecture)

## Overview

A visual, interactive learning platform modeled after Brilliant.org but focused specifically on quantitative finance and algorithmic trading. The platform guides users through a structured curriculum using interactive visualizations, real-world examples, and hands-on Python coding exercises. Progress is tracked locally via IndexedDB, and a "Copy context for Claude" button enables AI-assisted learning without requiring CLI installation.

## Assumptions (Made Due to Unanswered Questions)

The following assumptions drive this specification. If any are incorrect, the requirements should be revised:

| Assumption | Impact if Wrong |
|------------|-----------------|
| Personal use / small audience | Add error monitoring, CSP headers, telemetry |
| Pilot content (3-5 lessons) | Extend content authoring workflow |
| Synthetic/sample data only | Add data licensing, API integration |
| Colab notebooks for exercises | If embedded execution needed, add Pyodide or Jupyter |
| Chrome/Firefox/Edge only | Add Safari polyfills, test matrix |
| Solo developer authorship | Add CMS or collaborative editing tools |

## Must Have (MVP)

### Feature 1: Lesson Rendering
- Description: Display MDX-based lesson content with syntax-highlighted code blocks and embedded interactive components
- Acceptance Criteria:
  - [ ] Lessons render from MDX files with frontmatter (title, module, order, hasPlayground)
  - [ ] Code blocks display with syntax highlighting (Python, JavaScript)
  - [ ] Lesson navigation shows current position in curriculum
  - [ ] Lessons load within 2 seconds on broadband connection
- Technical Notes: Use Next.js App Router with MDX loader; Shiki or Prism for highlighting

### Feature 2: Curriculum Navigation
- Description: Sidebar navigation showing all modules and lessons with progress indicators
- Acceptance Criteria:
  - [ ] Modules displayed hierarchically (Basics → Core Concepts → Quant Techniques → Foundations)
  - [ ] Each lesson shows completion status (not started / in progress / completed)
  - [ ] Current lesson highlighted in navigation
  - [ ] Users can jump to any lesson (no gating for MVP)
- Technical Notes: Progress state from IndexedDB; static lesson metadata from MDX frontmatter

### Feature 3: Google Colab Integration
- Description: Each lesson links to a pre-made Google Colab notebook for hands-on coding
- Acceptance Criteria:
  - [ ] Each lesson has an "Open in Colab" button linking to its notebook
  - [ ] Colab notebooks are stored in a public GitHub repo for easy access
  - [ ] Notebooks have starter code + instructions matching the lesson
  - [ ] Notebooks include sample datasets and expected outputs
  - [ ] Users can make their own copy and experiment freely
- Technical Notes: Host notebooks in `quantlearn-notebooks` GitHub repo; use Colab badge links

### Feature 4: Progress Persistence
- Description: Track lesson completion and playground submissions in IndexedDB
- Acceptance Criteria:
  - [ ] Lesson marked as "viewed" when opened
  - [ ] Lesson marked as "completed" when user clicks "Mark Complete" or runs playground successfully
  - [ ] Progress persists across browser sessions
  - [ ] Progress survives page refresh during lesson
- Technical Notes: Dexie.js wrapper for IndexedDB; schema: `{ lessonId, status, viewedAt, completedAt }`

### Feature 5: Claude Context Copying
- Description: Button that copies current lesson context to clipboard for pasting into Claude
- Acceptance Criteria:
  - [ ] "Copy for Claude" button visible on each lesson
  - [ ] Copied text includes: lesson title, current code from playground, any error messages
  - [ ] Success toast confirms copy action
  - [ ] Works without any CLI installation or API keys
- Technical Notes: Use Clipboard API; format as structured markdown for Claude context

### Feature 6: Offline Lesson Content
- Description: Lesson text and visuals work without internet; Colab requires connection
- Acceptance Criteria:
  - [ ] Lesson content (text, images, charts) loads from static files
  - [ ] "Open in Colab" button clearly indicates external link
  - [ ] Solution code shown inline for reference when not using Colab
  - [ ] Sample output/charts embedded in lesson for preview
- Technical Notes: Static MDX content; Colab links open in new tab

## Should Have (Post-MVP)

### Feature 7: Lesson Prerequisites
- Description: Show what knowledge is assumed before starting a lesson
- Acceptance Criteria:
  - [ ] Prerequisites listed in lesson frontmatter
  - [ ] Links to prerequisite lessons displayed at top
  - [ ] Warning if prerequisite lessons not completed

### Feature 8: Playground Test Cases
- Description: Automated validation that user's code produces expected output
- Acceptance Criteria:
  - [ ] Lessons can define expected output in frontmatter
  - [ ] "Check Answer" button compares playground output to expected
  - [ ] Pass/fail indicator with helpful hints on failure

### Feature 9: Progress Export/Import
- Description: Backup and restore progress as JSON file
- Acceptance Criteria:
  - [ ] "Export Progress" downloads JSON file
  - [ ] "Import Progress" restores from uploaded file
  - [ ] Confirmation before overwriting existing progress

### Feature 10: Interactive Visualizations
- Description: Embedded charts for financial data visualization within lessons
- Acceptance Criteria:
  - [ ] Candlestick charts for price data
  - [ ] Line charts for equity curves
  - [ ] Interactive parameter sliders that update visualizations
- Technical Notes: Plotly for charts; defer D3.js unless custom visualizations needed

## Nice to Have (Future)

### Feature 11: Spaced Repetition Review
- Description: Prompt users to review previously completed concepts at optimal intervals

### Feature 12: Keyboard Shortcuts
- Description: Ctrl+Enter to run code, Ctrl+S to save, etc.

### Feature 13: Multiple Playground Files
- Description: Support multi-file projects for advanced lessons

### Feature 14: Real Market Data
- Description: Fetch historical price data from free APIs for backtesting exercises

### Feature 15: Browser Extension for Claude
- Description: Automatically inject lesson context into Claude.ai without manual copying

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Local-first design; no server required |
| Real-time Claude CLI integration | Contradicts static site architecture; use copy button instead |
| Full curriculum (all 4 modules) | Content-gated; ship platform first, expand curriculum iteratively |
| Mobile-optimized experience | Desktop-first for code-heavy content; mobile is read-only at best |
| Live trading integration | Liability concerns; simulation only |
| Community features (comments, forums) | Requires backend infrastructure |
| Cohort-based learning / instructor dashboards | Enterprise feature; not MVP |
## Technical Constraints

### Platform Requirements
- Static deployment (Vercel/Netlify) or local dev server
- No backend server or database
- All state stored client-side in IndexedDB
- Python execution via Google Colab (external)

### Browser Support
- Chrome 90+ (primary target)
- Any modern browser works (no WebWorker/Pyodide constraints)

### Performance Targets
- Initial page load: <2 seconds
- Lesson navigation: <300ms
- Bundle size: <500KB gzipped (no heavy dependencies)

### Security Requirements
- No user authentication (local-only)
- Colab handles Python sandboxing
- Static content only (no XSS vectors)

## Open Questions

These questions were asked during review but remain unanswered. The requirements assume reasonable defaults, but answers would refine the specification:

1. **Personal vs. distributed use?** — Current spec assumes personal use. If distributed, add error monitoring, security hardening, and documentation.

2. **Existing content to port?** — Current spec assumes content creation from scratch. If notebooks exist, add conversion workflow.

3. **Content authorship model?** — Current spec assumes solo developer using MDX. If team authorship, consider CMS integration.

4. **Claude integration priority?** — Current spec uses manual copy button. If deep integration is required, explore browser extension approach.

## Pilot Content Scope

For initial validation, implement these lessons in "Basics: Statistics for Trading":

1. **Introduction to Returns** — Calculate simple and log returns from price series
2. **Descriptive Statistics** — Mean, variance, skewness, kurtosis of return distributions
3. **Correlation Analysis** — Pairwise correlation between assets
4. **Moving Averages** — Simple and exponential moving averages
5. **Volatility Measurement** — Rolling standard deviation and annualization

Each lesson follows the pattern:
- Concept explanation (text + visualization)
- Interactive example (parameter sliders)
- Playground exercise (write Python code)
- "Copy for Claude" help button
