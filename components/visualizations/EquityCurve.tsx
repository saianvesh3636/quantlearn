'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed, Bar } from '@visx/shape';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleTime } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatNumber,
  formatPercent,
  formatDate,
  toDate,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

export interface EquityPointInput {
  date: Date | string;
  equity: number;
  benchmark?: number;
  drawdown?: number;
}

export interface EquityPoint {
  date: Date;
  equity: number;
  benchmark?: number;
  drawdown?: number;
}

export interface EquityCurveProps {
  /** Equity curve data */
  data: EquityPointInput[];
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Equity line color */
  equityColor?: string;
  /** Benchmark line color */
  benchmarkColor?: string;
  /** Drawdown color */
  drawdownColor?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Show drawdown chart */
  showDrawdown?: boolean;
  /** Show benchmark comparison */
  showBenchmark?: boolean;
  /** Initial capital for percentage display */
  initialCapital?: number;
  /** Y-axis as percentage returns */
  showAsReturns?: boolean;
}

/**
 * Calculate drawdown from equity curve
 */
function calculateDrawdown(data: EquityPoint[]): EquityPoint[] {
  let peak = data[0]?.equity || 0;

  return data.map(point => {
    if (point.equity > peak) {
      peak = point.equity;
    }
    const drawdown = peak > 0 ? (point.equity - peak) / peak : 0;
    return {
      ...point,
      drawdown,
    };
  });
}

/**
 * Calculate max drawdown
 */
function calculateMaxDrawdown(data: EquityPoint[]): number {
  let peak = data[0]?.equity || 0;
  let maxDD = 0;

  for (const point of data) {
    if (point.equity > peak) {
      peak = point.equity;
    }
    const dd = peak > 0 ? (peak - point.equity) / peak : 0;
    if (dd > maxDD) {
      maxDD = dd;
    }
  }

  return maxDD;
}

const bisectDate = bisector<EquityPoint, Date>((d) => d.date).left;

/**
 * EquityCurve with drawdown visualization for backtesting results
 */
export function EquityCurve({
  data: rawData,
  title,
  subtitle,
  equityColor = chartColors.primary,
  benchmarkColor = chartColors.muted,
  drawdownColor = chartColors.danger,
  minHeight = 400,
  margin = { top: 40, right: 60, bottom: 50, left: 60 },
  showDrawdown = true,
  showBenchmark = true,
  initialCapital,
  showAsReturns = false,
}: EquityCurveProps) {
  const data = useMemo(() => {
    // Convert string dates to Date objects
    const converted: EquityPoint[] = rawData.map(d => ({
      ...d,
      date: toDate(d.date),
    }));
    const guarded = applyPerformanceGuard(converted, MAX_DATA_POINTS);
    return showDrawdown ? calculateDrawdown(guarded) : guarded;
  }, [rawData, showDrawdown]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<EquityPoint>();

  // Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const initial = initialCapital || data[0].equity;
    const final = data[data.length - 1].equity;
    const totalReturn = (final - initial) / initial;
    const maxDD = calculateMaxDrawdown(data);

    // Calculate daily returns for Sharpe approximation
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].equity - data[i - 1].equity) / data[i - 1].equity);
    }

    const avgReturn = returns.length > 0
      ? returns.reduce((a, b) => a + b, 0) / returns.length
      : 0;
    const stdDev = returns.length > 0
      ? Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length)
      : 0;

    // Annualized Sharpe (assuming daily data)
    const sharpe = stdDev > 0 ? (avgReturn * Math.sqrt(252)) / (stdDev * Math.sqrt(252)) : 0;

    return {
      totalReturn,
      maxDrawdown: maxDD,
      sharpe,
      initial,
      final,
    };
  }, [data, initialCapital]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent, xScale: ReturnType<typeof scaleTime>) => {
      const point = localPoint(event);
      if (!point) return;

      const x0 = xScale.invert(point.x - margin.left) as Date;
      const idx = bisectDate(data, x0, 1);
      const d0 = data[idx - 1];
      const d1 = data[idx];

      let closest: EquityPoint | undefined = d0;
      if (d1 && d0) {
        closest = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
      }

      if (closest) {
        showTooltip({
          tooltipData: closest,
          tooltipLeft: (xScale(closest.date) as number) + margin.left,
          tooltipTop: point.y,
        });
      }
    },
    [data, margin.left, showTooltip]
  );

  const legend = (
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-0.5" style={{ backgroundColor: equityColor }} />
        <span className="text-slate-500">Portfolio</span>
      </div>
      {showBenchmark && data.some(d => d.benchmark !== undefined) && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ backgroundColor: benchmarkColor }} />
          <span className="text-slate-500">Benchmark</span>
        </div>
      )}
      {stats && (
        <>
          <span className="text-slate-500">
            Return: <span className="font-medium" style={{ color: stats.totalReturn >= 0 ? chartColors.success : chartColors.danger }}>
              {formatPercent(stats.totalReturn)}
            </span>
          </span>
          <span className="text-slate-500">
            Max DD: <span className="font-medium" style={{ color: chartColors.danger }}>
              {formatPercent(stats.maxDrawdown)}
            </span>
          </span>
          <span className="text-slate-500">
            Sharpe: <span className="font-medium">{stats.sharpe.toFixed(2)}</span>
          </span>
        </>
      )}
    </div>
  );

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      minHeight={minHeight}
      legend={legend}
    >
      {({ width, height }) => {
        const drawdownHeight = showDrawdown ? 80 : 0;
        const chartHeight = height - margin.top - margin.bottom - drawdownHeight - 10;
        const innerWidth = width - margin.left - margin.right;

        if (data.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        // X scale (time)
        const xScale = scaleTime({
          domain: [data[0].date, data[data.length - 1].date],
          range: [0, innerWidth],
        });

        // Y scale (equity)
        const allEquities = data.flatMap(d =>
          [d.equity, d.benchmark].filter((v): v is number => v !== undefined)
        );
        const equityMin = Math.min(...allEquities);
        const equityMax = Math.max(...allEquities);
        const equityPadding = (equityMax - equityMin) * 0.1;

        const yScale = scaleLinear({
          domain: showAsReturns && stats
            ? [(equityMin - stats.initial) / stats.initial, (equityMax - stats.initial) / stats.initial + equityPadding / stats.initial]
            : [equityMin - equityPadding, equityMax + equityPadding],
          range: [chartHeight, 0],
          nice: true,
        });

        // Drawdown scale
        const drawdownScale = showDrawdown
          ? scaleLinear({
              domain: [Math.min(...data.map(d => d.drawdown || 0)), 0],
              range: [drawdownHeight, 0],
            })
          : null;

        const getY = (equity: number) => {
          if (showAsReturns && stats) {
            return yScale((equity - stats.initial) / stats.initial);
          }
          return yScale(equity);
        };

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

                {/* Benchmark line */}
                {showBenchmark && data.some(d => d.benchmark !== undefined) && (
                  <LinePath
                    data={data.filter(d => d.benchmark !== undefined)}
                    x={(d) => xScale(d.date) ?? 0}
                    y={(d) => getY(d.benchmark!) ?? 0}
                    curve={curveMonotoneX}
                    stroke={benchmarkColor}
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                  />
                )}

                {/* Equity line */}
                <LinePath
                  data={data}
                  x={(d) => xScale(d.date) ?? 0}
                  y={(d) => getY(d.equity) ?? 0}
                  curve={curveMonotoneX}
                  stroke={equityColor}
                  strokeWidth={2}
                />

                {/* Equity area fill */}
                <AreaClosed
                  data={data}
                  x={(d) => xScale(d.date) ?? 0}
                  y={(d) => getY(d.equity) ?? 0}
                  yScale={yScale}
                  curve={curveMonotoneX}
                  fill={equityColor}
                  fillOpacity={0.1}
                />

                {/* Y-axis */}
                <AxisLeft
                  scale={yScale}
                  tickFormat={(d) => showAsReturns ? formatPercent(d as number) : formatNumber(d as number)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                  label={showAsReturns ? 'Return' : 'Value'}
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 11,
                    textAnchor: 'middle',
                  }}
                />

                {/* Hover area */}
                <rect
                  width={innerWidth}
                  height={chartHeight}
                  fill="transparent"
                  onMouseMove={(e) => handleMouseMove(e, xScale)}
                  onMouseLeave={hideTooltip}
                />

                {/* Tooltip indicator */}
                {tooltipData && (
                  <>
                    <line
                      x1={xScale(tooltipData.date)}
                      x2={xScale(tooltipData.date)}
                      y1={0}
                      y2={chartHeight}
                      stroke={chartColors.muted}
                      strokeWidth={1}
                      strokeDasharray="4,4"
                      pointerEvents="none"
                    />
                    <circle
                      cx={xScale(tooltipData.date)}
                      cy={getY(tooltipData.equity)}
                      r={5}
                      fill={equityColor}
                      stroke="white"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  </>
                )}
              </Group>

              {/* Drawdown chart */}
              {showDrawdown && drawdownScale && (
                <Group left={margin.left} top={margin.top + chartHeight + 15}>
                  {/* Drawdown area */}
                  <AreaClosed
                    data={data}
                    x={(d) => xScale(d.date) ?? 0}
                    y={(d) => drawdownScale(d.drawdown || 0) ?? 0}
                    yScale={drawdownScale}
                    curve={curveMonotoneX}
                    fill={drawdownColor}
                    fillOpacity={0.3}
                  />
                  <LinePath
                    data={data}
                    x={(d) => xScale(d.date) ?? 0}
                    y={(d) => drawdownScale(d.drawdown || 0) ?? 0}
                    curve={curveMonotoneX}
                    stroke={drawdownColor}
                    strokeWidth={1.5}
                  />

                  {/* Drawdown axis */}
                  <AxisLeft
                    scale={drawdownScale}
                    tickFormat={(d) => formatPercent(d as number)}
                    stroke={chartColors.muted}
                    tickStroke={chartColors.muted}
                    numTicks={3}
                    tickLabelProps={() => ({
                      fill: chartColors.text,
                      fontSize: 9,
                      textAnchor: 'end',
                      dy: '0.33em',
                    })}
                  />

                  {/* Tooltip indicator on drawdown */}
                  {tooltipData && (
                    <circle
                      cx={xScale(tooltipData.date)}
                      cy={drawdownScale(tooltipData.drawdown || 0)}
                      r={4}
                      fill={drawdownColor}
                      stroke="white"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  )}
                </Group>
              )}

              {/* X-axis */}
              <Group left={margin.left} top={height - margin.bottom}>
                <AxisBottom
                  scale={xScale}
                  tickFormat={(d) => formatDate(d as Date)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'middle',
                  })}
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
                <div className="text-xs space-y-1">
                  <div className="font-medium">{formatDate(tooltipData.date)}</div>
                  <div>
                    Portfolio: <span className="font-medium">{formatNumber(tooltipData.equity)}</span>
                    {stats && (
                      <span className="text-slate-400 ml-1">
                        ({formatPercent((tooltipData.equity - stats.initial) / stats.initial)})
                      </span>
                    )}
                  </div>
                  {tooltipData.benchmark !== undefined && (
                    <div>
                      Benchmark: <span className="font-medium">{formatNumber(tooltipData.benchmark)}</span>
                    </div>
                  )}
                  {tooltipData.drawdown !== undefined && (
                    <div style={{ color: drawdownColor }}>
                      Drawdown: <span className="font-medium">{formatPercent(tooltipData.drawdown)}</span>
                    </div>
                  )}
                </div>
              </TooltipWithBounds>
            )}
          </div>
        );
      }}
    </ChartWrapper>
  );
}

export default EquityCurve;
