'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { Circle, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { Annotation, Label, Connector, CircleSubject } from '@visx/annotation';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  seriesColors,
  tooltipStyles,
  formatNumber,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  size?: number;
  color?: string;
}

export interface ScatterSeries {
  id: string;
  name: string;
  data: ScatterPoint[];
  color?: string;
}

export interface AnnotationConfig {
  x: number;
  y: number;
  label: string;
  dx?: number;
  dy?: number;
}

export interface ScatterPlotProps {
  /** Single series data */
  data?: ScatterPoint[];
  /** Multiple series */
  series?: ScatterSeries[];
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** X-axis label */
  xAxisLabel?: string;
  /** Alias for xAxisLabel */
  xLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Alias for yAxisLabel */
  yLabel?: string;
  /** Show linear regression line */
  showRegression?: boolean;
  /** Point annotations */
  annotations?: AnnotationConfig[];
  /** Default point size */
  pointSize?: number;
  /** Point color (single series) */
  color?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Show correlation coefficient */
  showCorrelation?: boolean;
}

/**
 * Calculate linear regression coefficients
 */
function linearRegression(points: ScatterPoint[]): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const meanY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssTot += Math.pow(p.y - meanY, 2);
    ssRes += Math.pow(p.y - predicted, 2);
  }
  const r2 = 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * Calculate Pearson correlation coefficient
 */
function pearsonCorrelation(points: ScatterPoint[]): number {
  const n = points.length;
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * ScatterPlot with annotations for correlation and regression analysis
 */
export function ScatterPlot({
  data,
  series,
  title,
  subtitle,
  xAxisLabel,
  xLabel,
  yAxisLabel,
  yLabel,
  showRegression = false,
  annotations = [],
  pointSize = 6,
  color = chartColors.primary,
  minHeight = 300,
  margin = defaultMargin,
  showCorrelation = false,
}: ScatterPlotProps) {
  const effectiveXLabel = xAxisLabel || xLabel;
  const effectiveYLabel = yAxisLabel || yLabel;
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ point: ScatterPoint; seriesName?: string; color: string }>();

  // Normalize to series format
  const allSeries = useMemo(() => {
    if (series) {
      return series.map((s, i) => ({
        ...s,
        data: applyPerformanceGuard(s.data, MAX_DATA_POINTS),
        color: s.color || seriesColors[i % seriesColors.length],
      }));
    }
    if (data) {
      return [{
        id: 'main',
        name: 'Data',
        data: applyPerformanceGuard(data, MAX_DATA_POINTS),
        color,
      }];
    }
    return [];
  }, [series, data, color]);

  // Calculate regression for each series
  const regressions = useMemo(() => {
    if (!showRegression) return new Map();
    const map = new Map<string, { slope: number; intercept: number; r2: number }>();
    for (const s of allSeries) {
      map.set(s.id, linearRegression(s.data));
    }
    return map;
  }, [allSeries, showRegression]);

  // Calculate correlation
  const correlations = useMemo(() => {
    if (!showCorrelation) return new Map();
    const map = new Map<string, number>();
    for (const s of allSeries) {
      map.set(s.id, pearsonCorrelation(s.data));
    }
    return map;
  }, [allSeries, showCorrelation]);

  const handlePointHover = useCallback(
    (event: React.MouseEvent, point: ScatterPoint, seriesName: string, pointColor: string) => {
      const localPt = localPoint(event);
      if (localPt) {
        showTooltip({
          tooltipData: { point, seriesName, color: pointColor },
          tooltipLeft: localPt.x,
          tooltipTop: localPt.y - 10,
        });
      }
    },
    [showTooltip]
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
          {showCorrelation && correlations.has(s.id) && (
            <span className="text-xs text-slate-400">
              (r = {correlations.get(s.id)?.toFixed(3)})
            </span>
          )}
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

        const allPoints = allSeries.flatMap(s => s.data);
        if (allPoints.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        const xValues = allPoints.map(p => p.x);
        const yValues = allPoints.map(p => p.y);

        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);

        const xPadding = (xMax - xMin) * 0.1 || 1;
        const yPadding = (yMax - yMin) * 0.1 || 1;

        const xScale = scaleLinear({
          domain: [xMin - xPadding, xMax + xPadding],
          range: [0, innerWidth],
          nice: true,
        });

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

                {/* Regression lines */}
                {showRegression && allSeries.map(s => {
                  const reg = regressions.get(s.id);
                  if (!reg) return null;

                  const x1 = xMin - xPadding;
                  const x2 = xMax + xPadding;
                  const y1 = reg.slope * x1 + reg.intercept;
                  const y2 = reg.slope * x2 + reg.intercept;

                  return (
                    <line
                      key={`reg-${s.id}`}
                      x1={xScale(x1)}
                      y1={yScale(y1)}
                      x2={xScale(x2)}
                      y2={yScale(y2)}
                      stroke={s.color}
                      strokeWidth={2}
                      strokeDasharray="6,4"
                      strokeOpacity={0.7}
                    />
                  );
                })}

                {/* Points */}
                {allSeries.map(s => (
                  <Group key={s.id}>
                    {s.data.map((point, i) => (
                      <Circle
                        key={i}
                        cx={xScale(point.x)}
                        cy={yScale(point.y)}
                        r={point.size || pointSize}
                        fill={point.color || s.color}
                        fillOpacity={0.7}
                        stroke={point.color || s.color}
                        strokeWidth={1}
                        className="cursor-pointer hover:fill-opacity-100 transition-all"
                        onMouseMove={(e) => handlePointHover(e, point, s.name, point.color || s.color)}
                        onMouseLeave={hideTooltip}
                      />
                    ))}
                  </Group>
                ))}

                {/* Annotations */}
                {annotations.map((ann, i) => (
                  <Annotation
                    key={i}
                    x={xScale(ann.x)}
                    y={yScale(ann.y)}
                    dx={ann.dx || 40}
                    dy={ann.dy || -40}
                  >
                    <Connector stroke={chartColors.muted} />
                    <CircleSubject radius={8} stroke={chartColors.warning} fill={chartColors.warning} fillOpacity={0.3} />
                    <Label
                      title={ann.label}
                      showAnchorLine={false}
                      backgroundFill="white"
                      backgroundPadding={6}
                      fontColor={chartColors.text}
                      titleFontSize={11}
                    />
                  </Annotation>
                ))}

                {/* Axes */}
                <AxisBottom
                  top={innerHeight}
                  scale={xScale}
                  tickFormat={(d) => formatNumber(d as number)}
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
                  {tooltipData.point.label && (
                    <div className="font-medium mb-1">{tooltipData.point.label}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tooltipData.color }}
                    />
                    <span className="text-slate-500">{tooltipData.seriesName}</span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <div>X: <span className="font-medium">{formatNumber(tooltipData.point.x)}</span></div>
                    <div>Y: <span className="font-medium">{formatNumber(tooltipData.point.y)}</span></div>
                  </div>
                </div>
              </TooltipWithBounds>
            )}

            {/* Statistics */}
            {showCorrelation && allSeries.length === 1 && correlations.has(allSeries[0].id) && (
              <div className="px-4 pb-2 text-xs text-slate-600">
                Pearson r = {correlations.get(allSeries[0].id)?.toFixed(4)}
                {showRegression && regressions.has(allSeries[0].id) && (
                  <span className="ml-4">
                    R² = {regressions.get(allSeries[0].id)?.r2.toFixed(4)}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }}
    </ChartWrapper>
  );
}

export default ScatterPlot;
