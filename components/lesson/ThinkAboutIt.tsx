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
 * Questions don't have "right" answers - they're meant to make you think
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
    <div className="my-6 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-100 dark:bg-purple-900/40 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤔</span>
          <h4 className="font-semibold text-purple-900 dark:text-purple-100">
            Think About It
          </h4>
        </div>
        <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
          These questions don't have simple answers. Take a moment to think critically.
        </p>
      </div>

      {/* Questions */}
      <div className="px-4 py-4 space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="pl-4 border-l-2 border-purple-300 dark:border-purple-700">
            <p className="text-purple-900 dark:text-purple-100 font-medium">
              {i + 1}. {q.question}
            </p>
            {q.hint && (
              <div className="mt-2">
                <button
                  onClick={() => toggleHint(i)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 flex items-center gap-1"
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
                  <p className="mt-2 text-sm text-purple-700 dark:text-purple-300 italic bg-purple-100 dark:bg-purple-900/30 p-2 rounded">
                    💡 {q.hint}
                  </p>
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
