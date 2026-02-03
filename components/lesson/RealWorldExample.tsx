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
 * Uses subtle design with left border accent for visual distinction
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
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
      {/* Header with subtle accent */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Case Study</span>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h4>
          </div>
        </div>
        {(date || impact) && (
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {date && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
              </span>
            )}
            {impact && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {impact}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 text-gray-700 dark:text-gray-300 prose-sm dark:prose-invert max-w-none">
        {children}
      </div>

      {/* Key Lesson */}
      {lesson && (
        <div className="mx-4 mb-4 p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Key Lesson: </span>
            {lesson}
          </p>
        </div>
      )}

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Sources: </span>
            {sources.map((source, i) => (
              <span key={i}>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
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
