'use client';

import React, { useState } from 'react';

interface Question {
  question: string;
  hint?: string;
}

interface ThinkAboutItProps {
  questions: Question[];
}

/**
 * Component for thought-provoking questions that encourage critical thinking
 * Uses subtle design consistent with other lesson components
 */
export function ThinkAboutIt({ questions }: ThinkAboutItProps) {
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  const toggleHint = (index: number) => {
    setRevealedHints(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Critical Thinking</span>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Think About It
            </h4>
          </div>
        </div>
        <p className="mt-1 ml-10 text-sm text-gray-500 dark:text-gray-400">
          These questions don&apos;t have simple answers. Take a moment to think critically.
        </p>
      </div>

      {/* Questions */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {questions.map((q, i) => (
          <div key={i} className="px-4 py-4">
            <p className="text-gray-800 dark:text-gray-200 font-serif leading-relaxed">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm mr-2 font-sans font-medium">
                {i + 1}
              </span>
              {q.question}
            </p>
            {q.hint && (
              <div className="mt-3 ml-8">
                <button
                  onClick={() => toggleHint(i)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1.5 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${revealedHints.has(i) ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {revealedHints.has(i) ? 'Hide hint' : 'Show hint'}
                </button>
                {revealedHints.has(i) && (
                  <div className="mt-2 p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-serif leading-relaxed">
                      <span className="font-semibold font-sans text-slate-700 dark:text-slate-300">Hint: </span>
                      {q.hint}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThinkAboutIt;
