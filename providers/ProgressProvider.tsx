'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  type LessonProgress,
  type LessonStatus,
  markViewed as dbMarkViewed,
  markCompleted as dbMarkCompleted,
  markQuizPassed as dbMarkQuizPassed,
  getAllProgress,
  getLastAccessedLesson
} from '@/lib/db';

interface ProgressContextValue {
  /** Map of lesson slug to progress */
  progress: Map<string, LessonProgress>;
  /** Whether progress has been loaded from IndexedDB */
  isLoaded: boolean;
  /** The last accessed lesson for "continue where you left off" */
  lastAccessedLesson: LessonProgress | null;
  /** Mark a lesson as viewed (in_progress) */
  markViewed: (slug: string) => Promise<void>;
  /** Mark a lesson as completed */
  markCompleted: (slug: string) => Promise<void>;
  /** Mark a lesson's quiz as passed */
  markQuizPassed: (slug: string) => Promise<void>;
  /** Get status for a specific lesson */
  getStatus: (slug: string) => LessonStatus;
  /** Check if a lesson's quiz has been passed */
  isQuizPassed: (slug: string) => boolean;
  /** Check if a lesson is unlocked (first lesson or previous lesson's quiz passed) */
  isLessonUnlocked: (slug: string, allLessonSlugs: string[]) => boolean;
  /** Refresh progress from database */
  refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Map<string, LessonProgress>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastAccessedLesson, setLastAccessedLesson] = useState<LessonProgress | null>(null);

  // Load progress from IndexedDB on mount
  const loadProgress = useCallback(async () => {
    try {
      const [progressMap, lastAccessed] = await Promise.all([
        getAllProgress(),
        getLastAccessedLesson()
      ]);
      setProgress(progressMap);
      setLastAccessedLesson(lastAccessed || null);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load progress from IndexedDB:', error);
      setIsLoaded(true); // Still mark as loaded to avoid infinite loading
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const markViewed = useCallback(async (slug: string) => {
    await dbMarkViewed(slug);
    await loadProgress(); // Refresh state
  }, [loadProgress]);

  const markCompleted = useCallback(async (slug: string) => {
    await dbMarkCompleted(slug);
    await loadProgress(); // Refresh state
  }, [loadProgress]);

  const markQuizPassed = useCallback(async (slug: string) => {
    await dbMarkQuizPassed(slug);
    await loadProgress(); // Refresh state
  }, [loadProgress]);

  const getStatus = useCallback((slug: string): LessonStatus => {
    const lessonProgress = progress.get(slug);
    return lessonProgress?.status || 'not_started';
  }, [progress]);

  const isQuizPassed = useCallback((slug: string): boolean => {
    const lessonProgress = progress.get(slug);
    return lessonProgress?.quizPassed ?? false;
  }, [progress]);

  const isLessonUnlocked = useCallback((_slug: string, _allLessonSlugs: string[]): boolean => {
    // All lessons are unlocked - no gating
    return true;
  }, []);

  const value: ProgressContextValue = {
    progress,
    isLoaded,
    lastAccessedLesson,
    markViewed,
    markCompleted,
    markQuizPassed,
    getStatus,
    isQuizPassed,
    isLessonUnlocked,
    refresh: loadProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
