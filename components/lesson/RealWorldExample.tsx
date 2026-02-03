'use client';

import React from 'react';

interface Source {
  name: string;
  url?: string;
}

interface RealWorldExampleProps {
  title: string;
  date?: string;
  impact?: string;
  children: React.ReactNode;
  sources?: Source[];
  lesson?: string;
}

/**
 * Component for displaying verified real-world case studies
 * Only includes documented, verifiable examples from reputable sources
 */
export function RealWorldExample({
  title,
  date,
  impact,
  children,
  sources,
  lesson,
}: RealWorldExampleProps) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">📰</span>
          <h4 className="font-semibold text-amber-900 dark:text-amber-100">
            {title}
          </h4>
        </div>
        {(date || impact) && (
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-amber-700 dark:text-amber-300">
            {date && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
              </span>
            )}
            {impact && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {impact}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 text-amber-900 dark:text-amber-100">
        {children}
      </div>

      {/* Key Lesson */}
      {lesson && (
        <div className="px-4 py-3 bg-amber-100/50 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            <span className="font-bold">Key Lesson:</span> {lesson}
          </p>
        </div>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <span className="font-medium">Sources: </span>
            {sources.map((source, i) => (
              <span key={i}>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-800 dark:hover:text-amber-200"
                  >
                    {source.name}
                  </a>
                ) : (
                  source.name
                )}
                {i < sources.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}

export default RealWorldExample;
