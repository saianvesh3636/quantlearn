'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { Bar, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
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

export interface CandleInput {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Candle {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SignalInput {
  date: Date | string;
  type: 'buy' | 'sell' | 'entry' | 'exit' | 'info';
  price: number;
  label?: string;
}

export interface Signal {
  date: Date;
  type: 'buy' | 'sell' | 'entry' | 'exit' | 'info';
  price: number;
  label?: string;
}

export interface CandlestickChartProps {
  /** Candlestick data */
  data: CandleInput[];
  /** Trading signals to overlay */
  signals?: SignalInput[];
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Bullish candle color */
  bullishColor?: string;
  /** Bearish candle color */
  bearishColor?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Show volume bars */
  showVolume?: boolean;
  /** Moving average periods to display */
  movingAverages?: number[];
}

/**
 * Calculate simple moving average for candles
 */
function calculateSMA(data: Candle[], period: number): { date: Date; value: number }[] {
  const result: { date: Date; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      date: data[i].date,
      value: sum / period,
    });
  }
  return result;
}

/**
 * CandlestickChart with signal overlays for trading visualization
 */
export function CandlestickChart({
  data: rawData,
  signals = [],
  title,
  subtitle,
  yAxisLabel = 'Price',
  bullishColor = chartColors.success,
  bearishColor = chartColors.danger,
  minHeight = 400,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
  showVolume = false,
  movingAverages = [],
}: CandlestickChartProps) {
  const data = useMemo(() => {
    // Convert string dates to Date objects
    const converted: Candle[] = rawData.map(d => ({
      ...d,
      date: toDate(d.date),
    }));
    return applyPerformanceGuard(converted, MAX_DATA_POINTS);
  }, [rawData]);

  const convertedSignals = useMemo(() => {
    return signals.map(s => ({
      ...s,
      date: toDate(s.date),
    }));
  }, [signals]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<Candle>();

  // Calculate moving averages
  const smaLines = useMemo(() => {
    return movingAverages.map((period, i) => ({
      period,
      data: calculateSMA(data, period),
      color: [chartColors.primary, chartColors.secondary, chartColors.warning][i % 3],
    }));
  }, [data, movingAverages]);

  const handleCandleHover = useCallback(
    (event: React.MouseEvent, candle: Candle) => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: candle,
          tooltipLeft: point.x,
          tooltipTop: point.y - 10,
        });
      }
    },
    [showTooltip]
  );

  // Signal type configurations
  const signalConfig = {
    buy: { shape: 'triangle-up', color: chartColors.success },
    sell: { shape: 'triangle-down', color: chartColors.danger },
    entry: { shape: 'circle', color: chartColors.primary },
    exit: { shape: 'circle', color: chartColors.warning },
    info: { shape: 'circle', color: chartColors.muted },
  };

  const legend = (
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3" style={{ backgroundColor: bullishColor }} />
        <span className="text-slate-500">Bullish</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3" style={{ backgroundColor: bearishColor }} />
        <span className="text-slate-500">Bearish</span>
      </div>
      {smaLines.map(sma => (
        <div key={sma.period} className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ backgroundColor: sma.color }} />
          <span className="text-slate-500">{sma.period} MA</span>
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
        const volumeHeight = showVolume ? 60 : 0;
        const chartHeight = height - margin.top - margin.bottom - volumeHeight;
        const innerWidth = width - margin.left - margin.right;

        if (data.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        // X scale (time-based)
        const xScale = scaleBand<string>({
          domain: data.map((d, i) => i.toString()),
          range: [0, innerWidth],
          padding: 0.3,
        });

        const candleWidth = xScale.bandwidth();

        // Y scale (price)
        const priceMin = Math.min(...data.map(d => d.low));
        const priceMax = Math.max(...data.map(d => d.high));
        const pricePadding = (priceMax - priceMin) * 0.1;

        const yScale = scaleLinear({
          domain: [priceMin - pricePadding, priceMax + pricePadding],
          range: [chartHeight, 0],
          nice: true,
        });

        // Volume scale
        const volumeScale = showVolume
          ? scaleLinear({
              domain: [0, Math.max(...data.map(d => d.volume || 0))],
              range: [volumeHeight, 0],
            })
          : null;

        // Time scale for moving averages and signals
        const timeScale = scaleTime({
          domain: [data[0].date, data[data.length - 1].date],
          range: [candleWidth / 2, innerWidth - candleWidth / 2],
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

                {/* Moving average lines */}
                {smaLines.map(sma => (
                  <LinePath
                    key={sma.period}
                    data={sma.data}
                    x={(d) => timeScale(d.date) ?? 0}
                    y={(d) => yScale(d.value) ?? 0}
                    stroke={sma.color}
                    strokeWidth={1.5}
                    strokeOpacity={0.8}
                  />
                ))}

                {/* Candlesticks */}
                {data.map((candle, i) => {
                  const isBullish = candle.close >= candle.open;
                  const color = isBullish ? bullishColor : bearishColor;
                  const x = xScale(i.toString()) ?? 0;
                  const bodyTop = yScale(Math.max(candle.open, candle.close));
                  const bodyBottom = yScale(Math.min(candle.open, candle.close));
                  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

                  return (
                    <Group
                      key={i}
                      className="cursor-pointer"
                      onMouseMove={(e) => handleCandleHover(e, candle)}
                      onMouseLeave={hideTooltip}
                    >
                      {/* Wick */}
                      <line
                        x1={x + candleWidth / 2}
                        x2={x + candleWidth / 2}
                        y1={yScale(candle.high)}
                        y2={yScale(candle.low)}
                        stroke={color}
                        strokeWidth={1}
                      />

                      {/* Body */}
                      <rect
                        x={x}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={isBullish ? 'transparent' : color}
                        stroke={color}
                        strokeWidth={1}
                        rx={1}
                        className="hover:opacity-80 transition-opacity"
                      />
                    </Group>
                  );
                })}

                {/* Signals */}
                {convertedSignals.map((signal, i) => {
                  const config = signalConfig[signal.type] || signalConfig.entry;
                  const x = timeScale(signal.date);
                  const y = yScale(signal.price);

                  return (
                    <Group key={i}>
                      {signal.type === 'buy' && (
                        <polygon
                          points={`${x},${y + 12} ${x - 6},${y + 20} ${x + 6},${y + 20}`}
                          fill={config.color}
                          stroke="white"
                          strokeWidth={1}
                        />
                      )}
                      {signal.type === 'sell' && (
                        <polygon
                          points={`${x},${y - 12} ${x - 6},${y - 20} ${x + 6},${y - 20}`}
                          fill={config.color}
                          stroke="white"
                          strokeWidth={1}
                        />
                      )}
                      {(signal.type === 'entry' || signal.type === 'exit' || signal.type === 'info') && (
                        <circle
                          cx={x}
                          cy={y}
                          r={6}
                          fill={config.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      )}
                      {signal.label && (
                        <text
                          x={x}
                          y={signal.type === 'buy' ? y + 32 : y - 28}
                          textAnchor="middle"
                          fontSize={9}
                          fill={chartColors.text}
                        >
                          {signal.label}
                        </text>
                      )}
                    </Group>
                  );
                })}

                {/* Y-axis */}
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
                  label={yAxisLabel}
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 12,
                    textAnchor: 'middle',
                  }}
                />
              </Group>

              {/* Volume bars */}
              {showVolume && volumeScale && (
                <Group left={margin.left} top={height - margin.bottom - volumeHeight}>
                  {data.map((candle, i) => {
                    const isBullish = candle.close >= candle.open;
                    const x = xScale(i.toString()) ?? 0;
                    const barHeight = volumeHeight - volumeScale(candle.volume || 0);

                    return (
                      <rect
                        key={i}
                        x={x}
                        y={volumeHeight - barHeight}
                        width={candleWidth}
                        height={barHeight}
                        fill={isBullish ? bullishColor : bearishColor}
                        fillOpacity={0.3}
                      />
                    );
                  })}
                </Group>
              )}

              {/* X-axis */}
              <Group left={margin.left} top={height - margin.bottom}>
                <AxisBottom
                  scale={scaleBand({
                    domain: data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map(d => formatDate(d.date)),
                    range: [0, innerWidth],
                  })}
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
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <span className="text-slate-500">Open:</span>
                    <span className="font-medium">{formatNumber(tooltipData.open)}</span>
                    <span className="text-slate-500">High:</span>
                    <span className="font-medium">{formatNumber(tooltipData.high)}</span>
                    <span className="text-slate-500">Low:</span>
                    <span className="font-medium">{formatNumber(tooltipData.low)}</span>
                    <span className="text-slate-500">Close:</span>
                    <span className="font-medium">{formatNumber(tooltipData.close)}</span>
                    {tooltipData.volume !== undefined && (
                      <>
                        <span className="text-slate-500">Volume:</span>
                        <span className="font-medium">{formatNumber(tooltipData.volume, 0)}</span>
                      </>
                    )}
                  </div>
                </div>
              </TooltipWithBounds>
            )}
          </div>
        );
      }}
    </ChartWrapper>
  );
}

export default CandlestickChart;
