'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProgress } from '@/providers/ProgressProvider';
import type { Curriculum, Module, Lesson } from '@/lib/types';
import type { LessonStatus } from '@/lib/db';

interface SidebarProps {
  curriculum: Curriculum;
}

// Icons for collapsed sidebar
const moduleIcons: Record<string, string> = {
  basics: '📊',
  'risk-management': '⚠️',
  strategies: '📈',
  backtesting: '🔄',
  default: '📚',
};

/**
 * Progress indicator component showing lesson status
 */
function ProgressIndicator({ status, isLocked }: { status: LessonStatus; isLocked?: boolean }) {
  const baseClasses = 'w-3 h-3 rounded-full flex-shrink-0';

  if (isLocked) {
    return (
      <span
        className="w-3 h-3 flex-shrink-0 text-gray-400 dark:text-gray-500"
        title="Locked - Complete previous lesson quiz"
        aria-label="Locked"
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }

  switch (status) {
    case 'completed':
      return (
        <span
          className={`${baseClasses} bg-green-500`}
          title="Completed"
          aria-label="Completed"
        >
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      );
    case 'in_progress':
      return (
        <span
          className={`${baseClasses} bg-primary-500 animate-pulse`}
          title="In Progress"
          aria-label="In Progress"
        />
      );
    case 'not_started':
    default:
      return (
        <span
          className={`${baseClasses} border-2 border-gray-300 dark:border-gray-600`}
          title="Not Started"
          aria-label="Not Started"
        />
      );
  }
}

/**
 * Individual lesson item in the sidebar
 */
function LessonItem({
  lesson,
  isActive,
  isLocked,
}: {
  lesson: Lesson;
  isActive: boolean;
  isLocked: boolean;
}) {
  const { getStatus } = useProgress();
  const status = getStatus(lesson.slug);

  if (isLocked) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2 text-sm rounded-md text-gray-400 dark:text-gray-500 cursor-not-allowed"
        title="Complete the previous lesson quiz to unlock"
      >
        <ProgressIndicator status={status} isLocked={true} />
        <span className="truncate">{lesson.frontmatter.title}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/lesson/${lesson.slug}`}
      className={`
        flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors
        ${isActive
          ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-100 font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      <ProgressIndicator status={status} />
      <span className="truncate">{lesson.frontmatter.title}</span>
    </Link>
  );
}

/**
 * Module section with collapsible lesson list
 */
function ModuleSection({
  module,
  activeLessonSlug,
  allLessonSlugs,
}: {
  module: Module;
  activeLessonSlug: string | null;
  allLessonSlugs: string[];
}) {
  const { getStatus, isLessonUnlocked } = useProgress();
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate module progress
  const completedCount = module.lessons.filter(l => getStatus(l.slug) === 'completed').length;
  const totalCount = module.lessons.length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {module.name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {completedCount}/{totalCount}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-1 ml-2 space-y-1">
          {module.lessons.map(lesson => (
            <LessonItem
              key={lesson.slug}
              lesson={lesson}
              isActive={lesson.slug === activeLessonSlug}
              isLocked={!isLessonUnlocked(lesson.slug, allLessonSlugs)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Toggle button for collapsing/expanding sidebar
 */
function CollapseToggle({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg
        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>
  );
}

/**
 * Collapsed module item showing just an icon
 */
function CollapsedModuleItem({
  module,
  activeLessonSlug,
}: {
  module: Module;
  activeLessonSlug: string | null;
}) {
  const { getStatus } = useProgress();
  const isActiveModule = module.lessons.some(l => l.slug === activeLessonSlug);
  const completedCount = module.lessons.filter(l => getStatus(l.slug) === 'completed').length;
  const totalCount = module.lessons.length;
  const icon = moduleIcons[module.id] || moduleIcons.default;

  return (
    <div className="relative group">
      <Link
        href={`/lesson/${module.lessons[0]?.slug}`}
        className={`
          flex items-center justify-center w-10 h-10 rounded-md transition-colors
          ${isActiveModule
            ? 'bg-primary-100 dark:bg-primary-900/30'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        title={`${module.name} (${completedCount}/${totalCount})`}
      >
        <span className="text-lg">{icon}</span>
      </Link>
      {/* Tooltip on hover */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {module.name}
        <span className="ml-2 text-gray-400">({completedCount}/{totalCount})</span>
      </div>
    </div>
  );
}

/**
 * Main Sidebar component with module/lesson hierarchy
 */
export function Sidebar({ curriculum }: SidebarProps) {
  const pathname = usePathname();
  const { isLoaded, lastAccessedLesson, isLessonUnlocked } = useProgress();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Extract active lesson slug from pathname
  const activeLessonSlug = pathname?.startsWith('/lesson/')
    ? pathname.replace('/lesson/', '')
    : null;

  // Compute all lesson slugs in order for lock state calculation
  const allLessonSlugs = curriculum.modules.flatMap(m => m.lessons.map(l => l.slug));

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <aside className="w-16 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header with logo */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-center">
          <Link href="/" className="font-bold text-xl text-primary-500" title="QuantLearn">
            Q
          </Link>
        </div>

        {/* Toggle button */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-center">
          <CollapseToggle isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
        </div>

        {/* Module icons */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {curriculum.modules.map(module => (
            <CollapsedModuleItem
              key={module.id}
              module={module}
              activeLessonSlug={activeLessonSlug}
            />
          ))}
        </nav>
      </aside>
    );
  }

  // Expanded sidebar view
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
          <span className="text-primary-500">Q</span>
          <span>QuantLearn</span>
        </Link>
        <CollapseToggle isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
      </div>

      {/* Continue where you left off */}
      {isLoaded && lastAccessedLesson && lastAccessedLesson.status === 'in_progress' && isLessonUnlocked(lastAccessedLesson.slug, allLessonSlugs) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Continue learning</p>
          <Link
            href={`/lesson/${lastAccessedLesson.slug}`}
            className="block p-2 bg-primary-50 dark:bg-primary-900/20 rounded-md text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            Resume lesson
          </Link>
        </div>
      )}

      {/* Curriculum navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {curriculum.modules.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No lessons available yet.
          </p>
        ) : (
          curriculum.modules.map(module => (
            <ModuleSection
              key={module.id}
              module={module}
              activeLessonSlug={activeLessonSlug}
              allLessonSlugs={allLessonSlugs}
            />
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        Progress tracked locally
      </div>
    </aside>
  );
}

export default Sidebar;
