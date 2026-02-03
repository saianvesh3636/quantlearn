'use client';

import React from 'react';

interface WhyItMattersProps {
  children: React.ReactNode;
  tldr?: string;
}

/**
 * Component that explicitly answers "Why should I care about this concept?"
 * Uses a subtle left border accent for visual distinction
 */
export function WhyItMatters({ children, tldr }: WhyItMattersProps) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Why This Matters</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 text-gray-700 dark:text-gray-300">
        {children}
      </div>

      {/* TL;DR */}
      {tldr && (
        <div className="mx-4 mb-4 p-3 rounded-md bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">TL;DR: </span>
            {tldr}
          </p>
        </div>
      )}
    </div>
  );
}

export default WhyItMatters;
