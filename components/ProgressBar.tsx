'use client';

import React from 'react';
import { useProgress } from '@/providers/ProgressProvider';
import type { Curriculum, Module } from '@/lib/types';

interface ProgressBarProps {
  curriculum: Curriculum;
  /** Display mode: 'full' shows overall + modules, 'compact' shows only overall */
  mode?: 'full' | 'compact';
  /** Custom class name for the container */
  className?: string;
}

interface ProgressStats {
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Calculate progress statistics for a module
 */
function useModuleProgress(module: Module): ProgressStats {
  const { getStatus } = useProgress();

  const completed = module.lessons.filter(l => getStatus(l.slug) === 'completed').length;
  const total = module.lessons.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Calculate overall curriculum progress
 */
function useCurriculumProgress(curriculum: Curriculum): ProgressStats {
  const { getStatus } = useProgress();

  const allLessons = curriculum.modules.flatMap(m => m.lessons);
  const completed = allLessons.filter(l => getStatus(l.slug) === 'completed').length;
  const total = allLessons.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Single progress bar with label
 */
function ProgressBarItem({
  label,
  stats,
  color = 'primary',
  showLabel = true,
}: {
  label: string;
  stats: ProgressStats;
  color?: 'primary' | 'green' | 'blue' | 'purple';
  showLabel?: boolean;
}) {
  const colorClasses = {
    primary: 'bg-primary-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {stats.completed}/{stats.total} ({stats.percentage}%)
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${stats.percentage}%` }}
          role="progressbar"
          aria-valuenow={stats.completed}
          aria-valuemin={0}
          aria-valuemax={stats.total}
          aria-label={`${label}: ${stats.completed} of ${stats.total} completed`}
        />
      </div>
    </div>
  );
}

/**
 * Module progress row component
 */
function ModuleProgressRow({ module }: { module: Module }) {
  const stats = useModuleProgress(module);

  return (
    <ProgressBarItem
      label={module.name}
      stats={stats}
      color="blue"
    />
  );
}

/**
 * ProgressBar component showing module and overall curriculum completion
 *
 * Displays:
 * - Overall curriculum progress with percentage
 * - Individual module progress (in full mode)
 * - Animated progress bars with accessible ARIA attributes
 */
export function ProgressBar({ curriculum, mode = 'full', className = '' }: ProgressBarProps) {
  const { isLoaded } = useProgress();
  const overallStats = useCurriculumProgress(curriculum);

  // Show loading skeleton while progress is loading
  if (!isLoaded) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    );
  }

  if (mode === 'compact') {
    return (
      <div className={className}>
        <ProgressBarItem
          label="Overall Progress"
          stats={overallStats}
          color="primary"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall progress - prominent display */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <ProgressBarItem
          label="Overall Progress"
          stats={overallStats}
          color="primary"
        />
      </div>

      {/* Module breakdown */}
      {curriculum.modules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            By Module
          </h3>
          <div className="space-y-3">
            {curriculum.modules.map(module => (
              <ModuleProgressRow key={module.id} module={module} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact progress indicator for use in headers or small spaces
 */
export function ProgressIndicatorCompact({ curriculum }: { curriculum: Curriculum }) {
  const { isLoaded } = useProgress();
  const stats = useCurriculumProgress(curriculum);

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-500"
          style={{ width: `${stats.percentage}%` }}
          role="progressbar"
          aria-valuenow={stats.completed}
          aria-valuemin={0}
          aria-valuemax={stats.total}
          aria-label={`Progress: ${stats.percentage}%`}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {stats.percentage}%
      </span>
    </div>
  );
}

export default ProgressBar;
