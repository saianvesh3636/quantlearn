'use client';

import React from 'react';

interface WhyItMattersProps {
  children: React.ReactNode;
  tldr?: string;
}

/**
 * Component that explicitly answers "Why should I care about this concept?"
 * Makes the practical importance clear and visceral
 */
export function WhyItMatters({ children, tldr }: WhyItMattersProps) {
  return (
    <div className="my-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-100 dark:bg-blue-900/40 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
            Why This Matters
          </h4>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 text-blue-900 dark:text-blue-100">
        {children}
      </div>

      {/* TL;DR */}
      {tldr && (
        <div className="px-4 py-3 bg-blue-100/50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            <span className="font-bold">TL;DR:</span> {tldr}
          </p>
        </div>
      )}
    </div>
  );
}

export default WhyItMatters;
