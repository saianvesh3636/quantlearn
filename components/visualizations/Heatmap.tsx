'use client';

import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { HeatmapRect } from '@visx/heatmap';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatNumber,
} from './ChartWrapper';

export interface HeatmapData {
  /** Row labels */
  rowLabels: string[];
  /** Column labels */
  columnLabels: string[];
  /** Matrix data (row-major order: data[row][col]) */
  data: number[][];
}

export interface HeatmapProps {
  /** Heatmap data structure */
  data: HeatmapData;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Color scale minimum (defaults to data min) */
  minValue?: number;
  /** Color scale maximum (defaults to data max) */
  maxValue?: number;
  /** Color for minimum value */
  minColor?: string;
  /** Color for maximum value */
  maxColor?: string;
  /** Color for zero/neutral value (for diverging scales) */
  midColor?: string;
  /** Use diverging color scale (negative to positive) */
  diverging?: boolean;
  /** Minimum chart height */
  minHeight?: number;
  /** Custom margin */
  margin?: typeof defaultMargin;
  /** Show values in cells */
  showValues?: boolean;
  /** Number of decimal places for displayed values */
  valueDecimals?: number;
}

/**
 * Get color for a value on a linear scale
 */
function interpolateColor(
  value: number,
  min: number,
  max: number,
  minColor: string,
  maxColor: string,
  midColor?: string
): string {
  // Parse hex colors to RGB
  const parseHex = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const toHex = (r: number, g: number, b: number) =>
    `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;

  if (midColor && min < 0 && max > 0) {
    // Diverging scale
    const minRGB = parseHex(minColor);
    const midRGB = parseHex(midColor);
    const maxRGB = parseHex(maxColor);

    if (value <= 0) {
      const t = Math.abs(value) / Math.abs(min);
      return toHex(
        midRGB.r + t * (minRGB.r - midRGB.r),
        midRGB.g + t * (minRGB.g - midRGB.g),
        midRGB.b + t * (minRGB.b - midRGB.b)
      );
    } else {
      const t = value / max;
      return toHex(
        midRGB.r + t * (maxRGB.r - midRGB.r),
        midRGB.g + t * (maxRGB.g - midRGB.g),
        midRGB.b + t * (maxRGB.b - midRGB.b)
      );
    }
  } else {
    // Linear scale
    const minRGB = parseHex(minColor);
    const maxRGB = parseHex(maxColor);
    const t = (value - min) / (max - min || 1);

    return toHex(
      minRGB.r + t * (maxRGB.r - minRGB.r),
      minRGB.g + t * (maxRGB.g - minRGB.g),
      minRGB.b + t * (maxRGB.b - minRGB.b)
    );
  }
}

/**
 * Heatmap for correlation matrices and covariance visualization
 */
export function Heatmap({
  data,
  title,
  subtitle,
  minValue,
  maxValue,
  minColor = '#3b82f6', // blue
  maxColor = '#ef4444', // red
  midColor = '#f8fafc', // slate-50 (white)
  diverging = true,
  minHeight = 400,
  margin = { top: 40, right: 80, bottom: 80, left: 80 },
  showValues = true,
  valueDecimals = 2,
}: HeatmapProps) {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ row: string; col: string; value: number }>();

  // Calculate min/max values from data
  const { computedMin, computedMax, bins } = useMemo(() => {
    const flatData = data.data.flat();
    const dataMin = minValue ?? Math.min(...flatData);
    const dataMax = maxValue ?? Math.max(...flatData);

    // Transform data for visx heatmap
    const heatmapBins = data.rowLabels.map((rowLabel, rowIndex) => ({
      bin: rowIndex,
      bins: data.columnLabels.map((colLabel, colIndex) => ({
        bin: colIndex,
        count: data.data[rowIndex][colIndex],
        rowLabel,
        colLabel,
      })),
    }));

    return {
      computedMin: dataMin,
      computedMax: dataMax,
      bins: heatmapBins,
    };
  }, [data, minValue, maxValue]);

  const handleCellHover = useCallback(
    (event: React.MouseEvent, row: string, col: string, value: number) => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: { row, col, value },
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

        const numRows = data.rowLabels.length;
        const numCols = data.columnLabels.length;

        const cellWidth = innerWidth / numCols;
        const cellHeight = innerHeight / numRows;

        const xScale = scaleBand<number>({
          domain: data.columnLabels.map((_, i) => i),
          range: [0, innerWidth],
        });

        const yScale = scaleBand<number>({
          domain: data.rowLabels.map((_, i) => i),
          range: [0, innerHeight],
        });

        const colorScale = scaleLinear<string>({
          domain: diverging ? [computedMin, 0, computedMax] : [computedMin, computedMax],
          range: diverging ? [minColor, midColor, maxColor] : [minColor, maxColor],
        });

        return (
          <div className="relative">
            <svg width={width} height={height}>
              <Group left={margin.left} top={margin.top}>
                {/* Heatmap cells */}
                {bins.map((row, rowIndex) =>
                  row.bins.map((cell, colIndex) => {
                    const fillColor = interpolateColor(
                      cell.count,
                      computedMin,
                      computedMax,
                      minColor,
                      maxColor,
                      diverging ? midColor : undefined
                    );

                    // Determine text color based on background brightness
                    const brightness =
                      (parseInt(fillColor.slice(1, 3), 16) * 299 +
                        parseInt(fillColor.slice(3, 5), 16) * 587 +
                        parseInt(fillColor.slice(5, 7), 16) * 114) /
                      1000;
                    const textColor = brightness > 125 ? chartColors.text : 'white';

                    return (
                      <Group key={`${rowIndex}-${colIndex}`}>
                        <rect
                          x={colIndex * cellWidth}
                          y={rowIndex * cellHeight}
                          width={cellWidth - 1}
                          height={cellHeight - 1}
                          fill={fillColor}
                          rx={2}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onMouseMove={(e) =>
                            handleCellHover(e, cell.rowLabel, cell.colLabel, cell.count)
                          }
                          onMouseLeave={hideTooltip}
                        />
                        {showValues && cellWidth > 30 && cellHeight > 20 && (
                          <text
                            x={colIndex * cellWidth + cellWidth / 2}
                            y={rowIndex * cellHeight + cellHeight / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={Math.min(cellWidth / 4, 12)}
                            fill={textColor}
                            pointerEvents="none"
                          >
                            {cell.count.toFixed(valueDecimals)}
                          </text>
                        )}
                      </Group>
                    );
                  })
                )}

                {/* Row labels (left) */}
                {data.rowLabels.map((label, i) => (
                  <text
                    key={`row-${i}`}
                    x={-8}
                    y={i * cellHeight + cellHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill={chartColors.text}
                  >
                    {label}
                  </text>
                ))}

                {/* Column labels (bottom) */}
                {data.columnLabels.map((label, i) => (
                  <text
                    key={`col-${i}`}
                    x={i * cellWidth + cellWidth / 2}
                    y={innerHeight + 16}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fontSize={11}
                    fill={chartColors.text}
                    transform={
                      label.length > 5
                        ? `rotate(-45, ${i * cellWidth + cellWidth / 2}, ${innerHeight + 16})`
                        : undefined
                    }
                  >
                    {label}
                  </text>
                ))}
              </Group>

              {/* Color scale legend */}
              <Group left={width - margin.right + 20} top={margin.top}>
                <defs>
                  <linearGradient id="heatmap-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor={minColor} />
                    {diverging && <stop offset="50%" stopColor={midColor} />}
                    <stop offset="100%" stopColor={maxColor} />
                  </linearGradient>
                </defs>
                <rect
                  width={15}
                  height={innerHeight}
                  fill="url(#heatmap-gradient)"
                  rx={2}
                />
                <text
                  x={20}
                  y={0}
                  fontSize={10}
                  fill={chartColors.text}
                >
                  {formatNumber(computedMax, valueDecimals)}
                </text>
                {diverging && (
                  <text
                    x={20}
                    y={innerHeight / 2}
                    fontSize={10}
                    fill={chartColors.text}
                  >
                    0
                  </text>
                )}
                <text
                  x={20}
                  y={innerHeight}
                  fontSize={10}
                  fill={chartColors.text}
                >
                  {formatNumber(computedMin, valueDecimals)}
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
                <div className="text-xs">
                  <div className="font-medium">
                    {tooltipData.row} × {tooltipData.col}
                  </div>
                  <div className="mt-1">
                    Value: <span className="font-medium">{formatNumber(tooltipData.value, valueDecimals)}</span>
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

export default Heatmap;
