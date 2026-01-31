'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import { curveMonotoneX, curveLinear } from '@visx/curve';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  seriesColors,
  tooltipStyles,
  formatNumber,
  formatDate,
  toDate,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

export interface DataPoint {
  date: Date;
  value: number;
}

// Flexible input format that accepts x/y data common in MDX
export interface FlexDataPoint {
  x?: number | string | Date;
  y?: number;
  y2?: number;
  y3?: number;
  y4?: number;
  date?: Date | string;
  value?: number;
  [key: string]: number | string | Date | undefined;
}

export interface Series {
  id: string;
  name: string;
  data: DataPoint[];
  color?: string;
}

// Flexible series input for MDX
export interface FlexSeriesConfig {
  key: string;
  name: string;
  color?: string;
}

export interface LineChartProps {
  /** Single series data (use this or series, not both) */
  data?: FlexDataPoint[];
  /** Multiple series for comparison (complex format) */
  series?: Series[] | FlexSeriesConfig[];
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Alias for yAxisLabel */
  yLabel?: string;
  /** X-axis label */
  xAxisLabel?: string;
  /** Alias for xAxisLabel */
  xLabel?: string;
  /** Show area fill under the line */
  showArea?: boolean;
  /** Curve type */
  curveType?: 'monotone' | 'linear';
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Minimum chart height */
  minHeight?: number;
  /** Enable range slider for zooming */
  enableSlider?: boolean;
  /** Show moving average */
  showMovingAverage?: boolean;
  /** Moving average period */
  movingAveragePeriod?: number;
  /** Line color (for single series) */
  color?: string;
}

// Accessor functions
const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;

/**
 * Convert flexible data format to internal DataPoint format
 */
function normalizeDataPoint(d: FlexDataPoint): DataPoint {
  const dateValue = d.date ?? d.x;
  const numValue = d.value ?? d.y ?? 0;
  return {
    date: toDate(dateValue ?? new Date()),
    value: numValue,
  };
}

/**
 * Calculate simple moving average
 */
function calculateMovingAverage(data: DataPoint[], period: number): DataPoint[] {
  const result: DataPoint[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].value;
    }
    result.push({
      date: data[i].date,
      value: sum / period,
    });
  }
  return result;
}

/**
 * LineChart component for equity curves, time series, and moving averages
 */
export function LineChart({
  data,
  series,
  title,
  subtitle,
  yAxisLabel,
  yLabel,
  xAxisLabel,
  xLabel,
  showArea = false,
  curveType = 'monotone',
  margin = defaultMargin,
  minHeight = 300,
  enableSlider = false,
  showMovingAverage = false,
  movingAveragePeriod = 20,
  color = chartColors.primary,
}: LineChartProps) {
  // Use aliases for axis labels
  const effectiveXLabel = xAxisLabel || xLabel;
  const effectiveYLabel = yAxisLabel || yLabel;

  // Handle range slider state
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(100);

  // Tooltip state
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ point: DataPoint; seriesName?: string; color: string }>();

  // Normalize data to series format
  const allSeries = useMemo((): Series[] => {
    // Handle series prop - could be Series[] or FlexSeriesConfig[]
    if (series && series.length > 0) {
      const firstSeries = series[0];

      // Check if it's FlexSeriesConfig (has 'key' property) - used with data prop
      if ('key' in firstSeries && typeof (firstSeries as FlexSeriesConfig).key === 'string' && data) {
        // FlexSeriesConfig - extract data from the main data array using keys
        return (series as FlexSeriesConfig[]).map((s, i) => {
          const seriesData: DataPoint[] = data.map(d => ({
            date: toDate(d.date ?? d.x ?? new Date()),
            value: (d[s.key] as number) ?? 0,
          }));
          return {
            id: s.key,
            name: s.name,
            data: applyPerformanceGuard(seriesData, MAX_DATA_POINTS),
            color: s.color || seriesColors[i % seriesColors.length],
          };
        });
      }

      // Regular Series[] format with own data arrays
      if ('data' in firstSeries && Array.isArray((firstSeries as Series).data)) {
        return (series as Series[]).map((s, i) => ({
          id: s.id,
          name: s.name,
          data: applyPerformanceGuard(s.data.map(d => normalizeDataPoint(d as unknown as FlexDataPoint)), MAX_DATA_POINTS),
          color: s.color || seriesColors[i % seriesColors.length],
        }));
      }
    }

    // Handle single data array (most common MDX usage)
    if (data) {
      return [{
        id: 'main',
        name: 'Value',
        data: applyPerformanceGuard(data.map(normalizeDataPoint), MAX_DATA_POINTS),
        color,
      }];
    }
    return [];
  }, [series, data, color]);

  // Apply range filter if slider is enabled
  const filteredSeries = useMemo(() => {
    if (!enableSlider) return allSeries;

    return allSeries.map(s => {
      const startIdx = Math.floor(s.data.length * rangeStart / 100);
      const endIdx = Math.ceil(s.data.length * rangeEnd / 100);
      return {
        ...s,
        data: s.data.slice(startIdx, endIdx),
      };
    });
  }, [allSeries, enableSlider, rangeStart, rangeEnd]);

  // Calculate moving averages
  const movingAverages = useMemo(() => {
    if (!showMovingAverage) return [];
    return filteredSeries.map(s => ({
      ...s,
      id: `${s.id}-ma`,
      name: `${s.name} (${movingAveragePeriod} MA)`,
      data: calculateMovingAverage(s.data, movingAveragePeriod),
      color: s.color + '80', // Semi-transparent
    }));
  }, [filteredSeries, showMovingAverage, movingAveragePeriod]);

  const curveFunction = curveType === 'monotone' ? curveMonotoneX : curveLinear;

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>, xScale: ReturnType<typeof scaleTime>, innerWidth: number) => {
      const point = localPoint(event);
      if (!point) return;

      const x0 = xScale.invert(point.x - margin.left) as Date;

      // Find closest point across all series
      let closestPoint: DataPoint | null = null;
      let closestSeries: typeof filteredSeries[0] | null = null;
      let minDistance = Infinity;

      for (const s of filteredSeries) {
        const idx = bisectDate(s.data, x0, 1);
        const d0 = s.data[idx - 1];
        const d1 = s.data[idx];

        if (d0) {
          const dist = Math.abs(x0.getTime() - d0.date.getTime());
          if (dist < minDistance) {
            minDistance = dist;
            closestPoint = d0;
            closestSeries = s;
          }
        }
        if (d1) {
          const dist = Math.abs(x0.getTime() - d1.date.getTime());
          if (dist < minDistance) {
            minDistance = dist;
            closestPoint = d1;
            closestSeries = s;
          }
        }
      }

      if (closestPoint && closestSeries) {
        showTooltip({
          tooltipData: {
            point: closestPoint,
            seriesName: closestSeries.name,
            color: closestSeries.color || chartColors.primary,
          },
          tooltipLeft: (xScale(closestPoint.date) as number) + margin.left,
          tooltipTop: point.y,
        });
      }
    },
    [filteredSeries, margin.left, showTooltip]
  );

  const legend = allSeries.length > 1 ? (
    <div className="flex flex-wrap gap-4">
      {allSeries.map(s => (
        <div key={s.id} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: s.color }}
          />
          <span className="text-xs text-slate-600">{s.name}</span>
        </div>
      ))}
    </div>
  ) : undefined;

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      minHeight={minHeight}
      legend={legend}
    >
      {({ width, height }) => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Calculate scales
        const allData = filteredSeries.flatMap(s => s.data);
        if (allData.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        const xScale = scaleTime({
          domain: [
            Math.min(...allData.map(d => d.date.getTime())),
            Math.max(...allData.map(d => d.date.getTime())),
          ],
          range: [0, innerWidth],
        });

        const yMin = Math.min(...allData.map(d => d.value));
        const yMax = Math.max(...allData.map(d => d.value));
        const yPadding = (yMax - yMin) * 0.1 || 1;

        const yScale = scaleLinear({
          domain: [yMin - yPadding, yMax + yPadding],
          range: [innerHeight, 0],
          nice: true,
        });

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
                <GridColumns
                  scale={xScale}
                  height={innerHeight}
                  stroke={chartColors.grid}
                  strokeOpacity={0.5}
                />

                {/* Area fills */}
                {showArea && filteredSeries.map(s => (
                  <AreaClosed
                    key={`area-${s.id}`}
                    data={s.data}
                    x={(d) => xScale(getDate(d)) ?? 0}
                    y={(d) => yScale(getValue(d)) ?? 0}
                    yScale={yScale}
                    curve={curveFunction}
                    fill={s.color}
                    fillOpacity={0.1}
                  />
                ))}

                {/* Lines */}
                {filteredSeries.map(s => (
                  <LinePath
                    key={s.id}
                    data={s.data}
                    x={(d) => xScale(getDate(d)) ?? 0}
                    y={(d) => yScale(getValue(d)) ?? 0}
                    curve={curveFunction}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                ))}

                {/* Moving averages */}
                {movingAverages.map(s => (
                  <LinePath
                    key={s.id}
                    data={s.data}
                    x={(d) => xScale(getDate(d)) ?? 0}
                    y={(d) => yScale(getValue(d)) ?? 0}
                    curve={curveFunction}
                    stroke={s.color}
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Axes */}
                <AxisBottom
                  top={innerHeight}
                  scale={xScale}
                  tickFormat={(d) => formatDate(d as Date)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 11,
                    textAnchor: 'middle',
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
                  tickFormat={(d) => formatNumber(d as number)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 11,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                  label={effectiveYLabel}
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 12,
                    textAnchor: 'middle',
                  }}
                />

                {/* Tooltip hover area */}
                <rect
                  width={innerWidth}
                  height={innerHeight}
                  fill="transparent"
                  onMouseMove={(e) => handleMouseMove(e, xScale, innerWidth)}
                  onMouseLeave={hideTooltip}
                />

                {/* Tooltip indicator line */}
                {tooltipData && (
                  <>
                    <line
                      x1={xScale(tooltipData.point.date)}
                      x2={xScale(tooltipData.point.date)}
                      y1={0}
                      y2={innerHeight}
                      stroke={chartColors.muted}
                      strokeWidth={1}
                      strokeDasharray="4,4"
                      pointerEvents="none"
                    />
                    <circle
                      cx={xScale(tooltipData.point.date)}
                      cy={yScale(tooltipData.point.value)}
                      r={5}
                      fill={tooltipData.color}
                      stroke="white"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  </>
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
                <div className="font-medium">{formatDate(tooltipData.point.date)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tooltipData.color }}
                  />
                  <span className="text-slate-600">{tooltipData.seriesName}:</span>
                  <span className="font-medium">{formatNumber(tooltipData.point.value)}</span>
                </div>
              </TooltipWithBounds>
            )}

            {/* Range Slider */}
            {enableSlider && (
              <div className="px-4 pb-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <label className="text-xs text-slate-500 min-w-[60px]">Range:</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={rangeEnd - 5}
                      value={rangeStart}
                      onChange={(e) => setRangeStart(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <span className="text-xs text-slate-600 min-w-[40px]">{rangeStart}%</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={rangeStart + 5}
                      max={100}
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <span className="text-xs text-slate-600 min-w-[40px]">{rangeEnd}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </ChartWrapper>
  );
}

export default LineChart;
