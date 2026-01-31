'use client';

import Link from 'next/link';
import { useProgress } from '@/providers/ProgressProvider';

export default function Home() {
  const { lastAccessedLesson, isLoaded } = useProgress();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to QuantLearn
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Interactive learning platform for quantitative trading education.
        </p>
      </header>

      {/* Continue where you left off */}
      {isLoaded && lastAccessedLesson && lastAccessedLesson.status === 'in_progress' && (
        <section className="mb-12 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Continue where you left off
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Pick up right where you stopped learning.
          </p>
          <Link
            href={`/lesson/${lastAccessedLesson.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-colors"
          >
            Resume Learning
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>
      )}

      {/* Getting Started */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Getting Started
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start your quantitative finance journey with our structured curriculum.
          Each lesson includes interactive explanations and hands-on Python exercises
          in Google Colab.
        </p>
        <Link
          href="/lesson/basics/01-introduction-to-returns"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-md font-medium transition-colors"
        >
          Start from the Beginning
        </Link>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          How it Works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Interactive Lessons
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn concepts through visual explanations and real-world examples.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Python in Colab
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practice with real code in Google Colab notebooks - no setup required.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your progress is saved locally. Pick up where you left off anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
