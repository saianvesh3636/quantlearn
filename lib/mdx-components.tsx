'use client';

import type { MDXComponents } from 'mdx/types';

// Import all visualization components
import {
  LineChart,
  Histogram,
  ScatterPlot,
  ProbabilityTree,
  Heatmap,
  CandlestickChart,
  OrderBook,
  EquityCurve,
  SensitivityHeatmap,
  RegimeChart,
  EfficientFrontier,
} from '@/components/visualizations';

// Import Quiz component for embedded quizzes
import Quiz from '@/components/Quiz';

/**
 * Custom MDX components for lesson content
 *
 * These components can be used directly in MDX files:
 *
 * ```mdx
 * <LineChart
 *   data={[{ x: 0, y: 100 }, { x: 1, y: 105 }, { x: 2, y: 103 }]}
 *   xLabel="Time"
 *   yLabel="Price"
 * />
 * ```
 */
export const mdxComponents: MDXComponents = {
  // Visualization Components
  LineChart,
  Histogram,
  ScatterPlot,
  ProbabilityTree,
  Heatmap,
  CandlestickChart,
  OrderBook,
  EquityCurve,
  SensitivityHeatmap,
  RegimeChart,
  EfficientFrontier,

  // Quiz Component
  Quiz,

  // Custom typography components with enhanced styling
  h1: ({ children, ...props }) => (
    <h1
      className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-3"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2"
      {...props}
    >
      {children}
    </h4>
  ),

  // Paragraph with proper spacing
  p: ({ children, ...props }) => (
    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),

  // Enhanced code blocks with syntax highlighting support
  pre: ({ children, ...props }) => (
    <pre
      className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4 text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => {
    // Check if this is an inline code block or a code block inside pre
    const isInline = !className;

    if (isInline) {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    // Code block inside pre tag
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  // Blockquote for callouts and notes
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Lists with proper styling
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="ml-2" {...props}>
      {children}
    </li>
  ),

  // Links with hover effects
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-2 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),

  // Tables for data presentation
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </td>
  ),

  // Horizontal rule
  hr: (props) => (
    <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />
  ),

  // Strong and emphasis
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),

  // Image handling with responsive sizing
  img: ({ src, alt, ...props }) => (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg shadow-md max-w-full h-auto"
        {...props}
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
};

/**
 * Custom wrapper components for special content types
 */

// Callout component for important notes
export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: 'info' | 'warning' | 'tip' | 'danger';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300',
    tip: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300',
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    tip: '✅',
    danger: '🚨',
  };

  return (
    <div className={`border-l-4 p-4 my-4 rounded-r-lg ${styles[type]}`}>
      {title && (
        <div className="font-semibold mb-1">
          {icons[type]} {title}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

// Math block component for LaTeX equations
export function MathBlock({ children }: { children: string }) {
  return (
    <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-x-auto text-center">
      <code className="text-lg font-mono">{children}</code>
    </div>
  );
}

// Interactive example wrapper
export function InteractiveExample({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

// Add wrapper components to mdxComponents
Object.assign(mdxComponents, {
  Callout,
  MathBlock,
  InteractiveExample,
});
