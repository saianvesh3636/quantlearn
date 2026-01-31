# Task History

This file contains summaries of all completed tasks.
**Note:** This file is for human reference only - not read by Claude.

---

## 2026-01-31: Phase 1 - Project Setup Complete

**Tasks completed:**
- Created `start.sh` script that runs `npx next dev`
- Initialized Next.js 14 project with App Router
- Configured TypeScript with strict mode
- Installed and configured MDX (`@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`)
- Set up Tailwind CSS with clean, minimal theme
- Created directory structure: `app/`, `components/`, `content/lessons/`, `lib/`

**Files created:**
- `start.sh` - Startup script
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript config with strict mode
- `next.config.mjs` - Next.js config with MDX support
- `mdx-components.tsx` - MDX components file
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.mjs` - PostCSS configuration
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page
- `app/globals.css` - Global styles
- `.eslintrc.json` - ESLint configuration
- `next-env.d.ts` - Next.js TypeScript declarations
- `.gitkeep` files in `components/`, `content/lessons/`, `lib/`

**Files modified:**
- `.gitignore` - Added `.next/` and `out/` directories

---

## 2026-01-31: Create MDX frontmatter schema

**Task:** Create MDX frontmatter schema in `lib/types.ts` (title, module, order, colabUrl, prerequisites)

**Files created:**
- `lib/types.ts` - TypeScript interfaces for lesson frontmatter, lessons, modules, and curriculum

**Types defined:**
- `LessonFrontmatter` - Metadata schema (title, module, order, colabUrl?, prerequisites?)
- `Lesson` - Full lesson data including slug, module, frontmatter, and content
- `Module` - Module containing id, name, and sorted lessons
- `Curriculum` - Root structure containing all modules

---
