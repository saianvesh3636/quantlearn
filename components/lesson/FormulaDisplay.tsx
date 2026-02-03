'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulaDisplayProps {
  formula: string;
  explanation?: string;
  variables?: { symbol: string; meaning: string }[];
}

export default function FormulaDisplay({ formula, explanation, variables }: FormulaDisplayProps) {
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Formula */}
      <div className="text-center py-4 text-2xl text-slate-900 dark:text-slate-100">
        <BlockMath math={formula} />
      </div>

      {/* Variable Legend */}
      {variables && variables.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Where:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {variables.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-1 rounded">
                  <InlineMath math={v.symbol} />
                </span>
                <span className="text-slate-600 dark:text-slate-400">= {v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <p className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm italic">
          {explanation}
        </p>
      )}
    </div>
  );
}
