'use client';

import React, { useState } from 'react';

interface EdgeStrategy {
  name: string;
  description: string;
  implementation: string;
  parameters?: string;
  evidence: string;
  risks: string;
}

interface FindYourEdgeProps {
  concept: string;
  strategies: EdgeStrategy[];
}

/**
 * Component for presenting actionable trading edges based on the lesson concept
 * All edges are backed by academic research or documented institutional use
 */
export function FindYourEdge({ concept, strategies }: FindYourEdgeProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="my-6 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-emerald-100 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
            Find Your Edge: {concept}
          </h4>
        </div>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
          Research-backed strategies that exploit this concept. All require further testing before live trading.
        </p>
      </div>

      {/* Strategies */}
      <div className="divide-y divide-emerald-200 dark:divide-emerald-800">
        {strategies.map((strategy, index) => (
          <div key={index} className="bg-white/50 dark:bg-gray-900/50">
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-sm flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">
                  {strategy.name}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-emerald-500 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedIndex === index && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {strategy.description}
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <h5 className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide mb-1">
                      How to Implement
                    </h5>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {strategy.implementation}
                    </p>
                    {strategy.parameters && (
                      <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded">
                        {strategy.parameters}
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-200 uppercase tracking-wide mb-1">
                      Evidence
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {strategy.evidence}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <h5 className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wide mb-1">
                    Risks & Limitations
                  </h5>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {strategy.risks}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-emerald-100/50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800">
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          ⚠️ Past performance ≠ future results. All strategies require paper trading and personal validation before risking capital.
        </p>
      </div>
    </div>
  );
}

export default FindYourEdge;
