'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useProgress } from '@/providers/ProgressProvider';
import Quiz from '@/components/Quiz';
import CopyForClaudeButton from '@/components/CopyForClaudeButton';
import type { Lesson, Module } from '@/lib/types';
import 'katex/dist/katex.min.css';

// Dynamic import for MDX rendering to avoid SSR issues
const MDXContent = dynamic(() => import('./MDXContent'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  ),
});

interface LessonPageContentProps {
  lesson: Lesson;
  module: Module;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  allLessonSlugs: string[];
  mdxSource?: MDXRemoteSerializeResult;
}

/**
 * Client component for lesson page with:
 * - Progress tracking
 * - MDX rendering with embedded visualizations
 * - Quiz integration
 * - Navigation
 */
export default function LessonPageContent({
  lesson,
  module,
  prevLesson,
  nextLesson,
  allLessonSlugs,
  mdxSource,
}: LessonPageContentProps) {
  const {
    markViewed,
    markCompleted,
    getStatus,
    isLessonUnlocked,
    isQuizPassed,
  } = useProgress();

  const status = getStatus(lesson.slug);
  const isUnlocked = isLessonUnlocked(lesson.slug, allLessonSlugs);
  const quizPassed = isQuizPassed(lesson.slug);

  // Auto-mark lesson as viewed when page loads
  useEffect(() => {
    if (isUnlocked) {
      markViewed(lesson.slug);
    }
  }, [lesson.slug, markViewed, isUnlocked]);

  // Handle manual completion (for lessons without quizzes)
  const handleMarkComplete = async () => {
    await markCompleted(lesson.slug);
  };

  // Check if lesson has a quiz
  const hasQuiz = lesson.frontmatter.quiz && lesson.frontmatter.quiz.length > 0;

  // Handle quiz pass
  const handleQuizPass = () => {
    // Progress is marked in the Quiz component via markQuizPassed
  };

  // If lesson is locked, show lock screen
  if (!isUnlocked) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lesson Locked
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete the previous lesson&apos;s quiz to unlock this content.
          </p>
          {prevLesson && (
            <Link
              href={`/lesson/${prevLesson.module}/${prevLesson.slug.split('/')[1]}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Go to Previous Lesson
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-primary-500 transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/module/${module.id}`}
          className="hover:text-primary-500 transition-colors"
        >
          {module.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">
          {lesson.frontmatter.title}
        </span>
      </nav>

      {/* Module Context Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {module.name} Module
        </span>
      </div>

      {/* Lesson Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {lesson.frontmatter.title}
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Colab Button */}
          {lesson.frontmatter.colabUrl && (
            <a
              href={lesson.frontmatter.colabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
                <path d="M12 6v12l8-6z" />
              </svg>
              Open in Colab
            </a>
          )}

          {/* Mark Complete Button (only for lessons without quizzes) */}
          {!hasQuiz && status !== 'completed' && (
            <button
              onClick={handleMarkComplete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Mark as Complete
            </button>
          )}

          {/* Completed Badge */}
          {status === 'completed' && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md font-medium">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Completed
            </span>
          )}

          {/* In Progress Badge */}
          {status === 'in_progress' && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              In Progress
            </span>
          )}

          {/* Copy for Claude Button */}
          <CopyForClaudeButton
            lessonTitle={lesson.frontmatter.title}
            module={module.name}
            content={lesson.content}
          />
        </div>
      </header>

      {/* Lesson Content - MDX Rendered */}
      <article className="prose prose-gray dark:prose-invert max-w-none mb-12">
        <MDXContent content={lesson.content} mdxSource={mdxSource} />
      </article>

      {/* Quiz Section */}
      {hasQuiz && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Check Your Understanding
          </h2>
          {quizPassed ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Quiz completed! You can proceed to the next lesson.
                </span>
              </div>
            </div>
          ) : (
            <Quiz
              questions={lesson.frontmatter.quiz!}
              lessonSlug={lesson.slug}
              onPass={handleQuizPass}
            />
          )}
        </section>
      )}

      {/* Lesson Navigation */}
      <nav className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
        {prevLesson ? (
          <Link
            href={`/lesson/${prevLesson.module}/${prevLesson.slug.split('/')[1]}`}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Previous
              </span>
              <span className="font-medium">{prevLesson.frontmatter.title}</span>
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/lesson/${nextLesson.module}/${nextLesson.slug.split('/')[1]}`}
            className="flex items-center gap-2 text-right text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                Next
              </span>
              <span className="font-medium">{nextLesson.frontmatter.title}</span>
            </span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}

