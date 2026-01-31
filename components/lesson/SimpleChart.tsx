'use client';

import { useState } from 'react';

interface DataPoint {
  label: string;
  value1: number;
  value2?: number;
}

interface SimpleChartProps {
  data: DataPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  series1Name?: string;
  series2Name?: string;
  series1Color?: string;
  series2Color?: string;
}

export default function SimpleChart({
  data,
  title,
  xLabel = 'X',
  yLabel = 'Y',
  series1Name = 'Series 1',
  series2Name = 'Series 2',
  series1Color = '#3b82f6',
  series2Color = '#10b981',
}: SimpleChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate bounds
  const allValues = data.flatMap(d => [d.value1, d.value2].filter(v => v !== undefined) as number[]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue || 1;

  const width = 600;
  const height = 300;
  const padding = { top: 40, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
  const yScale = (v: number) => padding.top + chartHeight - ((v - minValue) / range) * chartHeight;

  // Generate path for a series
  const generatePath = (getValue: (d: DataPoint) => number | undefined) => {
    const points = data
      .map((d, i) => {
        const v = getValue(d);
        if (v === undefined) return null;
        return `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`;
      })
      .filter(Boolean)
      .join(' ');
    return points;
  };

  const hasSeries2 = data.some(d => d.value2 !== undefined);

  return (
    <div className="w-full">
      {title && (
        <h4 className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h4>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + chartHeight * (1 - pct);
          const value = minValue + range * pct;
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 8}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-500"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {d.label}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-sm fill-gray-600 font-medium"
        >
          {xLabel}
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-sm fill-gray-600 font-medium"
        >
          {yLabel}
        </text>

        {/* Series 1 line */}
        <path
          d={generatePath(d => d.value1)}
          fill="none"
          stroke={series1Color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Series 2 line */}
        {hasSeries2 && (
          <path
            d={generatePath(d => d.value2)}
            fill="none"
            stroke={series2Color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points and hover */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={xScale(i)}
              cy={yScale(d.value1)}
              r={hoveredIndex === i ? 6 : 4}
              fill={series1Color}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {d.value2 !== undefined && (
              <circle
                cx={xScale(i)}
                cy={yScale(d.value2)}
                r={hoveredIndex === i ? 6 : 4}
                fill={series2Color}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )}
          </g>
        ))}

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <g>
            <rect
              x={xScale(hoveredIndex) - 60}
              y={yScale(data[hoveredIndex].value1) - 50}
              width={120}
              height={hasSeries2 ? 45 : 30}
              rx={4}
              fill="rgba(0,0,0,0.8)"
            />
            <text
              x={xScale(hoveredIndex)}
              y={yScale(data[hoveredIndex].value1) - 32}
              textAnchor="middle"
              className="text-xs fill-white"
            >
              {series1Name}: {data[hoveredIndex].value1.toFixed(2)}
            </text>
            {hasSeries2 && data[hoveredIndex].value2 !== undefined && (
              <text
                x={xScale(hoveredIndex)}
                y={yScale(data[hoveredIndex].value1) - 18}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                {series2Name}: {data[hoveredIndex].value2.toFixed(2)}
              </text>
            )}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: series1Color }} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{series1Name}</span>
        </div>
        {hasSeries2 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: series2Color }} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{series2Name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
