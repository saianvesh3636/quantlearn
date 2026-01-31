'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { curveStepAfter, curveStepBefore } from '@visx/curve';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatNumber,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

export interface OrderLevel {
  price: number;
  size: number;
  total?: number; // Cumulative size
}

export interface OrderBookData {
  bids: OrderLevel[];
  asks: OrderLevel[];
  midPrice?: number;
  spread?: number;
}

export interface OrderBookProps {
  /** Order book data */
  data: OrderBookData;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Bid color */
  bidColor?: string;
  /** Ask color */
  askColor?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Show individual price levels as bars */
  showLevelBars?: boolean;
  /** Number of price levels to display */
  maxLevels?: number;
  /** Price precision (decimal places) */
  pricePrecision?: number;
  /** Size precision (decimal places) */
  sizePrecision?: number;
}

/**
 * Calculate cumulative depth for order book levels
 */
function calculateCumulativeDepth(levels: OrderLevel[]): OrderLevel[] {
  let total = 0;
  return levels.map(level => {
    total += level.size;
    return { ...level, total };
  });
}

/**
 * OrderBook depth chart for market microstructure visualization
 */
export function OrderBook({
  data,
  title,
  subtitle,
  bidColor = chartColors.success,
  askColor = chartColors.danger,
  minHeight = 350,
  margin = { top: 40, right: 60, bottom: 50, left: 60 },
  showLevelBars = true,
  maxLevels = 50,
  pricePrecision = 2,
  sizePrecision = 4,
}: OrderBookProps) {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ level: OrderLevel; side: 'bid' | 'ask' }>();

  // Process and limit data
  const { bids, asks, midPrice, spread } = useMemo(() => {
    const processedBids = calculateCumulativeDepth(
      applyPerformanceGuard(
        data.bids.slice().sort((a, b) => b.price - a.price),
        maxLevels
      )
    );
    const processedAsks = calculateCumulativeDepth(
      applyPerformanceGuard(
        data.asks.slice().sort((a, b) => a.price - b.price),
        maxLevels
      )
    );

    const bestBid = processedBids[0]?.price || 0;
    const bestAsk = processedAsks[0]?.price || 0;
    const mid = data.midPrice || (bestBid + bestAsk) / 2;
    const sp = data.spread || (bestAsk - bestBid);

    return {
      bids: processedBids,
      asks: processedAsks,
      midPrice: mid,
      spread: sp,
    };
  }, [data, maxLevels]);

  const handleLevelHover = useCallback(
    (event: React.MouseEvent, level: OrderLevel, side: 'bid' | 'ask') => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: { level, side },
          tooltipLeft: point.x,
          tooltipTop: point.y - 10,
        });
      }
    },
    [showTooltip]
  );

  const legend = (
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3" style={{ backgroundColor: bidColor, opacity: 0.3 }} />
        <span className="text-slate-500">Bids</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3" style={{ backgroundColor: askColor, opacity: 0.3 }} />
        <span className="text-slate-500">Asks</span>
      </div>
      <div className="text-slate-500">
        Spread: <span className="font-medium">{formatNumber(spread, pricePrecision)}</span> ({formatNumber(spread / midPrice * 100, 3)}%)
      </div>
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
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        if (bids.length === 0 && asks.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        // Price range
        const allPrices = [...bids.map(b => b.price), ...asks.map(a => a.price)];
        const priceMin = Math.min(...allPrices);
        const priceMax = Math.max(...allPrices);
        const pricePadding = (priceMax - priceMin) * 0.05;

        // Depth range (cumulative size)
        const maxDepth = Math.max(
          bids[bids.length - 1]?.total || 0,
          asks[asks.length - 1]?.total || 0
        );

        const xScale = scaleLinear({
          domain: [priceMin - pricePadding, priceMax + pricePadding],
          range: [0, innerWidth],
        });

        const yScale = scaleLinear({
          domain: [0, maxDepth * 1.1],
          range: [innerHeight, 0],
          nice: true,
        });

        // Bar width for individual levels
        const barWidth = showLevelBars ? Math.max(2, (innerWidth / (bids.length + asks.length)) * 0.8) : 0;

        // Create area data points
        const bidAreaData = [
          { price: bids[0]?.price || midPrice, total: 0 },
          ...bids.map(b => ({ price: b.price, total: b.total || 0 })),
        ];

        const askAreaData = [
          { price: asks[0]?.price || midPrice, total: 0 },
          ...asks.map(a => ({ price: a.price, total: a.total || 0 })),
        ];

        return (
          <div className="relative">
            <svg width={width} height={height}>
              <defs>
                <linearGradient id="bid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={bidColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={bidColor} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="ask-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={askColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={askColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <Group left={margin.left} top={margin.top}>
                {/* Bid area (cumulative depth) */}
                <AreaClosed
                  data={bidAreaData}
                  x={(d) => xScale(d.price) ?? 0}
                  y={(d) => yScale(d.total) ?? 0}
                  yScale={yScale}
                  curve={curveStepBefore}
                  fill="url(#bid-gradient)"
                  stroke={bidColor}
                  strokeWidth={2}
                />

                {/* Ask area (cumulative depth) */}
                <AreaClosed
                  data={askAreaData}
                  x={(d) => xScale(d.price) ?? 0}
                  y={(d) => yScale(d.total) ?? 0}
                  yScale={yScale}
                  curve={curveStepAfter}
                  fill="url(#ask-gradient)"
                  stroke={askColor}
                  strokeWidth={2}
                />

                {/* Individual level bars */}
                {showLevelBars && (
                  <>
                    {bids.map((bid, i) => (
                      <Bar
                        key={`bid-${i}`}
                        x={xScale(bid.price) - barWidth / 2}
                        y={yScale(bid.size)}
                        width={barWidth}
                        height={innerHeight - yScale(bid.size)}
                        fill={bidColor}
                        fillOpacity={0.5}
                        className="cursor-pointer hover:fill-opacity-70 transition-all"
                        onMouseMove={(e) => handleLevelHover(e, bid, 'bid')}
                        onMouseLeave={hideTooltip}
                      />
                    ))}
                    {asks.map((ask, i) => (
                      <Bar
                        key={`ask-${i}`}
                        x={xScale(ask.price) - barWidth / 2}
                        y={yScale(ask.size)}
                        width={barWidth}
                        height={innerHeight - yScale(ask.size)}
                        fill={askColor}
                        fillOpacity={0.5}
                        className="cursor-pointer hover:fill-opacity-70 transition-all"
                        onMouseMove={(e) => handleLevelHover(e, ask, 'ask')}
                        onMouseLeave={hideTooltip}
                      />
                    ))}
                  </>
                )}

                {/* Mid price line */}
                <line
                  x1={xScale(midPrice)}
                  x2={xScale(midPrice)}
                  y1={0}
                  y2={innerHeight}
                  stroke={chartColors.muted}
                  strokeWidth={2}
                  strokeDasharray="4,4"
                />
                <text
                  x={xScale(midPrice)}
                  y={-8}
                  textAnchor="middle"
                  fontSize={10}
                  fill={chartColors.text}
                >
                  Mid: {formatNumber(midPrice, pricePrecision)}
                </text>

                {/* Axes */}
                <AxisBottom
                  top={innerHeight}
                  scale={xScale}
                  tickFormat={(d) => formatNumber(d as number, pricePrecision)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'middle',
                  })}
                  label="Price"
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 11,
                    textAnchor: 'middle',
                  }}
                />
                <AxisLeft
                  scale={yScale}
                  tickFormat={(d) => formatNumber(d as number, sizePrecision)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                  label="Cumulative Size"
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 11,
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
                  <div
                    className="font-medium"
                    style={{ color: tooltipData.side === 'bid' ? bidColor : askColor }}
                  >
                    {tooltipData.side === 'bid' ? 'Bid' : 'Ask'}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <div>Price: <span className="font-medium">{formatNumber(tooltipData.level.price, pricePrecision)}</span></div>
                    <div>Size: <span className="font-medium">{formatNumber(tooltipData.level.size, sizePrecision)}</span></div>
                    {tooltipData.level.total !== undefined && (
                      <div>Total: <span className="font-medium">{formatNumber(tooltipData.level.total, sizePrecision)}</span></div>
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

export default OrderBook;
