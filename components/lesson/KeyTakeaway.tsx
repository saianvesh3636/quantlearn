'use client';

interface KeyTakeawayProps {
  children: React.ReactNode;
}

/**
 * Component for summarizing the key point of a lesson
 * Uses a subtle design with left border accent
 */
export default function KeyTakeaway({ children }: KeyTakeawayProps) {
  return (
    <div className="my-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 overflow-hidden">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            Key Takeaway
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-300 ml-8 font-serif leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
