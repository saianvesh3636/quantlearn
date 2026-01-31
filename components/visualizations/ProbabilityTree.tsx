'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { LinkHorizontal } from '@visx/shape';
import { Tooltip, useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import {
  ChartWrapper,
  defaultMargin,
  chartColors,
  tooltipStyles,
  formatPercent,
} from './ChartWrapper';

export interface TreeNode {
  /** Display name for the node */
  name: string;
  /** Probability of reaching this node from parent (0-1) */
  probability?: number;
  /** Whether this node is expandable (has children that can be shown) */
  expandable?: boolean;
  /** Child nodes */
  children?: TreeNode[];
  /** Optional additional data for tooltip */
  data?: Record<string, unknown>;
}

export interface ProbabilityTreeProps {
  /** Root node of the tree */
  root: TreeNode;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Minimum chart height */
  minHeight?: number;
  /** Node size (radius) */
  nodeSize?: number;
  /** Expand all nodes by default */
  defaultExpanded?: boolean;
  /** Custom margin */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** Show cumulative probability at each node */
  showCumulativeProbability?: boolean;
}

interface HierarchyNode {
  data: TreeNode;
  x: number;
  y: number;
  depth: number;
  parent: HierarchyNode | null;
  children?: HierarchyNode[];
}

/**
 * Calculate cumulative probability for a node
 */
function getCumulativeProbability(node: HierarchyNode): number {
  if (!node.parent) return 1;
  const parentProb = getCumulativeProbability(node.parent);
  return parentProb * (node.data.probability || 1);
}

/**
 * ProbabilityTree for visualizing Bayesian probability trees
 */
export function ProbabilityTree({
  root,
  title,
  subtitle,
  minHeight = 400,
  nodeSize = 24,
  defaultExpanded = true,
  margin = { top: 30, right: 120, bottom: 30, left: 120 },
  showCumulativeProbability = false,
}: ProbabilityTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    defaultExpanded ? new Set(['root']) : new Set(['root'])
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ node: TreeNode; cumulativeProb: number }>();

  // Build expanded tree structure
  const treeData = useMemo(() => {
    const buildTree = (node: TreeNode, path: string): TreeNode => {
      const currentPath = path + '/' + node.name;
      const isExpanded = expandedNodes.has(currentPath) || defaultExpanded;

      return {
        ...node,
        children: isExpanded && node.children ? node.children.map(child => buildTree(child, currentPath)) : undefined,
      };
    };

    return buildTree(root, '');
  }, [root, expandedNodes, defaultExpanded]);

  const toggleExpand = useCallback((nodePath: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodePath)) {
        next.delete(nodePath);
      } else {
        next.add(nodePath);
      }
      return next;
    });
  }, []);

  const handleNodeHover = useCallback(
    (event: React.MouseEvent, node: HierarchyNode) => {
      const point = localPoint(event);
      if (point) {
        showTooltip({
          tooltipData: {
            node: node.data,
            cumulativeProb: getCumulativeProbability(node),
          },
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

        const hierarchyData = hierarchy(treeData);
        const treeSize: [number, number] = [innerHeight, innerWidth];

        return (
          <div className="relative">
            <svg width={width} height={height}>
              <Tree<TreeNode>
                root={hierarchyData}
                size={treeSize}
              >
                {(tree) => (
                  <Group left={margin.left} top={margin.top}>
                    {/* Links */}
                    {tree.links().map((link, i) => (
                      <LinkHorizontal
                        key={i}
                        data={link}
                        stroke={chartColors.grid}
                        strokeWidth={2}
                        fill="none"
                      />
                    ))}

                    {/* Nodes */}
                    {tree.descendants().map((node, i) => {
                      const isLeaf = !node.children || node.children.length === 0;
                      const hasHiddenChildren = node.data.children && node.data.children.length > 0 && (!node.children || node.children.length === 0);
                      const nodePath = getNodePath(node as unknown as HierarchyNode);
                      const cumulativeProb = getCumulativeProbability(node as unknown as HierarchyNode);

                      return (
                        <Group
                          key={i}
                          top={node.x}
                          left={node.y}
                          className="cursor-pointer"
                          onClick={() => hasHiddenChildren && toggleExpand(nodePath)}
                          onMouseMove={(e) => handleNodeHover(e, node as unknown as HierarchyNode)}
                          onMouseLeave={hideTooltip}
                        >
                          {/* Node circle */}
                          <circle
                            r={nodeSize / 2}
                            fill={
                              isLeaf
                                ? chartColors.success
                                : hasHiddenChildren
                                ? chartColors.warning
                                : chartColors.primary
                            }
                            stroke="white"
                            strokeWidth={2}
                            className="transition-all hover:opacity-80"
                          />

                          {/* Expand indicator */}
                          {hasHiddenChildren && (
                            <text
                              textAnchor="middle"
                              dy="0.35em"
                              fontSize={12}
                              fontWeight="bold"
                              fill="white"
                            >
                              +
                            </text>
                          )}

                          {/* Node label */}
                          <text
                            x={isLeaf ? 15 : -15}
                            dy="-0.8em"
                            textAnchor={isLeaf ? 'start' : 'end'}
                            fontSize={11}
                            fontWeight={500}
                            fill={chartColors.text}
                          >
                            {node.data.name}
                          </text>

                          {/* Probability label */}
                          {node.data.probability !== undefined && (
                            <text
                              x={isLeaf ? 15 : -15}
                              dy="1.2em"
                              textAnchor={isLeaf ? 'start' : 'end'}
                              fontSize={10}
                              fill={chartColors.textMuted}
                            >
                              P = {formatPercent(node.data.probability)}
                            </text>
                          )}

                          {/* Cumulative probability */}
                          {showCumulativeProbability && node.depth > 0 && (
                            <text
                              x={isLeaf ? 15 : -15}
                              dy="2.4em"
                              textAnchor={isLeaf ? 'start' : 'end'}
                              fontSize={9}
                              fill={chartColors.muted}
                            >
                              Σ = {formatPercent(cumulativeProb)}
                            </text>
                          )}
                        </Group>
                      );
                    })}
                  </Group>
                )}
              </Tree>
            </svg>

            {/* Tooltip */}
            {tooltipData && (
              <TooltipWithBounds
                left={tooltipLeft}
                top={tooltipTop}
                style={tooltipStyles}
              >
                <div className="text-xs">
                  <div className="font-medium">{tooltipData.node.name}</div>
                  {tooltipData.node.probability !== undefined && (
                    <div className="mt-1">
                      Probability: <span className="font-medium">{formatPercent(tooltipData.node.probability)}</span>
                    </div>
                  )}
                  <div className="text-slate-500">
                    Cumulative: <span className="font-medium">{formatPercent(tooltipData.cumulativeProb)}</span>
                  </div>
                  {tooltipData.node.data && (
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      {Object.entries(tooltipData.node.data).map(([key, value]) => (
                        <div key={key} className="text-slate-500">
                          {key}: <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipWithBounds>
            )}

            {/* Legend */}
            <div className="px-4 pb-2 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primary }} />
                <span className="text-slate-500">Branch</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.success }} />
                <span className="text-slate-500">Outcome</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: chartColors.warning }}>+</div>
                <span className="text-slate-500">Click to expand</span>
              </div>
            </div>
          </div>
        );
      }}
    </ChartWrapper>
  );
}

/**
 * Get unique path for a node
 */
function getNodePath(node: HierarchyNode): string {
  const parts: string[] = [];
  let current: HierarchyNode | null = node;
  while (current) {
    parts.unshift(current.data.name);
    current = current.parent;
  }
  return parts.join('/');
}

export default ProbabilityTree;
