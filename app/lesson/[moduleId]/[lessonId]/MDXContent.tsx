'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import 'katex/dist/katex.min.css';

// Import all MDX components
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

import Quiz from '@/components/Quiz';

// MDX components mapping
const mdxComponents = {
  // Visualizations
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
  // Lesson UX
  ConceptCard,
  FormulaDisplay,
  InteractiveExample,
  KeyTakeaway,
  SimpleChart,
  RealWorldExample,
  ThinkAboutIt,
  WhyItMatters,
  // Quiz
  Quiz,
};

interface MDXContentProps {
  mdxSource?: MDXRemoteSerializeResult;
  content: string;
}

export default function MDXContent({ mdxSource, content }: MDXContentProps) {
  // If we have pre-compiled MDX, use it with full component support
  if (mdxSource) {
    return (
      <MDXRemote
        {...mdxSource}
        components={mdxComponents}
      />
    );
  }

  // Fallback: render raw content with basic styling
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}
