'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleBand } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatNumber,
  formatPercent,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
  frequency?: number;
}

// Simple MDX-friendly format
export interface SimpleBin {
  bin: string;
  count: number;
  label?: string;
}

// Flexible input that can be number[] or SimpleBin[]
export type HistogramData = number[] | SimpleBin[];

export interface HistogramProps {
  /** Raw data values to bin, or simple bin format for MDX */
  data?: HistogramData;
  /** Pre-computed bins */
  bins?: HistogramBin[];
  /** Number of bins (when using raw data) */
  numBins?: number;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** X-axis label */
  xAxisLabel?: string;
  /** Alias for xAxisLabel (MDX compatibility) */
  xLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Alias for yAxisLabel (MDX compatibility) */
  yLabel?: string;
  /** Show as frequency (0-1) instead of count */
  showFrequency?: boolean;
  /** Show normal distribution overlay */
  showNormalOverlay?: boolean;
  /** Bar color */
  color?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Highlight specific bins (by index) */
  highlightBins?: number[];
  /** Interactive slider to adjust bin count */
  enableBinSlider?: boolean;
}

/**
 * Compute histogram bins from raw data
 */
function computeBins(data: number[], numBins: number): HistogramBin[] {
  if (data.length === 0) return [];

  const guardedData = applyPerformanceGuard(data, MAX_DATA_POINTS);
  const min = Math.min(...guardedData);
  const max = Math.max(...guardedData);
  const binWidth = (max - min) / numBins || 1;

  const bins: HistogramBin[] = [];
  for (let i = 0; i < numBins; i++) {
    bins.push({
      x0: min + i * binWidth,
      x1: min + (i + 1) * binWidth,
      count: 0,
    });
  }

  for (const value of guardedData) {
    const binIndex = Math.min(
      Math.floor((value - min) / binWidth),
      numBins - 1
    );
    bins[binIndex].count++;
  }

  // Calculate frequency
  const total = guardedData.length;
  for (const bin of bins) {
    bin.frequency = bin.count / total;
  }

  return bins;
}

/**
 * Calculate normal distribution PDF points
 */
function normalDistributionCurve(
  mean: number,
  stdDev: number,
  min: number,
  max: number,
  numPoints: number = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const step = (max - min) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const x = min + i * step;
    const y =
      (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    points.push({ x, y });
  }

  return points;
}

/**
 * Histogram component for displaying distributions
 */
// Check if data is SimpleBin format
function isSimpleBinData(data: HistogramData): data is SimpleBin[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'bin' in data[0];
}

export function Histogram({
  data,
  bins: providedBins,
  numBins: initialNumBins = 20,
  title,
  subtitle,
  xAxisLabel,
  xLabel,
  yAxisLabel,
  yLabel,
  showFrequency = false,
  showNormalOverlay = false,
  color = chartColors.primary,
  minHeight = 300,
  margin = defaultMargin,
  highlightBins,
  enableBinSlider = false,
}: HistogramProps) {
  const [numBins, setNumBins] = useState(initialNumBins);

  // Use xLabel/yLabel as aliases
  const effectiveXLabel = xAxisLabel || xLabel;
  const effectiveYLabel = yAxisLabel || yLabel;

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<HistogramBin & { label?: string }>();

  // Check if using simple labeled format
  const isSimpleFormat = useMemo(() => data && isSimpleBinData(data), [data]);
  const simpleLabels = useMemo(() => {
    if (data && isSimpleBinData(data)) {
      return data.map(d => d.bin || d.label || '');
    }
    return [];
  }, [data]);

  // Compute or use provided bins
  const bins = useMemo(() => {
    if (providedBins) return providedBins;
    if (data) {
      // Handle SimpleBin format
      if (isSimpleBinData(data)) {
        return data.map((d, i) => ({
          x0: i,
          x1: i + 1,
          count: d.count,
          frequency: d.count / Math.max(1, data.reduce((sum, b) => sum + b.count, 0)),
        }));
      }
      // Handle number[] format
      return computeBins(data as number[], numBins);
    }
    return [];
  }, [providedBins, data, numBins]);

  // Calculate statistics for normal overlay (only for numeric data)
  const stats = useMemo(() => {
    if (!data || data.length === 0 || isSimpleFormat) return null;

    // Only calculate stats for number[] data
    const numericData = data as number[];
    const guardedData = applyPerformanceGuard(numericData, MAX_DATA_POINTS);
    const mean = guardedData.reduce((a, b) => a + b, 0) / guardedData.length;
    const variance =
      guardedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      guardedData.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }, [data, isSimpleFormat]);

  const handleBarHover = useCallback(
    (event: React.MouseEvent, bin: HistogramBin) => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: bin,
          tooltipLeft: point.x,
          tooltipTop: point.y - 10,
        });
      }
    },
    [showTooltip]
  );

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      minHeight={minHeight}
    >
      {({ width, height }) => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        if (bins.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        const xMin = bins[0].x0;
        const xMax = bins[bins.length - 1].x1;
        const yMax = Math.max(...bins.map(b => showFrequency ? (b.frequency || 0) : b.count));

        const xScale = scaleLinear({
          domain: [xMin, xMax],
          range: [0, innerWidth],
        });

        const yScale = scaleLinear({
          domain: [0, yMax * 1.1],
          range: [innerHeight, 0],
          nice: true,
        });

        const barWidth = (innerWidth / bins.length) * 0.9;

        // Normal distribution overlay
        let normalCurve: { x: number; y: number }[] = [];
        if (showNormalOverlay && stats) {
          normalCurve = normalDistributionCurve(
            stats.mean,
            stats.stdDev,
            xMin,
            xMax
          );
          // Scale to match histogram
          const binWidth = (xMax - xMin) / bins.length;
          const scaleFactor = showFrequency ? binWidth : binWidth * (data?.length || 1);
          normalCurve = normalCurve.map(p => ({
            x: p.x,
            y: p.y * scaleFactor,
          }));
        }

        return (
          <div className="relative">
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {/* Grid */}
                <GridRows
                  scale={yScale}
                  width={innerWidth}
                  stroke={chartColors.grid}
                  strokeOpacity={0.5}
                />

                {/* Bars */}
                {bins.map((bin, i) => {
                  const value = showFrequency ? (bin.frequency || 0) : bin.count;
                  const barHeight = innerHeight - yScale(value);
                  const barX = xScale(bin.x0) + (xScale(bin.x1) - xScale(bin.x0) - barWidth) / 2;
                  const isHighlighted = highlightBins?.includes(i);

                  return (
                    <Bar
                      key={i}
                      x={barX}
                      y={yScale(value)}
                      width={barWidth}
                      height={barHeight}
                      fill={isHighlighted ? chartColors.warning : color}
                      fillOpacity={isHighlighted ? 0.9 : 0.7}
                      stroke={isHighlighted ? chartColors.warning : color}
                      strokeWidth={1}
                      rx={2}
                      onMouseMove={(e) => handleBarHover(e, bin)}
                      onMouseLeave={hideTooltip}
                      className="cursor-pointer hover:fill-opacity-90 transition-all"
                    />
                  );
                })}

                {/* Normal distribution overlay */}
                {showNormalOverlay && normalCurve.length > 0 && (
                  <LinePath
                    data={normalCurve}
                    x={(d) => xScale(d.x) ?? 0}
                    y={(d) => yScale(d.y) ?? 0}
                    curve={curveMonotoneX}
                    stroke={chartColors.danger}
                    strokeWidth={2}
                    strokeDasharray="6,4"
                  />
                )}

                {/* Axes */}
                <AxisBottom
                  top={innerHeight}
                  scale={xScale}
                  tickFormat={(d) => {
                    if (isSimpleFormat && simpleLabels[Math.round(d as number)]) {
                      return simpleLabels[Math.round(d as number)];
                    }
                    return formatNumber(d as number, 1);
                  }}
                  numTicks={isSimpleFormat ? simpleLabels.length : undefined}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: isSimpleFormat ? 9 : 11,
                    textAnchor: 'middle',
                    angle: isSimpleFormat && simpleLabels.length > 5 ? -45 : 0,
                  })}
                  label={effectiveXLabel}
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 12,
                    textAnchor: 'middle',
                  }}
                />
                <AxisLeft
                  scale={yScale}
                  tickFormat={(d) => showFrequency ? formatPercent(d as number) : formatNumber(d as number, 0)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 11,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                  label={effectiveYLabel || (showFrequency ? 'Frequency' : 'Count')}
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 12,
                    textAnchor: 'middle',
                  }}
                />

                {/* Mean line */}
                {stats && (
                  <line
                    x1={xScale(stats.mean)}
                    x2={xScale(stats.mean)}
                    y1={0}
                    y2={innerHeight}
                    stroke={chartColors.danger}
                    strokeWidth={2}
                    strokeDasharray="4,4"
                  />
                )}
              </Group>
            </svg>

            {/* Tooltip */}
            {tooltipData && (
              <TooltipWithBounds
                left={tooltipLeft}
                top={tooltipTop}
                style={tooltipStyles}
              >
                <div className="text-xs">
                  <div className="text-slate-500">
                    Range: {formatNumber(tooltipData.x0)} - {formatNumber(tooltipData.x1)}
                  </div>
                  <div className="font-medium mt-1">
                    {showFrequency
                      ? `Frequency: ${formatPercent(tooltipData.frequency || 0)}`
                      : `Count: ${tooltipData.count}`}
                  </div>
                </div>
              </TooltipWithBounds>
            )}

            {/* Bin slider */}
            {enableBinSlider && (
              <div className="px-4 pb-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <label className="text-xs text-slate-500 min-w-[60px]">Bins:</label>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={numBins}
                    onChange={(e) => setNumBins(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <span className="text-xs text-slate-600 min-w-[30px]">{numBins}</span>
                </div>
              </div>
            )}

            {/* Statistics legend */}
            {stats && (
              <div className="px-4 pb-2 flex gap-4 text-xs text-slate-600">
                <span>μ = {formatNumber(stats.mean)}</span>
                <span>σ = {formatNumber(stats.stdDev)}</span>
              </div>
            )}
          </div>
        );
      }}
    </ChartWrapper>
  );
}

export default Histogram;
