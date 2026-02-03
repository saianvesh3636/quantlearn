import type { MDXComponents } from 'mdx/types';

// Import visualization components for MDX
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

// Import lesson UX components
import {
  ConceptCard,
  FormulaDisplay,
  InteractiveExample,
  KeyTakeaway,
  SimpleChart,
  RealWorldExample,
  ThinkAboutIt,
  WhyItMatters,
} from '@/components/lesson';

// Import Quiz component
import Quiz from '@/components/Quiz';

/**
 * MDX Components Configuration
 *
 * This file configures custom React components that can be used in MDX files.
 * All visualization components are available for embedding interactive charts.
 *
 * Usage in MDX:
 * ```mdx
 * <LineChart data={[...]} xLabel="Time" yLabel="Price" />
 * <Histogram data={[...]} binCount={20} />
 * ```
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Spread any custom components passed in
    ...components,

    // Visualization Components for interactive charts
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

    // Quiz Component for lesson assessments
    Quiz,

    // Lesson UX Components
    ConceptCard,
    FormulaDisplay,
    InteractiveExample,
    KeyTakeaway,
    SimpleChart,
    RealWorldExample,
    ThinkAboutIt,
    WhyItMatters,

    // Custom styled components
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
    pre: ({ children, ...props }) => (
      <pre
        className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4 text-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ children, className, ...props }: { children?: React.ReactNode; className?: string }) => {
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
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20 pl-4 py-2 my-4 italic text-gray-700 dark:text-gray-300"
        {...props}
      >
        {children}
      </blockquote>
    ),
  };
}
