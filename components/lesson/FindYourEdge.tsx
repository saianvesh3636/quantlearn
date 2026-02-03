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
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Actionable Edge</span>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Find Your Edge: {concept}
            </h4>
          </div>
        </div>
        <p className="mt-1 ml-10 text-sm text-gray-500 dark:text-gray-400">
          Research-backed strategies that exploit this concept.
        </p>
      </div>

      {/* Strategies */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {strategies.map((strategy, index) => (
          <div key={index}>
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {strategy.name}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedIndex === index && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
                  {strategy.description}
                </p>

                <div className="ml-9 grid gap-3 md:grid-cols-2">
                  {/* Implementation */}
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Implementation
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {strategy.implementation}
                    </p>
                    {strategy.parameters && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                        {strategy.parameters}
                      </p>
                    )}
                  </div>

                  {/* Evidence */}
                  <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Evidence
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {strategy.evidence}
                    </p>
                  </div>
                </div>

                {/* Risks */}
                <div className="ml-9 p-3 rounded-md bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                  <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Risks & Limitations
                  </h5>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {strategy.risks}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Past performance ≠ future results. All strategies require paper trading and personal validation before risking capital.
        </p>
      </div>
    </div>
  );
}

export default FindYourEdge;
