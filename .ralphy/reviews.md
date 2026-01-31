
---

## Phase Review: ## Phase 1: Project Setup
**Date:** 2026-01-31 01:07:27
**Files:** .context/history.md
.eslintrc.json
.gitignore
TASKS.md
app/globals.css
app/layout.tsx
app/page.tsx
components/.gitkeep
content/lessons/.gitkeep
lib/.gitkeep
mdx-components.tsx
next-env.d.ts
next.config.mjs
package-lock.json
package.json
postcss.config.mjs
start.sh
tailwind.config.ts
tsconfig.json

# PR Review Summary

## Overview
This PR sets up a new Next.js 14 project with TypeScript, MDX support, and Tailwind CSS for a quantitative trading education platform. The foundation is clean and follows standard conventions.

**Risk Level:** Low
**Recommendation:** Approve with Comments

---

## Critical Issues (Must Fix)

None identified.

---

## Suggestions (Should Fix)

- **Security**: The `start.sh` script uses `npx` which could potentially fetch and execute a different package version than expected.
  - File: `start.sh:2`
  - Current: `npx next dev`
  - Better: Use `npm run dev` or ensure the script runs after `npm install` to use the locked version.

- **Maintainability**: The `--font-sans` CSS variable is referenced in `globals.css` but the font variable defined in `layout.tsx` is `--font-inter`.
  - File: `app/globals.css:19`
  - Current: `font-family: var(--font-sans), system-ui, sans-serif;`
  - Better: Use `var(--font-inter)` to match the defined variable, or add `--font-sans` as an alias.

- **Code Quality**: The Tailwind config references `--font-mono` variable which is never defined anywhere in the codebase.
  - File: `tailwind.config.ts:26`
  - Current: `mono: ['var(--font-mono)', 'ui-monospace', 'monospace']`
  - Better: Either define the mono font in `layout.tsx` or remove the variable reference.

---

## Nitpicks (Could Fix)

- The `.context/history.md` file states it's "not read by Claude" but is being committed - consider if this belongs in `.gitignore` or if the note is outdated.
- The primary color palette in `tailwind.config.ts` duplicates Tailwind's built-in `sky` colors - could simply extend with `primary: colors.sky` for less code.

---

## Positives

- Clean, minimal setup following Next.js 14 best practices with App Router
- TypeScript strict mode enabled for better type safety
- Proper MDX configuration with both loader and react packages
- Well-organized directory structure with clear separation of concerns
- Dark mode support implemented via CSS media queries
- Sensible ESLint configuration extending Next.js core web vitals

---

## Questions

- Is the custom primary color palette intentionally identical to Tailwind's `sky` colors, or should it be customized for the QuantLearn brand?

---

## Phase Review: ## Phase 2: Content & Lessons
**Date:** 2026-01-31 01:09:00
**Files:** .context/history.md
.context/sessions/20260131-010221-69db0500.jsonl
TASKS.md
lib/types.ts

# PR Review Summary

## Overview
This PR adds TypeScript type definitions for MDX lesson frontmatter and curriculum structure. The types are clean, well-documented, and provide a solid foundation for the lesson loading system.

**Risk Level:** Low
**Recommendation:** Approve with Comments

---

## Critical Issues (Must Fix)

None.

---

## Suggestions (Should Fix)

- **Architecture**: Consider adding module order for curriculum navigation
  - File: `lib/types.ts:37-44`
  - Current: `Module` interface has no `order` property
  - Better: Add `order: number` to control module display order in the curriculum, similar to how lessons have order within modules
  ```typescript
  export interface Module {
    id: string;
    name: string;
    order: number;  // Add this
    lessons: Lesson[];
  }
  ```

- **Type Safety**: Consider a stricter type for module identifiers
  - File: `lib/types.ts:12`
  - Current: `module: string` allows any string value
  - Better: If modules are predefined, consider a union type or branded type for compile-time validation:
  ```typescript
  // Option 1: Known modules
  type ModuleId = 'basics' | 'intermediate' | 'advanced';
  
  // Option 2: Branded type for runtime validation
  type ModuleId = string & { readonly brand: unique symbol };
  ```
  This is optional and depends on whether modules are dynamic or fixed.

---

## Nitpicks (Could Fix)

- The `Lesson` interface has both `module: string` and `frontmatter.module` - this creates potential for inconsistency. Consider deriving `module` from the slug or frontmatter rather than storing it twice.

- File: `lib/types.ts:25` - The slug example `'basics/01-introduction-to-returns'` includes the module prefix. If `module` is stored separately, you might want the slug to exclude it (just `'01-introduction-to-returns'`), though this is a design choice.

---

## Positives

- Excellent JSDoc comments on all interfaces and properties - this will help with IDE autocomplete and developer onboarding
- Clean separation of concerns: frontmatter (file metadata) vs. Lesson (runtime data) vs. Module (collection) vs. Curriculum (root)
- Optional fields (`colabUrl`, `prerequisites`) correctly typed with `?`
- Good use of 1-based ordering which is more intuitive for content authors

---

## Questions

- Will `prerequisites` validation happen at build time or runtime? The current string-based approach requires resolving slugs to actual lessons elsewhere.
- Is there a plan for handling invalid prerequisite references (e.g., circular dependencies or non-existent lesson slugs)?

---

## Phase Review: ## Phase 3: Navigation & Progress
**Date:** 2026-01-31 01:17:06
**Files:** .context/history.md
.context/sessions/20260131-010221-69db0500.jsonl
TASKS.md
app/layout.tsx
app/lessons/[...slug]/LessonContent.tsx
app/lessons/[...slug]/page.tsx
app/page.tsx
components/Sidebar.tsx
content/lessons/.gitkeep
content/lessons/basics/01-introduction-to-returns.mdx
content/lessons/basics/02-descriptive-statistics.mdx
content/lessons/basics/03-correlation-analysis.mdx
content/lessons/basics/04-moving-averages.mdx
content/lessons/basics/05-volatility-measurement.mdx
lib/db.ts
lib/lessons.ts
package-lock.json
package.json
providers/ProgressProvider.tsx

Now I have all the context needed to provide a thorough review.

# PR Review Summary

## Overview
This PR implements Phase 3: Navigation & Progress tracking, adding a sidebar with curriculum navigation, IndexedDB-based progress persistence via Dexie.js, and "continue where you left off" functionality. The implementation is well-structured with proper separation of concerns.

**Risk Level:** Medium
**Recommendation:** Request Changes

---

## Critical Issues (Must Fix)

- **Security (XSS Vulnerability)**: Raw MDX content rendered with `dangerouslySetInnerHTML`
  - File: `app/lessons/[...slug]/LessonContent.tsx:83`
  - Problem: The lesson content (raw MDX) is rendered directly via `dangerouslySetInnerHTML={{ __html: lesson.content }}`. The `content` from gray-matter is raw MDX text, not HTML. This won't render properly and if any HTML is in the MDX, it creates XSS risk.
  - Fix: Use a proper MDX renderer like `@mdx-js/react` with `MDXRemote` from `next-mdx-remote` to safely compile and render MDX content, or at minimum sanitize with DOMPurify before rendering.

- **Architecture (Server/Client Mismatch)**: Synchronous file operations in layout may cause hydration issues
  - File: `app/layout.tsx:23`
  - Problem: `getCurriculum()` uses synchronous `fs.readFileSync` and is called in a Server Component (layout), but `Sidebar` is a `'use client'` component. While this works, passing server-fetched data to client components can cause serialization issues with complex objects.
  - Fix: Ensure the curriculum data is plain JSON-serializable objects (it appears to be, but verify `content` field serialization).

---

## Suggestions (Should Fix)

- **Performance**: Full progress reload on every status change
  - File: `providers/ProgressProvider.tsx:57-65`
  - Current: Both `markViewed` and `markCompleted` call `loadProgress()` which fetches ALL records from IndexedDB.
  - Better: Update state optimistically or use Dexie's live queries (`useLiveQuery`) for reactive updates without full refetch:
    ```typescript
    const markViewed = useCallback(async (slug: string) => {
      await dbMarkViewed(slug);
      const updated = await getProgress(slug);
      if (updated) {
        setProgress(prev => new Map(prev).set(slug, updated));
      }
    }, []);
    ```

- **Error Handling**: Missing error handling in async handlers
  - File: `app/lessons/[...slug]/LessonContent.tsx:23-25`
  - Current: `handleMarkComplete` doesn't handle errors; if IndexedDB fails, user gets no feedback.
  - Better: Wrap in try-catch with user feedback (toast notification or error state).

- **Accessibility**: Unused `hasActiveLesson` variable
  - File: `components/Sidebar.tsx:97`
  - Current: `hasActiveLesson` is computed but never used.
  - Better: Remove unused variable, or use it to auto-expand the module containing the active lesson on initial render.

- **Architecture**: Sidebar hardcoded to 64 width without responsive behavior
  - File: `components/Sidebar.tsx:149`
  - Current: `w-64 h-screen` with no mobile/responsive handling.
  - Better: Add a hamburger toggle for mobile or use responsive classes (`hidden md:flex`).

- **Code Quality**: Progress indicator SVG not visible in completed state
  - File: `components/Sidebar.tsx:22-42`
  - Current: The SVG checkmark is inside a 12px (w-3 h-3) span but the SVG uses a 24x24 viewBox. The span has no `flex` or centering, so the SVG may overflow invisibly.
  - Better: Add `flex items-center justify-center` to the span or adjust dimensions.

- **Type Safety**: Unchecked type assertion for frontmatter
  - File: `lib/lessons.ts:26`
  - Current: `const frontmatter = data as LessonFrontmatter` - trusts gray-matter output blindly.
  - Better: Use a validation library like Zod to parse and validate frontmatter structure at runtime.

---

## Nitpicks (Could Fix)

- `ModuleSection` uses `useState(true)` for `isExpanded` - consider persisting expansion state to localStorage for better UX across page refreshes.

- The `getStats` function in `lib/db.ts:145` returns `notStarted: 0` with a comment "Will be calculated by the caller" - this is misleading; either calculate it properly or remove from the return type.

- Duplicate export pattern in `components/Sidebar.tsx:194-196` - both named export and default export of same component is redundant.

---

## Positives

- Clean separation between data layer (`lib/db.ts`), state management (`ProgressProvider`), and UI components.
- Good use of Dexie.js for IndexedDB with proper indexing (`slug, status, lastAccessedAt`).
- Progress state correctly prevents "downgrading" from completed to in_progress in `markViewed`.
- Proper use of `useCallback` to prevent unnecessary re-renders in context provider.
- Good accessibility basics with `aria-label` and `title` attributes on progress indicators.
- MDX lessons include proper frontmatter schema with prerequisites support for future use.

---

## Questions

- Is the raw MDX content rendering intentional as a placeholder? The current implementation won't render MDX features like math equations (`$$`) - these will show as raw text.

- Should the sidebar be hideable/collapsible for better lesson reading experience on smaller screens?
