'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatNumber,
  formatPercent,
} from './ChartWrapper';

export interface SensitivityData {
  /** Parameter 1 values (x-axis) */
  param1Values: number[];
  /** Parameter 1 label */
  param1Label: string;
  /** Parameter 2 values (y-axis) */
  param2Values: number[];
  /** Parameter 2 label */
  param2Label: string;
  /** Result matrix [param1][param2] -> metric value */
  results: number[][];
  /** Metric label (e.g., "Sharpe Ratio", "Total Return") */
  metricLabel: string;
}

export interface SensitivityHeatmapProps {
  /** Sensitivity analysis data */
  data: SensitivityData;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Color for minimum value */
  minColor?: string;
  /** Color for maximum value */
  maxColor?: string;
  /** Color for mid value (diverging scale) */
  midColor?: string;
  /** Use diverging color scale */
  diverging?: boolean;
  /** Show overfitting zone (high values = potential overfit) */
  showOverfitZone?: boolean;
  /** Threshold for overfitting warning */
  overfitThreshold?: number;
  /** Show values in cells */
  showValues?: boolean;
  /** Highlight optimal cell */
  highlightOptimal?: boolean;
}

/**
 * Interpolate color between two hex colors
 */
function interpolateColor(t: number, color1: string, color2: string): string {
  const parse = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const c1 = parse(color1);
  const c2 = parse(color2);

  const r = Math.round(c1.r + t * (c2.r - c1.r));
  const g = Math.round(c1.g + t * (c2.g - c1.g));
  const b = Math.round(c1.b + t * (c2.b - c1.b));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get color for diverging scale
 */
function getDivergingColor(
  value: number,
  min: number,
  max: number,
  minColor: string,
  midColor: string,
  maxColor: string
): string {
  const mid = (min + max) / 2;

  if (value <= mid) {
    const t = (value - min) / (mid - min || 1);
    return interpolateColor(t, minColor, midColor);
  } else {
    const t = (value - mid) / (max - mid || 1);
    return interpolateColor(t, midColor, maxColor);
  }
}

/**
 * SensitivityHeatmap for parameter optimization and overfitting visualization
 */
export function SensitivityHeatmap({
  data,
  title,
  subtitle,
  minHeight = 400,
  margin = { top: 40, right: 100, bottom: 80, left: 80 },
  minColor = '#ef4444', // red for low values
  maxColor = '#22c55e', // green for high values
  midColor = '#fef9c3', // yellow for mid values
  diverging = true,
  showOverfitZone = false,
  overfitThreshold,
  showValues = true,
  highlightOptimal = true,
}: SensitivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{
    param1: number;
    param2: number;
    value: number;
    isOptimal: boolean;
    isOverfit: boolean;
  }>();

  // Calculate statistics
  const { min, max, optimal, overfitCells } = useMemo(() => {
    let minVal = Infinity;
    let maxVal = -Infinity;
    let optimalI = 0;
    let optimalJ = 0;
    const overfit: Set<string> = new Set();

    for (let i = 0; i < data.results.length; i++) {
      for (let j = 0; j < data.results[i].length; j++) {
        const val = data.results[i][j];
        if (val < minVal) minVal = val;
        if (val > maxVal) {
          maxVal = val;
          optimalI = i;
          optimalJ = j;
        }

        // Check for overfitting (edge parameters with high values)
        if (showOverfitZone && overfitThreshold !== undefined) {
          const isEdge =
            i === 0 || i === data.results.length - 1 ||
            j === 0 || j === data.results[i].length - 1;
          if (isEdge && val > overfitThreshold) {
            overfit.add(`${i}-${j}`);
          }
        }
      }
    }

    return {
      min: minVal,
      max: maxVal,
      optimal: { i: optimalI, j: optimalJ },
      overfitCells: overfit,
    };
  }, [data.results, showOverfitZone, overfitThreshold]);

  const handleCellHover = useCallback(
    (event: React.MouseEvent, i: number, j: number) => {
      const point = localPoint(event);
      if (point) {
        const value = data.results[i][j];
        const isOptimal = i === optimal.i && j === optimal.j;
        const isOverfit = overfitCells.has(`${i}-${j}`);

        setHoveredCell({ i, j });
        showTooltip({
          tooltipData: {
            param1: data.param1Values[i],
            param2: data.param2Values[j],
            value,
            isOptimal,
            isOverfit,
          },
          tooltipLeft: point.x,
          tooltipTop: point.y - 10,
        });
      }
    },
    [data, optimal, overfitCells, showTooltip]
  );

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
    hideTooltip();
  }, [hideTooltip]);

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      minHeight={minHeight}
    >
      {({ width, height }) => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const numRows = data.param1Values.length;
        const numCols = data.param2Values.length;

        const cellWidth = innerWidth / numCols;
        const cellHeight = innerHeight / numRows;

        return (
          <div className="relative">
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {/* Heatmap cells */}
                {data.results.map((row, i) =>
                  row.map((value, j) => {
                    const color = diverging
                      ? getDivergingColor(value, min, max, minColor, midColor, maxColor)
                      : interpolateColor((value - min) / (max - min || 1), minColor, maxColor);

                    const isOptimal = highlightOptimal && i === optimal.i && j === optimal.j;
                    const isOverfit = overfitCells.has(`${i}-${j}`);
                    const isHovered = hoveredCell?.i === i && hoveredCell?.j === j;

                    // Text color based on background brightness
                    const brightness =
                      (parseInt(color.slice(1, 3), 16) * 299 +
                        parseInt(color.slice(3, 5), 16) * 587 +
                        parseInt(color.slice(5, 7), 16) * 114) / 1000;
                    const textColor = brightness > 125 ? chartColors.text : 'white';

                    return (
                      <Group key={`${i}-${j}`}>
                        <rect
                          x={j * cellWidth}
                          y={i * cellHeight}
                          width={cellWidth - 1}
                          height={cellHeight - 1}
                          fill={color}
                          stroke={isOptimal ? chartColors.text : isOverfit ? chartColors.warning : isHovered ? chartColors.primary : 'transparent'}
                          strokeWidth={isOptimal || isOverfit ? 3 : isHovered ? 2 : 0}
                          rx={2}
                          className="cursor-pointer transition-all"
                          onMouseMove={(e) => handleCellHover(e, i, j)}
                          onMouseLeave={handleCellLeave}
                        />
                        {showValues && cellWidth > 35 && cellHeight > 25 && (
                          <text
                            x={j * cellWidth + cellWidth / 2}
                            y={i * cellHeight + cellHeight / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={Math.min(cellWidth / 4, 11)}
                            fill={textColor}
                            pointerEvents="none"
                          >
                            {formatNumber(value, 2)}
                          </text>
                        )}
                        {isOptimal && (
                          <text
                            x={j * cellWidth + cellWidth - 4}
                            y={i * cellHeight + 10}
                            textAnchor="end"
                            fontSize={10}
                            fill={textColor}
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            ★
                          </text>
                        )}
                        {isOverfit && (
                          <text
                            x={j * cellWidth + 4}
                            y={i * cellHeight + 12}
                            fontSize={10}
                            fill={chartColors.warning}
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            ⚠
                          </text>
                        )}
                      </Group>
                    );
                  })
                )}

                {/* Row labels (param1 - y-axis) */}
                {data.param1Values.map((val, i) => (
                  <text
                    key={`row-${i}`}
                    x={-8}
                    y={i * cellHeight + cellHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill={chartColors.text}
                  >
                    {formatNumber(val, 2)}
                  </text>
                ))}

                {/* Column labels (param2 - x-axis) */}
                {data.param2Values.map((val, j) => (
                  <text
                    key={`col-${j}`}
                    x={j * cellWidth + cellWidth / 2}
                    y={innerHeight + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fill={chartColors.text}
                  >
                    {formatNumber(val, 2)}
                  </text>
                ))}

                {/* Axis labels */}
                <text
                  x={-40}
                  y={innerHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill={chartColors.text}
                  transform={`rotate(-90, -40, ${innerHeight / 2})`}
                >
                  {data.param1Label}
                </text>
                <text
                  x={innerWidth / 2}
                  y={innerHeight + 40}
                  textAnchor="middle"
                  fontSize={11}
                  fill={chartColors.text}
                >
                  {data.param2Label}
                </text>
              </Group>

              {/* Color legend */}
              <Group left={width - margin.right + 15} top={margin.top}>
                <defs>
                  <linearGradient id="sensitivity-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor={minColor} />
                    <stop offset="50%" stopColor={midColor} />
                    <stop offset="100%" stopColor={maxColor} />
                  </linearGradient>
                </defs>
                <rect
                  width={15}
                  height={innerHeight}
                  fill="url(#sensitivity-gradient)"
                  rx={2}
                />
                <text x={20} y={5} fontSize={9} fill={chartColors.text}>
                  {formatNumber(max, 2)}
                </text>
                <text x={20} y={innerHeight / 2} fontSize={9} fill={chartColors.text}>
                  {formatNumber((min + max) / 2, 2)}
                </text>
                <text x={20} y={innerHeight - 2} fontSize={9} fill={chartColors.text}>
                  {formatNumber(min, 2)}
                </text>
                <text x={0} y={innerHeight + 20} fontSize={10} fill={chartColors.text}>
                  {data.metricLabel}
                </text>
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
                  <div className="flex items-center gap-2">
                    {tooltipData.isOptimal && (
                      <span className="text-yellow-500">★</span>
                    )}
                    {tooltipData.isOverfit && (
                      <span className="text-amber-500">⚠ Potential overfit</span>
                    )}
                    {tooltipData.isOptimal && (
                      <span className="font-medium text-green-600">Optimal</span>
                    )}
                  </div>
                  <div>
                    {data.param1Label}: <span className="font-medium">{formatNumber(tooltipData.param1, 2)}</span>
                  </div>
                  <div>
                    {data.param2Label}: <span className="font-medium">{formatNumber(tooltipData.param2, 2)}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    {data.metricLabel}: <span className="font-medium">{formatNumber(tooltipData.value, 4)}</span>
                  </div>
                </div>
              </TooltipWithBounds>
            )}

            {/* Legend */}
            <div className="px-4 pb-2 flex gap-4 text-xs">
              {highlightOptimal && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-slate-500">Optimal parameters</span>
                </div>
              )}
              {showOverfitZone && (
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">⚠</span>
                  <span className="text-slate-500">Potential overfitting zone</span>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </ChartWrapper>
  );
}

export default SensitivityHeatmap;
