/**
 * QuantLearn Visualization Components
 *
 * A comprehensive library of interactive charts for quantitative trading education.
 * All components use visx for SVG rendering and include performance guards
 * that cap data points at 1000 to prevent browser performance issues.
 */

// Base wrapper and utilities
export {
  ChartWrapper,
  MAX_DATA_POINTS,
  applyPerformanceGuard,
  defaultMargin,
  chartColors,
  seriesColors,
  tooltipStyles,
  formatNumber,
  formatPercent,
  formatDate,
} from './ChartWrapper';
export type { ChartWrapperProps } from './ChartWrapper';

// Line Chart - Time series, equity curves, moving averages
export { LineChart } from './LineChart';
export type { LineChartProps, DataPoint, Series } from './LineChart';

// Histogram - Normal, log-normal, returns distributions
export { Histogram } from './Histogram';
export type { HistogramProps, HistogramBin } from './Histogram';

// Scatter Plot - Correlation, regression, pairs analysis
export { ScatterPlot } from './ScatterPlot';
export type { ScatterPlotProps, ScatterPoint, ScatterSeries, AnnotationConfig } from './ScatterPlot';

// Probability Tree - Bayesian probability visualization
export { ProbabilityTree } from './ProbabilityTree';
export type { ProbabilityTreeProps, TreeNode } from './ProbabilityTree';

// Heatmap - Correlation matrices, covariance
export { Heatmap } from './Heatmap';
export type { HeatmapProps, HeatmapData } from './Heatmap';

// Candlestick Chart - OHLC with signal overlays
export { CandlestickChart } from './CandlestickChart';
export type { CandlestickChartProps, Candle, Signal } from './CandlestickChart';

// Order Book - Market microstructure depth chart
export { OrderBook } from './OrderBook';
export type { OrderBookProps, OrderLevel, OrderBookData } from './OrderBook';

// Equity Curve - Backtesting results with drawdown
export { EquityCurve } from './EquityCurve';
export type { EquityCurveProps, EquityPoint } from './EquityCurve';

// Sensitivity Heatmap - Parameter optimization, overfitting
export { SensitivityHeatmap } from './SensitivityHeatmap';
export type { SensitivityHeatmapProps, SensitivityData } from './SensitivityHeatmap';

// Regime Chart - HMM states on price data
export { RegimeChart } from './RegimeChart';
export type { RegimeChartProps, RegimeDataPoint, RegimeConfig } from './RegimeChart';

// Efficient Frontier - Portfolio optimization
export { EfficientFrontier } from './EfficientFrontier';
export type { EfficientFrontierProps, PortfolioPoint, AssetPoint } from './EfficientFrontier';
