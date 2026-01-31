/**
 * TypeScript interfaces for QuantLearn curriculum structure
 * Defines types for lessons, quizzes, modules, and progress tracking
 */

/**
 * A single multiple-choice quiz question
 */
export interface QuizQuestion {
  /** The question text displayed to the user */
  question: string;
  /** Array of answer options (typically 4 choices) */
  options: string[];
  /** Index of the correct answer in the options array (0-based) */
  correctIndex: number;
}

/**
 * A lesson within a module
 */
export interface Lesson {
  /** Unique identifier for the lesson (e.g., "probability-theory") */
  id: string;
  /** Display title of the lesson */
  title: string;
  /** ID of the parent module this lesson belongs to */
  moduleId: string;
  /** Order within the module (1-based) */
  order: number;
  /** Path to the MDX content file (e.g., "content/module-1/lesson-1.mdx") */
  contentPath: string;
  /** Optional Google Colab notebook URL for hands-on practice */
  colabUrl?: string;
  /** Quiz questions for this lesson (2-3 questions, need 2/3 correct to pass) */
  quiz: QuizQuestion[];
}

/**
 * A module containing multiple lessons
 */
export interface Module {
  /** Unique identifier for the module (e.g., "math-foundations") */
  id: string;
  /** Display title of the module */
  title: string;
  /** Order within the curriculum (1-based) */
  order: number;
  /** Brief description of what the module covers */
  description: string;
  /** Array of lessons in this module (ordered) */
  lessons: Lesson[];
  /** Optional diagnostic quiz to skip Module 1 (post-MVP feature) */
  diagnosticQuiz?: QuizQuestion[];
}

/**
 * Progress tracking for a single lesson stored in IndexedDB
 */
export interface LessonProgress {
  /** ID of the lesson this progress is for */
  lessonId: string;
  /** Whether the lesson content has been viewed/completed */
  completed: boolean;
  /** Whether the quiz was passed (2/3 correct answers) */
  quizPassed: boolean;
  /** Timestamp when the lesson was completed (if completed) */
  completedAt?: Date;
}

/**
 * Full progress state for export/import functionality
 */
export interface ProgressState {
  /** Map of lesson IDs to their progress */
  lessons: Record<string, LessonProgress>;
  /** Timestamp when this progress was exported */
  exportedAt: Date;
  /** Version of the progress format for future migrations */
  version: number;
}
