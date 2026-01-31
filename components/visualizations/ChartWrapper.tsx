'use client';

import React, { ReactNode } from 'react';
import { ParentSize } from '@visx/responsive';

/**
 * Performance guard: caps data points to prevent performance issues
 */
export const MAX_DATA_POINTS = 1000;

/**
 * Helper function to apply performance guard to data arrays
 */
export function applyPerformanceGuard<T>(data: T[], maxPoints: number = MAX_DATA_POINTS): T[] {
  if (data.length <= maxPoints) return data;

  // Sample evenly from the data
  const step = Math.ceil(data.length / maxPoints);
  const sampled: T[] = [];
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }
  // Always include the last data point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1]);
  }
  return sampled;
}

/**
 * Default chart dimensions and margins
 */
export const defaultMargin = { top: 40, right: 40, bottom: 50, left: 60 };

/**
 * Chart color palette for consistent styling
 */
export const chartColors = {
  primary: '#0ea5e9',      // primary-500
  secondary: '#8b5cf6',    // violet-500
  success: '#22c55e',      // green-500
  danger: '#ef4444',       // red-500
  warning: '#f59e0b',      // amber-500
  muted: '#64748b',        // slate-500
  background: '#f8fafc',   // slate-50
  grid: '#e2e8f0',         // slate-200
  text: '#334155',         // slate-700
  textMuted: '#94a3b8',    // slate-400
};

/**
 * Series colors for multi-line charts
 */
export const seriesColors = [
  '#0ea5e9', // primary-500
  '#8b5cf6', // violet-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
];

export interface ChartWrapperProps {
  /** Chart title displayed above the visualization */
  title?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Minimum height for the chart container */
  minHeight?: number;
  /** Maximum height for the chart container */
  maxHeight?: number;
  /** Custom class names */
  className?: string;
  /** Children render function receiving width and height */
  children: (dimensions: { width: number; height: number }) => ReactNode;
  /** Optional legend content */
  legend?: ReactNode;
  /** Whether to show a loading state */
  loading?: boolean;
  /** Optional error message */
  error?: string;
}

/**
 * ChartWrapper provides consistent sizing, styling, and responsive behavior
 * for all visualization components in the QuantLearn platform.
 */
export function ChartWrapper({
  title,
  subtitle,
  minHeight = 300,
  maxHeight = 500,
  className = '',
  children,
  legend,
  loading = false,
  error,
}: ChartWrapperProps) {
  return (
    <div
      className={`w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-slate-100">
          {title && (
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div
        className="relative w-full"
        style={{ minHeight, maxHeight }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500">Loading chart...</span>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </div>
        ) : (
          <ParentSize debounceTime={50}>
            {({ width, height }) => {
              // Ensure minimum dimensions
              const chartWidth = Math.max(width, 200);
              const chartHeight = Math.max(height, minHeight);

              return (
                <div style={{ width: chartWidth, height: chartHeight }}>
                  {children({ width: chartWidth, height: chartHeight })}
                </div>
              );
            }}
          </ParentSize>
        )}
      </div>

      {/* Legend */}
      {legend && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
          {legend}
        </div>
      )}
    </div>
  );
}

/**
 * Tooltip styling helper
 */
export const tooltipStyles = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  padding: '8px 12px',
  fontSize: '12px',
  color: '#334155',
};

/**
 * Format number for display (handles large numbers, decimals)
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date for axis labels - handles both Date objects and strings
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date; // Return string as-is for labels
  }
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return String(date);
}

/**
 * Convert date input to Date object - handles strings, Date objects, and numbers
 */
export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  // Try parsing string
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) return parsed;
  // For strings like "2023-01" or "Jan", create a rough date
  return new Date(value.toString());
}

export default ChartWrapper;
