import Dexie, { type Table } from 'dexie';

/**
 * Progress status for a lesson
 */
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Progress record stored in IndexedDB
 */
export interface LessonProgress {
  /** Lesson slug (e.g., 'basics/01-introduction-to-returns') */
  slug: string;
  /** Current status of the lesson */
  status: LessonStatus;
  /** Whether the quiz was passed (2/3 correct answers) */
  quizPassed: boolean;
  /** Timestamp when first viewed */
  viewedAt?: number;
  /** Timestamp when completed */
  completedAt?: number;
  /** Last accessed timestamp */
  lastAccessedAt: number;
}

/**
 * QuantLearn Database using Dexie.js for IndexedDB
 */
class QuantLearnDB extends Dexie {
  progress!: Table<LessonProgress, string>;

  constructor() {
    super('quantlearn');

    // Version 1: Initial schema
    this.version(1).stores({
      progress: 'slug, status, lastAccessedAt'
    });

    // Version 2: Add quizPassed field
    this.version(2).stores({
      progress: 'slug, status, quizPassed, lastAccessedAt'
    }).upgrade(tx => {
      // Migrate existing records to have quizPassed: false
      return tx.table('progress').toCollection().modify(record => {
        if (record.quizPassed === undefined) {
          record.quizPassed = false;
        }
      });
    });
  }
}

// Singleton database instance
export const db = new QuantLearnDB();

/**
 * Mark a lesson as viewed (in_progress)
 */
export async function markViewed(slug: string): Promise<void> {
  const now = Date.now();
  const existing = await db.progress.get(slug);

  if (existing) {
    // Update lastAccessedAt, but don't downgrade status
    await db.progress.update(slug, {
      lastAccessedAt: now,
      // Only set to in_progress if not already completed
      status: existing.status === 'completed' ? 'completed' : 'in_progress',
      viewedAt: existing.viewedAt || now
    });
  } else {
    // New record
    await db.progress.add({
      slug,
      status: 'in_progress',
      quizPassed: false,
      viewedAt: now,
      lastAccessedAt: now
    });
  }
}

/**
 * Mark a lesson as completed
 */
export async function markCompleted(slug: string): Promise<void> {
  const now = Date.now();
  const existing = await db.progress.get(slug);

  if (existing) {
    await db.progress.update(slug, {
      status: 'completed',
      completedAt: now,
      lastAccessedAt: now
    });
  } else {
    await db.progress.add({
      slug,
      status: 'completed',
      quizPassed: false,
      viewedAt: now,
      completedAt: now,
      lastAccessedAt: now
    });
  }
}

/**
 * Mark a lesson's quiz as passed
 */
export async function markQuizPassed(slug: string): Promise<void> {
  const now = Date.now();
  const existing = await db.progress.get(slug);

  if (existing) {
    await db.progress.update(slug, {
      quizPassed: true,
      status: 'completed',
      completedAt: existing.completedAt || now,
      lastAccessedAt: now
    });
  } else {
    await db.progress.add({
      slug,
      status: 'completed',
      quizPassed: true,
      viewedAt: now,
      completedAt: now,
      lastAccessedAt: now
    });
  }
}

/**
 * Check if a lesson's quiz has been passed
 */
export async function isQuizPassed(slug: string): Promise<boolean> {
  const existing = await db.progress.get(slug);
  return existing?.quizPassed ?? false;
}

/**
 * Check if a lesson is unlocked (first lesson or previous lesson's quiz passed)
 */
export async function isLessonUnlocked(
  slug: string,
  allLessonSlugs: string[]
): Promise<boolean> {
  const index = allLessonSlugs.indexOf(slug);

  // First lesson is always unlocked
  if (index <= 0) {
    return true;
  }

  // Check if previous lesson's quiz was passed
  const previousSlug = allLessonSlugs[index - 1];
  return isQuizPassed(previousSlug);
}

/**
 * Get progress for a specific lesson
 */
export async function getProgress(slug: string): Promise<LessonProgress | undefined> {
  return db.progress.get(slug);
}

/**
 * Get progress for all lessons
 */
export async function getAllProgress(): Promise<Map<string, LessonProgress>> {
  const records = await db.progress.toArray();
  return new Map(records.map(r => [r.slug, r]));
}

/**
 * Get the most recently accessed lesson (for "continue where you left off")
 */
export async function getLastAccessedLesson(): Promise<LessonProgress | undefined> {
  return db.progress
    .orderBy('lastAccessedAt')
    .reverse()
    .first();
}

/**
 * Get all in-progress lessons
 */
export async function getInProgressLessons(): Promise<LessonProgress[]> {
  return db.progress
    .where('status')
    .equals('in_progress')
    .toArray();
}

/**
 * Get completion statistics
 */
export async function getStats(): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}> {
  const all = await db.progress.toArray();
  const completed = all.filter(r => r.status === 'completed').length;
  const inProgress = all.filter(r => r.status === 'in_progress').length;

  return {
    total: all.length,
    completed,
    inProgress,
    notStarted: 0 // Will be calculated by the caller based on curriculum
  };
}
