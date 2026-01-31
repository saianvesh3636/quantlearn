'use client';

interface InteractiveExampleProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function InteractiveExample({ title, description, children }: InteractiveExampleProps) {
  return (
    <div className="my-8 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 border-b border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          <h4 className="font-bold text-lg text-indigo-800 dark:text-indigo-200">
            Interactive: {title}
          </h4>
        </div>
        {description && (
          <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
            {description}
          </p>
        )}
      </div>

      {/* Visualization Area */}
      <div className="p-6 bg-white dark:bg-slate-900">
        {children}
      </div>

      {/* Footer hint */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <span>💡</span>
        <span>Try adjusting the sliders to see how values change</span>
      </div>
    </div>
  );
}
