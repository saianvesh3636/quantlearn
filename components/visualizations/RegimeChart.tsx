'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { LinePath, Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleTime, scaleOrdinal } from '@visx/scale';
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
  formatDate,
  toDate,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

// Internal format
export interface RegimeDataPoint {
  date: Date;
  price: number;
  regime: number; // 0, 1, 2, etc.
  probability?: number[]; // Probability of each regime
}

// Flexible input format
export interface RegimeDataPointInput {
  date: Date | string;
  price: number;
  regime: number | string;
  probability?: number[];
}

// Internal format
export interface RegimeConfig {
  id: number;
  name: string;
  color: string;
  description?: string;
}

// Flexible input format
export interface RegimeConfigInput {
  id?: number;
  name: string;
  color: string;
  description?: string;
}

export interface RegimeChartProps {
  /** Time series data with regime labels */
  data: RegimeDataPointInput[];
  /** Regime configuration */
  regimes: RegimeConfigInput[];
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Price line color */
  priceColor?: string;
  /** Show regime probability bars */
  showProbabilities?: boolean;
  /** Probability bar height */
  probabilityHeight?: number;
}

const bisectDate = bisector<RegimeDataPoint, Date>((d) => d.date).left;

/**
 * RegimeChart for visualizing Hidden Markov Model states on price data
 */
export function RegimeChart({
  data: rawData,
  regimes: rawRegimes,
  title,
  subtitle,
  yAxisLabel = 'Price',
  minHeight = 400,
  margin = { top: 40, right: 60, bottom: 50, left: 60 },
  priceColor = chartColors.text,
  showProbabilities = false,
  probabilityHeight = 60,
}: RegimeChartProps) {
  // Normalize regime configs - add ids if missing
  const regimes: RegimeConfig[] = useMemo(() => {
    return rawRegimes.map((r, i) => ({
      ...r,
      id: r.id ?? i,
    }));
  }, [rawRegimes]);

  // Build regime name to id mapping for string regimes
  const regimeNameToId = useMemo(() => {
    const map = new Map<string, number>();
    regimes.forEach(r => {
      map.set(r.name.toLowerCase(), r.id);
    });
    return map;
  }, [regimes]);

  // Normalize data - convert string dates and string regimes
  const data = useMemo(() => {
    const converted: RegimeDataPoint[] = rawData.map(d => {
      let regimeId: number;
      if (typeof d.regime === 'string') {
        // Try to match by name (case insensitive)
        regimeId = regimeNameToId.get(d.regime.toLowerCase()) ?? 0;
      } else {
        regimeId = d.regime;
      }
      return {
        date: toDate(d.date),
        price: d.price,
        regime: regimeId,
        probability: d.probability,
      };
    });
    return applyPerformanceGuard(converted, MAX_DATA_POINTS);
  }, [rawData, regimeNameToId]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<RegimeDataPoint>();

  // Group consecutive data points by regime for background fills
  const regimeRanges = useMemo(() => {
    const ranges: { regime: number; start: Date; end: Date }[] = [];
    if (data.length === 0) return ranges;

    let currentRegime = data[0].regime;
    let startDate = data[0].date;

    for (let i = 1; i < data.length; i++) {
      if (data[i].regime !== currentRegime) {
        ranges.push({
          regime: currentRegime,
          start: startDate,
          end: data[i - 1].date,
        });
        currentRegime = data[i].regime;
        startDate = data[i].date;
      }
    }

    // Add last range
    ranges.push({
      regime: currentRegime,
      start: startDate,
      end: data[data.length - 1].date,
    });

    return ranges;
  }, [data]);

  const regimeColorScale = useMemo(
    () =>
      scaleOrdinal<number, string>({
        domain: regimes.map((r) => r.id),
        range: regimes.map((r) => r.color),
      }),
    [regimes]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent, xScale: ReturnType<typeof scaleTime>) => {
      const point = localPoint(event);
      if (!point) return;

      const x0 = xScale.invert(point.x - margin.left) as Date;
      const idx = bisectDate(data, x0, 1);
      const d0 = data[idx - 1];
      const d1 = data[idx];

      let closest: RegimeDataPoint | undefined = d0;
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
      {regimes.map((regime) => (
        <div key={regime.id} className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: regime.color, opacity: 0.4 }}
          />
          <span className="text-slate-500">{regime.name}</span>
        </div>
      ))}
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
        const probHeight = showProbabilities ? probabilityHeight : 0;
        const chartHeight = height - margin.top - margin.bottom - probHeight - 10;
        const innerWidth = width - margin.left - margin.right;

        if (data.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        // X scale (time)
        const xScale = scaleTime({
          domain: [data[0].date, data[data.length - 1].date],
          range: [0, innerWidth],
        });

        // Y scale (price)
        const priceMin = Math.min(...data.map((d) => d.price));
        const priceMax = Math.max(...data.map((d) => d.price));
        const pricePadding = (priceMax - priceMin) * 0.1;

        const yScale = scaleLinear({
          domain: [priceMin - pricePadding, priceMax + pricePadding],
          range: [chartHeight, 0],
          nice: true,
        });

        // Probability scale
        const probScale = showProbabilities
          ? scaleLinear({
              domain: [0, 1],
              range: [probHeight, 0],
            })
          : null;

        return (
          <div className="relative">
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {/* Regime background fills */}
                {regimeRanges.map((range, i) => (
                  <rect
                    key={i}
                    x={xScale(range.start)}
                    y={0}
                    width={xScale(range.end) - xScale(range.start)}
                    height={chartHeight}
                    fill={regimeColorScale(range.regime)}
                    fillOpacity={0.2}
                  />
                ))}

                {/* Grid */}
                <GridRows
                  scale={yScale}
                  width={innerWidth}
                  stroke={chartColors.grid}
                  strokeOpacity={0.5}
                />

                {/* Price line */}
                <LinePath
                  data={data}
                  x={(d) => xScale(d.date) ?? 0}
                  y={(d) => yScale(d.price) ?? 0}
                  curve={curveMonotoneX}
                  stroke={priceColor}
                  strokeWidth={2}
                />

                {/* Y-axis */}
                <AxisLeft
                  scale={yScale}
                  tickFormat={(d) => formatNumber(d as number)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                  label={yAxisLabel}
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
                      cy={yScale(tooltipData.price)}
                      r={5}
                      fill={regimeColorScale(tooltipData.regime)}
                      stroke="white"
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                  </>
                )}
              </Group>

              {/* Probability bars */}
              {showProbabilities && probScale && (
                <Group left={margin.left} top={margin.top + chartHeight + 15}>
                  {/* Stacked probability bars for each time point */}
                  {data.map((point, i) => {
                    if (!point.probability) return null;

                    const barWidth = Math.max(1, innerWidth / data.length);
                    let yOffset = 0;

                    return (
                      <Group key={i}>
                        {point.probability.map((prob, regimeIdx) => {
                          const barHeight = probHeight * prob;
                          const bar = (
                            <rect
                              key={`${i}-${regimeIdx}`}
                              x={xScale(point.date) - barWidth / 2}
                              y={probHeight - yOffset - barHeight}
                              width={barWidth}
                              height={barHeight}
                              fill={regimeColorScale(regimeIdx)}
                              fillOpacity={0.6}
                            />
                          );
                          yOffset += barHeight;
                          return bar;
                        })}
                      </Group>
                    );
                  })}

                  {/* Probability axis */}
                  <AxisLeft
                    scale={probScale}
                    tickValues={[0, 0.5, 1]}
                    tickFormat={(d) => `${(d as number) * 100}%`}
                    stroke={chartColors.muted}
                    tickStroke={chartColors.muted}
                    tickLabelProps={() => ({
                      fill: chartColors.text,
                      fontSize: 9,
                      textAnchor: 'end',
                      dy: '0.33em',
                    })}
                  />

                  {/* Tooltip indicator on probability */}
                  {tooltipData && (
                    <line
                      x1={xScale(tooltipData.date)}
                      x2={xScale(tooltipData.date)}
                      y1={0}
                      y2={probHeight}
                      stroke={chartColors.muted}
                      strokeWidth={1}
                      strokeDasharray="4,4"
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
                    Price: <span className="font-medium">{formatNumber(tooltipData.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Regime:</span>
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: regimeColorScale(tooltipData.regime) }}
                    />
                    <span className="font-medium">
                      {regimes.find((r) => r.id === tooltipData.regime)?.name || `Regime ${tooltipData.regime}`}
                    </span>
                  </div>
                  {tooltipData.probability && (
                    <div className="pt-1 border-t border-slate-200 space-y-0.5">
                      {tooltipData.probability.map((prob, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">
                            {regimes.find((r) => r.id === idx)?.name || `Regime ${idx}`}:
                          </span>
                          <span className="font-medium">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      ))}
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

export default RegimeChart;
