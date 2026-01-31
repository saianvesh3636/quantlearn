'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { LinePath, Circle } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleLinear } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatPercent,
  applyPerformanceGuard,
  MAX_DATA_POINTS,
} from './ChartWrapper';

export interface PortfolioPoint {
  /** Expected return (annualized) */
  return: number;
  /** Portfolio volatility/risk (annualized std dev) */
  risk: number;
  /** Portfolio weights (optional, for tooltip) */
  weights?: Record<string, number>;
  /** Sharpe ratio (optional) */
  sharpe?: number;
  /** Portfolio label */
  label?: string;
}

export interface AssetPoint {
  /** Asset name */
  name: string;
  /** Expected return */
  return: number;
  /** Asset volatility */
  risk: number;
  /** Asset color (optional) */
  color?: string;
}

export interface EfficientFrontierProps {
  /** Efficient frontier points (sorted by risk) */
  frontier: PortfolioPoint[];
  /** Individual assets */
  assets?: AssetPoint[];
  /** Current/optimal portfolio */
  optimalPortfolio?: PortfolioPoint;
  /** Market portfolio (tangent point) */
  marketPortfolio?: PortfolioPoint;
  /** Risk-free rate for Capital Market Line */
  riskFreeRate?: number;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Frontier line color */
  frontierColor?: string;
  /** Capital Market Line color */
  cmlColor?: string;
  /** Show Capital Market Line */
  showCML?: boolean;
  /** Show Sharpe ratio labels */
  showSharpeLabels?: boolean;
}

/**
 * EfficientFrontier for portfolio optimization visualization
 */
export function EfficientFrontier({
  frontier: rawFrontier,
  assets = [],
  optimalPortfolio,
  marketPortfolio,
  riskFreeRate,
  title,
  subtitle,
  minHeight = 400,
  margin = { top: 40, right: 80, bottom: 60, left: 70 },
  frontierColor = chartColors.primary,
  cmlColor = chartColors.warning,
  showCML = true,
  showSharpeLabels = false,
}: EfficientFrontierProps) {
  const frontier = useMemo(
    () => applyPerformanceGuard(rawFrontier, MAX_DATA_POINTS),
    [rawFrontier]
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ type: 'frontier' | 'asset' | 'optimal' | 'market'; data: PortfolioPoint | AssetPoint }>();

  const handlePointHover = useCallback(
    (
      event: React.MouseEvent,
      type: 'frontier' | 'asset' | 'optimal' | 'market',
      data: PortfolioPoint | AssetPoint
    ) => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: { type, data },
          tooltipLeft: point.x,
          tooltipTop: point.y - 10,
        });
      }
    },
    [showTooltip]
  );

  // Calculate max Sharpe portfolio if not provided
  const maxSharpePortfolio = useMemo(() => {
    if (marketPortfolio) return marketPortfolio;
    if (riskFreeRate === undefined || frontier.length === 0) return null;

    let maxSharpe = -Infinity;
    let maxSharpePoint: PortfolioPoint | null = null;

    for (const point of frontier) {
      const sharpe = (point.return - riskFreeRate) / point.risk;
      if (sharpe > maxSharpe) {
        maxSharpe = sharpe;
        maxSharpePoint = { ...point, sharpe };
      }
    }

    return maxSharpePoint;
  }, [frontier, riskFreeRate, marketPortfolio]);

  const legend = (
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-0.5" style={{ backgroundColor: frontierColor }} />
        <span className="text-slate-500">Efficient Frontier</span>
      </div>
      {showCML && riskFreeRate !== undefined && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ backgroundColor: cmlColor, borderStyle: 'dashed' }} />
          <span className="text-slate-500">Capital Market Line</span>
        </div>
      )}
      {assets.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors.muted }} />
          <span className="text-slate-500">Individual Assets</span>
        </div>
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
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        if (frontier.length === 0) {
          return <div className="flex items-center justify-center h-full text-slate-400">No data</div>;
        }

        // Collect all points for scale calculation
        const allPoints = [
          ...frontier,
          ...assets.map((a) => ({ return: a.return, risk: a.risk })),
          ...(optimalPortfolio ? [optimalPortfolio] : []),
          ...(maxSharpePortfolio ? [maxSharpePortfolio] : []),
        ];

        const riskMin = Math.min(...allPoints.map((p) => p.risk));
        const riskMax = Math.max(...allPoints.map((p) => p.risk));
        const returnMin = Math.min(
          ...allPoints.map((p) => p.return),
          riskFreeRate ?? Infinity
        );
        const returnMax = Math.max(...allPoints.map((p) => p.return));

        const riskPadding = (riskMax - riskMin) * 0.15;
        const returnPadding = (returnMax - returnMin) * 0.15;

        const xScale = scaleLinear({
          domain: [Math.max(0, riskMin - riskPadding), riskMax + riskPadding],
          range: [0, innerWidth],
          nice: true,
        });

        const yScale = scaleLinear({
          domain: [returnMin - returnPadding, returnMax + returnPadding],
          range: [innerHeight, 0],
          nice: true,
        });

        // Capital Market Line (from risk-free to tangent point extended)
        const cmlPoints =
          showCML && riskFreeRate !== undefined && maxSharpePortfolio
            ? [
                { risk: 0, return: riskFreeRate },
                {
                  risk: riskMax + riskPadding,
                  return:
                    riskFreeRate +
                    ((maxSharpePortfolio.return - riskFreeRate) /
                      maxSharpePortfolio.risk) *
                      (riskMax + riskPadding),
                },
              ]
            : [];

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

                {/* Capital Market Line */}
                {cmlPoints.length > 0 && (
                  <LinePath
                    data={cmlPoints}
                    x={(d) => xScale(d.risk) ?? 0}
                    y={(d) => yScale(d.return) ?? 0}
                    stroke={cmlColor}
                    strokeWidth={2}
                    strokeDasharray="6,4"
                  />
                )}

                {/* Efficient Frontier */}
                <LinePath
                  data={frontier}
                  x={(d) => xScale(d.risk) ?? 0}
                  y={(d) => yScale(d.return) ?? 0}
                  curve={curveMonotoneX}
                  stroke={frontierColor}
                  strokeWidth={3}
                />

                {/* Frontier points (interactive) */}
                {frontier.map((point, i) => (
                  <Circle
                    key={i}
                    cx={xScale(point.risk)}
                    cy={yScale(point.return)}
                    r={4}
                    fill={frontierColor}
                    stroke="white"
                    strokeWidth={1}
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseMove={(e) => handlePointHover(e, 'frontier', point)}
                    onMouseLeave={hideTooltip}
                  />
                ))}

                {/* Individual assets */}
                {assets.map((asset, i) => (
                  <Group key={`asset-${i}`}>
                    <Circle
                      cx={xScale(asset.risk)}
                      cy={yScale(asset.return)}
                      r={6}
                      fill={asset.color || chartColors.muted}
                      stroke="white"
                      strokeWidth={2}
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onMouseMove={(e) => handlePointHover(e, 'asset', asset)}
                      onMouseLeave={hideTooltip}
                    />
                    <text
                      x={xScale(asset.risk) + 10}
                      y={yScale(asset.return) + 4}
                      fontSize={10}
                      fill={chartColors.text}
                    >
                      {asset.name}
                    </text>
                  </Group>
                ))}

                {/* Risk-free rate point */}
                {riskFreeRate !== undefined && (
                  <Group>
                    <Circle
                      cx={xScale(0)}
                      cy={yScale(riskFreeRate)}
                      r={6}
                      fill={cmlColor}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <text
                      x={xScale(0) + 10}
                      y={yScale(riskFreeRate) + 4}
                      fontSize={10}
                      fill={chartColors.text}
                    >
                      Rf = {formatPercent(riskFreeRate)}
                    </text>
                  </Group>
                )}

                {/* Max Sharpe / Market portfolio */}
                {maxSharpePortfolio && (
                  <Group>
                    <Circle
                      cx={xScale(maxSharpePortfolio.risk)}
                      cy={yScale(maxSharpePortfolio.return)}
                      r={8}
                      fill={cmlColor}
                      stroke="white"
                      strokeWidth={2}
                      className="cursor-pointer"
                      onMouseMove={(e) => handlePointHover(e, 'market', maxSharpePortfolio)}
                      onMouseLeave={hideTooltip}
                    />
                    <text
                      x={xScale(maxSharpePortfolio.risk)}
                      y={yScale(maxSharpePortfolio.return) - 12}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={500}
                      fill={chartColors.text}
                    >
                      Max Sharpe
                    </text>
                    {showSharpeLabels && maxSharpePortfolio.sharpe && (
                      <text
                        x={xScale(maxSharpePortfolio.risk)}
                        y={yScale(maxSharpePortfolio.return) + 20}
                        textAnchor="middle"
                        fontSize={9}
                        fill={chartColors.textMuted}
                      >
                        SR = {maxSharpePortfolio.sharpe.toFixed(2)}
                      </text>
                    )}
                  </Group>
                )}

                {/* Optimal portfolio (if different from max Sharpe) */}
                {optimalPortfolio && optimalPortfolio !== maxSharpePortfolio && (
                  <Group>
                    <Circle
                      cx={xScale(optimalPortfolio.risk)}
                      cy={yScale(optimalPortfolio.return)}
                      r={8}
                      fill={chartColors.success}
                      stroke="white"
                      strokeWidth={2}
                      className="cursor-pointer"
                      onMouseMove={(e) => handlePointHover(e, 'optimal', optimalPortfolio)}
                      onMouseLeave={hideTooltip}
                    />
                    <text
                      x={xScale(optimalPortfolio.risk)}
                      y={yScale(optimalPortfolio.return) - 12}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={500}
                      fill={chartColors.text}
                    >
                      {optimalPortfolio.label || 'Optimal'}
                    </text>
                  </Group>
                )}

                {/* Axes */}
                <AxisBottom
                  top={innerHeight}
                  scale={xScale}
                  tickFormat={(d) => formatPercent(d as number)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'middle',
                  })}
                  label="Risk (σ)"
                  labelProps={{
                    fill: chartColors.text,
                    fontSize: 11,
                    textAnchor: 'middle',
                  }}
                />
                <AxisLeft
                  scale={yScale}
                  tickFormat={(d) => formatPercent(d as number)}
                  stroke={chartColors.muted}
                  tickStroke={chartColors.muted}
                  tickLabelProps={() => ({
                    fill: chartColors.text,
                    fontSize: 10,
                    textAnchor: 'end',
                    dy: '0.33em',
                  })}
                  label="Expected Return"
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
                <div className="text-xs space-y-1">
                  {tooltipData.type === 'asset' && (
                    <div className="font-medium">{(tooltipData.data as AssetPoint).name}</div>
                  )}
                  {tooltipData.type === 'optimal' && (
                    <div className="font-medium text-green-600">
                      {(tooltipData.data as PortfolioPoint).label || 'Optimal Portfolio'}
                    </div>
                  )}
                  {tooltipData.type === 'market' && (
                    <div className="font-medium text-amber-600">Max Sharpe Portfolio</div>
                  )}
                  <div>
                    Return: <span className="font-medium">{formatPercent(tooltipData.data.return)}</span>
                  </div>
                  <div>
                    Risk: <span className="font-medium">{formatPercent(tooltipData.data.risk)}</span>
                  </div>
                  {(tooltipData.data as PortfolioPoint).sharpe !== undefined && (
                    <div>
                      Sharpe: <span className="font-medium">{(tooltipData.data as PortfolioPoint).sharpe!.toFixed(2)}</span>
                    </div>
                  )}
                  {(tooltipData.data as PortfolioPoint).weights && (
                    <div className="pt-1 border-t border-slate-200">
                      <div className="text-slate-500 mb-0.5">Weights:</div>
                      {Object.entries((tooltipData.data as PortfolioPoint).weights!).map(([asset, weight]) => (
                        <div key={asset} className="flex justify-between gap-4">
                          <span className="text-slate-500">{asset}:</span>
                          <span className="font-medium">{formatPercent(weight)}</span>
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

export default EfficientFrontier;
