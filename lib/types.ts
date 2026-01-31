/**
 * MDX Lesson Frontmatter Schema
 * Defines the structure for lesson metadata in MDX files
 */

import type { QuizQuestion } from '@/types/curriculum';

/**
 * Frontmatter for individual lessons
 */
export interface LessonFrontmatter {
  /** Display title of the lesson */
  title: string;
  /** Module this lesson belongs to (e.g., 'basics', 'advanced') */
  module: string;
  /** Order within the module (1-based) */
  order: number;
  /** URL to the Google Colab notebook for this lesson */
  colabUrl?: string;
  /** Array of lesson slugs that should be completed before this one */
  prerequisites?: string[];
  /** Quiz questions for this lesson (need 2/3 correct to pass and unlock next lesson) */
  quiz?: QuizQuestion[];
}

/**
 * Full lesson data including frontmatter and content
 */
export interface Lesson {
  /** Unique identifier derived from file path (e.g., 'basics/01-introduction-to-returns') */
  slug: string;
  /** Module identifier (e.g., 'basics') */
  module: string;
  /** Lesson metadata from frontmatter */
  frontmatter: LessonFrontmatter;
  /** Raw MDX content */
  content: string;
}

/**
 * Module containing multiple lessons
 */
export interface Module {
  /** Module identifier (e.g., 'basics') */
  id: string;
  /** Display name for the module */
  name: string;
  /** Lessons in this module, sorted by order */
  lessons: Lesson[];
}

/**
 * Full curriculum tree structure
 */
export interface Curriculum {
  /** All modules in the curriculum */
  modules: Module[];
}
