#!/usr/bin/env python3
"""
Generate Colab notebooks from lesson templates.

Usage:
    python scripts/generate-notebooks.py

This script reads templates from content/notebooks/ and generates
.ipynb files in the notebooks/ directory.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any

# Notebook format version
NBFORMAT_VERSION = 4
NBFORMAT_MINOR = 0

def create_markdown_cell(source: str) -> Dict[str, Any]:
    """Create a markdown cell."""
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": source.split('\n')
    }

def create_code_cell(source: str, hidden: bool = False) -> Dict[str, Any]:
    """Create a code cell."""
    cell = {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source.split('\n')
    }
    if hidden:
        cell["metadata"]["cellView"] = "form"
    return cell

def create_notebook(cells: List[Dict[str, Any]], title: str) -> Dict[str, Any]:
    """Create a complete notebook structure."""
    return {
        "nbformat": NBFORMAT_VERSION,
        "nbformat_minor": NBFORMAT_MINOR,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.10.0"
            },
            "colab": {
                "provenance": [],
                "toc_visible": True,
                "authorship_tag": "QuantLearn"
            }
        },
        "cells": cells
    }

# ============================================================================
# NOTEBOOK TEMPLATES BY MODULE
# ============================================================================

def create_basics_returns_notebook() -> Dict[str, Any]:
    """Basics Module: Introduction to Returns"""
    cells = [
        create_markdown_cell("""# Introduction to Returns

**QuantLearn Module**: Math Foundations
**Difficulty**: Beginner
**Time**: ~15-20 minutes

This notebook covers the fundamental calculations every quant needs: simple returns, log returns, and cumulative returns.

> **Run cells in order from top to bottom.** Each cell builds on the previous."""),

        create_code_cell("""#@title 📦 Setup (Run this first)
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Set random seed for reproducibility
np.random.seed(42)
plt.style.use('seaborn-v0_8-whitegrid')
print("✓ Setup complete!")""", hidden=True),

        create_markdown_cell("""## Simple Returns

The **simple return** (or arithmetic return) measures the percentage change in price:

$$R_t = \\frac{P_t - P_{t-1}}{P_{t-1}} = \\frac{P_t}{P_{t-1}} - 1$$

Where:
- $R_t$ = Return at time $t$
- $P_t$ = Price at time $t$
- $P_{t-1}$ = Price at time $t-1$"""),

        create_code_cell("""# Example: Calculate simple returns
prices = np.array([100, 102, 99, 105, 103])
dates = pd.date_range('2024-01-01', periods=5, freq='D')

# Calculate simple returns
simple_returns = np.diff(prices) / prices[:-1]

# Display
df = pd.DataFrame({
    'Date': dates,
    'Price': prices,
    'Return': [np.nan] + list(simple_returns)
})
print(df.to_string(index=False))
print(f"\\nMean daily return: {np.mean(simple_returns)*100:.2f}%")"""),

        create_markdown_cell("""## Log Returns

**Log returns** (or continuously compounded returns) have useful mathematical properties:

$$r_t = \\ln\\left(\\frac{P_t}{P_{t-1}}\\right) = \\ln(P_t) - \\ln(P_{t-1})$$

**Key advantage**: Log returns are additive over time!
$$r_{total} = r_1 + r_2 + ... + r_n$$"""),

        create_code_cell("""# Calculate log returns
log_returns = np.log(prices[1:] / prices[:-1])

# Compare simple vs log returns
comparison = pd.DataFrame({
    'Simple Return': simple_returns * 100,
    'Log Return': log_returns * 100
}, index=['Day 1→2', 'Day 2→3', 'Day 3→4', 'Day 4→5'])

print("Returns (in %):")
print(comparison.round(2))
print(f"\\nDifference is small for small returns, larger for big moves.")"""),

        create_markdown_cell("""## Exercise: Calculate Returns

**Task**: Given the following price series, calculate both simple and log returns.

```python
prices = [50, 52, 51, 55, 54, 58]
```

1. Calculate the simple return for each day
2. Calculate the log return for each day
3. Compute the total return from start to finish using both methods"""),

        create_code_cell("""# Exercise: Your code here
prices = np.array([50, 52, 51, 55, 54, 58])

# TODO: Calculate simple returns
simple_returns = None  # Your code

# TODO: Calculate log returns
log_returns = None  # Your code

# TODO: Calculate total return (start to finish)
total_simple = None  # Your code
total_log = None  # Your code

# Print results
print(f"Simple returns: {simple_returns}")
print(f"Log returns: {log_returns}")
print(f"Total simple return: {total_simple}")
print(f"Total log return: {total_log}")"""),

        create_code_cell("""#@title 💡 Solution (click to reveal)

prices = np.array([50, 52, 51, 55, 54, 58])

# Simple returns
simple_returns = np.diff(prices) / prices[:-1]
print(f"Simple returns: {np.round(simple_returns * 100, 2)}%")

# Log returns
log_returns = np.log(prices[1:] / prices[:-1])
print(f"Log returns: {np.round(log_returns * 100, 2)}%")

# Total return
total_simple = (prices[-1] - prices[0]) / prices[0]
total_log = np.log(prices[-1] / prices[0])

print(f"\\nTotal simple return: {total_simple*100:.2f}%")
print(f"Total log return: {total_log*100:.2f}%")
print(f"Sum of log returns: {np.sum(log_returns)*100:.2f}%")  # Should match!""", hidden=True),

        create_code_cell("""# Verification
print("Checking your solution...")

expected_simple_total = 0.16  # 16%
expected_log_total = np.log(58/50)

if simple_returns is not None and np.isclose((prices[-1]-prices[0])/prices[0], 0.16, atol=0.01):
    print("✓ Simple return calculation correct!")
else:
    print("✗ Check your simple return calculation")

if log_returns is not None and np.isclose(np.sum(log_returns), expected_log_total, atol=0.01):
    print("✓ Log return calculation correct!")
else:
    print("✗ Check your log return calculation")"""),

        create_markdown_cell("""## Summary

You've learned:
- **Simple returns**: $(P_t - P_{t-1}) / P_{t-1}$ - intuitive percentage change
- **Log returns**: $\\ln(P_t / P_{t-1})$ - additive over time
- For small returns, simple ≈ log returns
- For multi-period returns, log returns are easier to work with

**Next**: Descriptive Statistics - learn to summarize return distributions.""")
    ]
    return create_notebook(cells, "Introduction to Returns")


def create_basics_statistics_notebook() -> Dict[str, Any]:
    """Basics Module: Descriptive Statistics"""
    cells = [
        create_markdown_cell("""# Descriptive Statistics for Returns

**QuantLearn Module**: Math Foundations
**Difficulty**: Beginner
**Time**: ~20 minutes

Learn to calculate mean, volatility, skewness, and kurtosis - the essential statistics for understanding return distributions."""),

        create_code_cell("""#@title 📦 Setup
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

np.random.seed(42)
plt.style.use('seaborn-v0_8-whitegrid')
print("✓ Setup complete!")""", hidden=True),

        create_markdown_cell("""## Mean and Volatility

**Mean (Expected Return)**:
$$\\mu = \\frac{1}{n}\\sum_{i=1}^{n} r_i$$

**Volatility (Standard Deviation)**:
$$\\sigma = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n} (r_i - \\mu)^2}$$

These are the first two "moments" of a distribution."""),

        create_code_cell("""# Generate sample returns (simulating daily stock returns)
n_days = 252  # One trading year
daily_returns = np.random.normal(0.0005, 0.02, n_days)  # ~12.6% annual return, 32% vol

# Calculate statistics
mean_return = np.mean(daily_returns)
volatility = np.std(daily_returns, ddof=1)  # ddof=1 for sample std

# Annualize
annual_return = mean_return * 252
annual_vol = volatility * np.sqrt(252)

print(f"Daily mean return: {mean_return*100:.4f}%")
print(f"Daily volatility: {volatility*100:.2f}%")
print(f"\\nAnnualized return: {annual_return*100:.2f}%")
print(f"Annualized volatility: {annual_vol*100:.2f}%")"""),

        create_markdown_cell("""## Skewness and Kurtosis

**Skewness** measures asymmetry:
- Negative skew: Left tail is longer (more large losses)
- Positive skew: Right tail is longer (more large gains)
- Stock returns typically have negative skew

**Kurtosis** measures tail thickness:
- High kurtosis ("fat tails"): More extreme events than normal
- Normal distribution has kurtosis = 3
- Stock returns typically have high kurtosis"""),

        create_code_cell("""# Calculate higher moments
skewness = stats.skew(daily_returns)
kurtosis = stats.kurtosis(daily_returns)  # Excess kurtosis (normal = 0)

print(f"Skewness: {skewness:.3f}")
print(f"Excess Kurtosis: {kurtosis:.3f}")

# Visualize
fig, axes = plt.subplots(1, 2, figsize=(14, 4))

# Histogram
axes[0].hist(daily_returns, bins=50, density=True, alpha=0.7, color='steelblue')
axes[0].axvline(mean_return, color='red', linestyle='--', label=f'Mean: {mean_return*100:.3f}%')
axes[0].set_xlabel('Daily Return')
axes[0].set_ylabel('Density')
axes[0].set_title('Return Distribution')
axes[0].legend()

# Normal Q-Q plot
stats.probplot(daily_returns, dist="norm", plot=axes[1])
axes[1].set_title('Q-Q Plot (vs Normal)')

plt.tight_layout()
plt.show()"""),

        create_markdown_cell("""## Exercise: Analyze Real-ish Returns

Calculate the four moments for this return series and interpret the results."""),

        create_code_cell("""# Sample data: Returns with fat tails
returns = np.array([
    0.01, -0.02, 0.015, -0.01, 0.005, -0.08,  # Note the -8% crash
    0.02, 0.01, -0.015, 0.03, -0.01, 0.01,
    0.005, -0.005, 0.02, -0.02, 0.015, -0.01,
    0.01, -0.01, 0.025, -0.015, 0.01, -0.05   # Note the -5% drop
])

# TODO: Calculate the four moments
mean = None      # Your code
vol = None       # Your code
skew = None      # Your code
kurt = None      # Your code

print(f"Mean: {mean}")
print(f"Volatility: {vol}")
print(f"Skewness: {skew}")
print(f"Kurtosis: {kurt}")"""),

        create_code_cell("""#@title 💡 Solution
returns = np.array([
    0.01, -0.02, 0.015, -0.01, 0.005, -0.08,
    0.02, 0.01, -0.015, 0.03, -0.01, 0.01,
    0.005, -0.005, 0.02, -0.02, 0.015, -0.01,
    0.01, -0.01, 0.025, -0.015, 0.01, -0.05
])

mean = np.mean(returns)
vol = np.std(returns, ddof=1)
skew = stats.skew(returns)
kurt = stats.kurtosis(returns)

print(f"Mean: {mean*100:.3f}%")
print(f"Volatility: {vol*100:.2f}%")
print(f"Skewness: {skew:.3f} (negative = left tail)")
print(f"Excess Kurtosis: {kurt:.3f} (>0 = fat tails)")

print("\\n📊 Interpretation:")
print("- Negative skew: This series has larger downside moves")
print("- Positive kurtosis: More extreme events than a normal distribution")
print("- This is typical of real stock returns!")""", hidden=True),

        create_markdown_cell("""## Summary

| Statistic | Formula | What It Measures |
|-----------|---------|------------------|
| Mean (μ) | Average of returns | Expected return |
| Volatility (σ) | Std deviation | Risk/uncertainty |
| Skewness | 3rd moment | Asymmetry (tail direction) |
| Kurtosis | 4th moment | Tail thickness |

**Key insight**: Real returns are NOT normally distributed - they have negative skew and fat tails. This is why risk management matters!

**Next**: Correlation Analysis""")
    ]
    return create_notebook(cells, "Descriptive Statistics")


def create_backtesting_fundamentals_notebook() -> Dict[str, Any]:
    """Backtesting Module: Fundamentals"""
    cells = [
        create_markdown_cell("""# Backtesting Fundamentals

**QuantLearn Module**: Backtesting & Scientific Method
**Difficulty**: Intermediate
**Time**: ~30 minutes

Build your first backtest from scratch. Learn the core components: signals, positions, and performance measurement."""),

        create_code_cell("""#@title 📦 Setup
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

np.random.seed(42)
plt.style.use('seaborn-v0_8-whitegrid')
print("✓ Setup complete!")""", hidden=True),

        create_markdown_cell("""## The Backtesting Framework

Every backtest has these components:

1. **Data**: Historical prices/returns
2. **Signal**: Trading logic (when to buy/sell)
3. **Position**: Current holdings based on signals
4. **Returns**: Strategy returns = position × market returns
5. **Metrics**: Evaluate performance (Sharpe, drawdown, etc.)

Let's build each piece."""),

        create_code_cell("""# 1. Generate sample price data
n_days = 500
dates = pd.date_range('2022-01-01', periods=n_days, freq='B')
returns = np.random.normal(0.0003, 0.015, n_days)
prices = 100 * np.cumprod(1 + returns)

df = pd.DataFrame({
    'Date': dates,
    'Price': prices,
    'Return': returns
}).set_index('Date')

print("Sample data:")
print(df.head(10))

plt.figure(figsize=(12, 4))
plt.plot(df['Price'])
plt.title('Simulated Stock Price')
plt.ylabel('Price')
plt.show()"""),

        create_markdown_cell("""## 2. Create a Signal

Let's implement a simple **moving average crossover** strategy:
- Buy (signal = 1) when fast MA > slow MA
- Sell (signal = -1) when fast MA < slow MA"""),

        create_code_cell("""# Calculate moving averages
fast_period = 20
slow_period = 50

df['MA_Fast'] = df['Price'].rolling(fast_period).mean()
df['MA_Slow'] = df['Price'].rolling(slow_period).mean()

# Generate signal: 1 = long, -1 = short, 0 = no position
df['Signal'] = 0
df.loc[df['MA_Fast'] > df['MA_Slow'], 'Signal'] = 1
df.loc[df['MA_Fast'] < df['MA_Slow'], 'Signal'] = -1

# Visualize
fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

# Price with MAs
axes[0].plot(df['Price'], label='Price', alpha=0.7)
axes[0].plot(df['MA_Fast'], label=f'{fast_period}-day MA', linewidth=2)
axes[0].plot(df['MA_Slow'], label=f'{slow_period}-day MA', linewidth=2)
axes[0].set_ylabel('Price')
axes[0].legend()
axes[0].set_title('Price with Moving Averages')

# Signal
axes[1].plot(df['Signal'], drawstyle='steps-post')
axes[1].set_ylabel('Signal')
axes[1].set_ylim(-1.5, 1.5)
axes[1].set_title('Trading Signal (1=Long, -1=Short)')

plt.tight_layout()
plt.show()"""),

        create_markdown_cell("""## 3. Calculate Strategy Returns

**Key formula**:
$$r_{strategy,t} = position_{t-1} \\times r_{market,t}$$

We use yesterday's position because we can't see today's return before trading."""),

        create_code_cell("""# Position = previous day's signal (avoid look-ahead bias!)
df['Position'] = df['Signal'].shift(1)

# Strategy returns
df['Strategy_Return'] = df['Position'] * df['Return']

# Drop NaN rows (warmup period)
df_clean = df.dropna()

# Cumulative returns
df_clean['Cumulative_Market'] = (1 + df_clean['Return']).cumprod()
df_clean['Cumulative_Strategy'] = (1 + df_clean['Strategy_Return']).cumprod()

# Plot
plt.figure(figsize=(12, 5))
plt.plot(df_clean['Cumulative_Market'], label='Buy & Hold', alpha=0.7)
plt.plot(df_clean['Cumulative_Strategy'], label='MA Crossover Strategy', linewidth=2)
plt.ylabel('Cumulative Return')
plt.title('Strategy vs Buy & Hold')
plt.legend()
plt.show()"""),

        create_markdown_cell("""## 4. Performance Metrics"""),

        create_code_cell("""def calculate_metrics(returns, periods_per_year=252):
    \"\"\"Calculate key performance metrics.\"\"\"
    # Remove NaN
    returns = returns.dropna()

    # Annualized return
    total_return = (1 + returns).prod() - 1
    n_years = len(returns) / periods_per_year
    annual_return = (1 + total_return) ** (1/n_years) - 1

    # Annualized volatility
    annual_vol = returns.std() * np.sqrt(periods_per_year)

    # Sharpe ratio (assuming 0% risk-free rate)
    sharpe = annual_return / annual_vol if annual_vol > 0 else 0

    # Maximum drawdown
    cumulative = (1 + returns).cumprod()
    running_max = cumulative.cummax()
    drawdown = (cumulative - running_max) / running_max
    max_drawdown = drawdown.min()

    return {
        'Annual Return': f"{annual_return*100:.2f}%",
        'Annual Volatility': f"{annual_vol*100:.2f}%",
        'Sharpe Ratio': f"{sharpe:.2f}",
        'Max Drawdown': f"{max_drawdown*100:.2f}%",
        'Total Return': f"{total_return*100:.2f}%"
    }

# Compare strategy vs market
print("=== Strategy Performance ===")
for k, v in calculate_metrics(df_clean['Strategy_Return']).items():
    print(f"{k}: {v}")

print("\\n=== Buy & Hold Performance ===")
for k, v in calculate_metrics(df_clean['Return']).items():
    print(f"{k}: {v}")"""),

        create_markdown_cell("""## Exercise: Build Your Own Backtest

Implement a **momentum strategy**:
- If the 10-day return is positive, go long
- If the 10-day return is negative, go short"""),

        create_code_cell("""# Exercise: Implement momentum strategy
# Use the same df DataFrame

# TODO: Calculate 10-day momentum (sum of last 10 returns, or just 10-day return)
lookback = 10
df['Momentum'] = None  # Your code here

# TODO: Generate signal based on momentum
df['Mom_Signal'] = None  # Your code here

# TODO: Calculate strategy returns
df['Mom_Position'] = None  # Your code here
df['Mom_Return'] = None  # Your code here

# Print metrics
# calculate_metrics(df['Mom_Return'].dropna())"""),

        create_code_cell("""#@title 💡 Solution

# Calculate 10-day momentum
lookback = 10
df['Momentum'] = df['Return'].rolling(lookback).sum()

# Generate signal
df['Mom_Signal'] = np.where(df['Momentum'] > 0, 1, -1)

# Position and returns
df['Mom_Position'] = df['Mom_Signal'].shift(1)
df['Mom_Return'] = df['Mom_Position'] * df['Return']

# Results
print("=== Momentum Strategy ===")
for k, v in calculate_metrics(df['Mom_Return'].dropna()).items():
    print(f"{k}: {v}")

# Plot
df_mom = df.dropna()
df_mom['Cumulative_Momentum'] = (1 + df_mom['Mom_Return']).cumprod()

plt.figure(figsize=(12, 5))
plt.plot(df_mom['Cumulative_Market'], label='Buy & Hold', alpha=0.7)
plt.plot(df_mom['Cumulative_Strategy'], label='MA Crossover', alpha=0.7)
plt.plot(df_mom['Cumulative_Momentum'], label='Momentum', linewidth=2)
plt.legend()
plt.title('Strategy Comparison')
plt.show()""", hidden=True),

        create_markdown_cell("""## Summary

You've built a complete backtest with:
1. **Data preparation**: Prices → Returns
2. **Signal generation**: MA crossover logic
3. **Position management**: Shift signals to avoid look-ahead
4. **Performance measurement**: Sharpe, drawdown, returns

**Key pitfall avoided**: We used `shift(1)` to prevent look-ahead bias!

**Next**: Common Pitfalls - learn about all the ways backtests can go wrong.""")
    ]
    return create_notebook(cells, "Backtesting Fundamentals")


def create_strategies_trend_following_notebook() -> Dict[str, Any]:
    """Strategies Module: Trend Following"""
    cells = [
        create_markdown_cell("""# Trend Following Strategies

**QuantLearn Module**: Strategy Types
**Difficulty**: Intermediate
**Time**: ~25 minutes

Learn to build and backtest trend-following strategies using moving averages, breakouts, and momentum signals."""),

        create_code_cell("""#@title 📦 Setup
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

np.random.seed(42)
plt.style.use('seaborn-v0_8-whitegrid')

# Generate trending price data with regimes
def generate_trending_data(n_days=500):
    dates = pd.date_range('2022-01-01', periods=n_days, freq='B')

    # Create regime-switching returns
    returns = []
    regime = 1  # Start bullish
    for i in range(n_days):
        if np.random.random() < 0.02:  # 2% chance of regime switch
            regime *= -1
        drift = 0.001 * regime  # Positive or negative drift
        ret = np.random.normal(drift, 0.015)
        returns.append(ret)

    prices = 100 * np.cumprod(1 + np.array(returns))
    return pd.DataFrame({'Date': dates, 'Price': prices, 'Return': returns}).set_index('Date')

df = generate_trending_data()
print("✓ Setup complete!")
print(f"Generated {len(df)} days of price data")""", hidden=True),

        create_markdown_cell("""## 1. Moving Average Crossover

The classic trend-following approach:
- **Fast MA** (e.g., 20-day) reacts quickly to price changes
- **Slow MA** (e.g., 50-day) represents the longer-term trend
- **Signal**: Go long when fast > slow, short when fast < slow"""),

        create_code_cell("""# MA Crossover Strategy
fast_period = 20
slow_period = 50

df['MA_Fast'] = df['Price'].rolling(fast_period).mean()
df['MA_Slow'] = df['Price'].rolling(slow_period).mean()

# Signal: 1 = long, -1 = short
df['MA_Signal'] = np.where(df['MA_Fast'] > df['MA_Slow'], 1, -1)
df['MA_Position'] = df['MA_Signal'].shift(1)
df['MA_Return'] = df['MA_Position'] * df['Return']

# Visualize
fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

axes[0].plot(df['Price'], alpha=0.7, label='Price')
axes[0].plot(df['MA_Fast'], label=f'{fast_period}-day MA')
axes[0].plot(df['MA_Slow'], label=f'{slow_period}-day MA')
axes[0].set_ylabel('Price')
axes[0].legend()
axes[0].set_title('Moving Average Crossover Strategy')

# Cumulative returns
df_clean = df.dropna()
cum_market = (1 + df_clean['Return']).cumprod()
cum_strategy = (1 + df_clean['MA_Return']).cumprod()

axes[1].plot(cum_market, label='Buy & Hold', alpha=0.7)
axes[1].plot(cum_strategy, label='MA Crossover', linewidth=2)
axes[1].set_ylabel('Cumulative Return')
axes[1].legend()

plt.tight_layout()
plt.show()"""),

        create_markdown_cell("""## 2. Breakout Strategy

Trade when price breaks above/below recent high/low:
- **Donchian Channel**: N-day high and low
- **Breakout signal**: Long on new high, short on new low"""),

        create_code_cell("""# Breakout Strategy (Donchian Channel)
lookback = 20

df['High_N'] = df['Price'].rolling(lookback).max()
df['Low_N'] = df['Price'].rolling(lookback).min()

# Signal: breakout above high = long, below low = short
df['Breakout_Signal'] = 0
df.loc[df['Price'] >= df['High_N'].shift(1), 'Breakout_Signal'] = 1
df.loc[df['Price'] <= df['Low_N'].shift(1), 'Breakout_Signal'] = -1

# Forward fill signal (hold position)
df['Breakout_Signal'] = df['Breakout_Signal'].replace(0, np.nan).ffill().fillna(0)
df['Breakout_Position'] = df['Breakout_Signal'].shift(1)
df['Breakout_Return'] = df['Breakout_Position'] * df['Return']

# Plot
fig, ax = plt.subplots(figsize=(14, 5))
ax.plot(df['Price'], label='Price', alpha=0.7)
ax.plot(df['High_N'], '--', color='green', alpha=0.5, label=f'{lookback}-day High')
ax.plot(df['Low_N'], '--', color='red', alpha=0.5, label=f'{lookback}-day Low')
ax.legend()
ax.set_title('Donchian Channel Breakout')
plt.show()"""),

        create_markdown_cell("""## 3. Momentum Strategy

Trade based on recent performance:
- Calculate N-day momentum (cumulative return)
- Long if momentum > 0, short if < 0"""),

        create_code_cell("""# Momentum Strategy
momentum_period = 20

df['Momentum'] = df['Price'].pct_change(momentum_period)
df['Mom_Signal'] = np.where(df['Momentum'] > 0, 1, -1)
df['Mom_Position'] = df['Mom_Signal'].shift(1)
df['Mom_Return'] = df['Mom_Position'] * df['Return']

# Compare all strategies
df_compare = df.dropna()

strategies = {
    'Buy & Hold': (1 + df_compare['Return']).cumprod(),
    'MA Crossover': (1 + df_compare['MA_Return']).cumprod(),
    'Breakout': (1 + df_compare['Breakout_Return']).cumprod(),
    'Momentum': (1 + df_compare['Mom_Return']).cumprod()
}

plt.figure(figsize=(14, 6))
for name, cum_ret in strategies.items():
    plt.plot(cum_ret, label=name, linewidth=2 if name != 'Buy & Hold' else 1)
plt.ylabel('Cumulative Return')
plt.title('Trend Following Strategy Comparison')
plt.legend()
plt.show()"""),

        create_markdown_cell("""## Exercise: Build a Combined Trend Signal

Create a strategy that combines multiple trend signals:
1. Go long only when ALL signals agree (MA, Breakout, Momentum all positive)
2. Go short only when ALL signals agree (all negative)
3. Stay flat when signals disagree"""),

        create_code_cell("""# Exercise: Combined trend signal

# TODO: Create combined signal
# Hint: Sum the three signals, only trade when |sum| == 3
df['Combined_Signal'] = None  # Your code here

# TODO: Calculate strategy returns
df['Combined_Position'] = None
df['Combined_Return'] = None

# Compare to individual strategies
# ..."""),

        create_code_cell("""#@title 💡 Solution

# Sum signals: only trade when all 3 agree
signal_sum = df['MA_Signal'] + df['Breakout_Signal'].fillna(0) + df['Mom_Signal']

df['Combined_Signal'] = 0
df.loc[signal_sum == 3, 'Combined_Signal'] = 1   # All bullish
df.loc[signal_sum == -3, 'Combined_Signal'] = -1  # All bearish
# Otherwise stay flat (0)

df['Combined_Position'] = df['Combined_Signal'].shift(1)
df['Combined_Return'] = df['Combined_Position'] * df['Return']

# Plot
df_final = df.dropna()
plt.figure(figsize=(14, 6))
plt.plot((1 + df_final['Return']).cumprod(), label='Buy & Hold', alpha=0.7)
plt.plot((1 + df_final['MA_Return']).cumprod(), label='MA Crossover', alpha=0.7)
plt.plot((1 + df_final['Combined_Return']).cumprod(), label='Combined Signal', linewidth=2)
plt.ylabel('Cumulative Return')
plt.title('Combined Trend Signal Performance')
plt.legend()
plt.show()

# Stats
print("Combined Strategy Stats:")
combined_rets = df_final['Combined_Return']
print(f"Annual Return: {combined_rets.mean() * 252 * 100:.1f}%")
print(f"Annual Vol: {combined_rets.std() * np.sqrt(252) * 100:.1f}%")
print(f"Sharpe: {combined_rets.mean() / combined_rets.std() * np.sqrt(252):.2f}")
print(f"Time in Market: {(df_final['Combined_Signal'] != 0).mean() * 100:.0f}%")""", hidden=True),

        create_markdown_cell("""## Summary

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| MA Crossover | Fast MA vs Slow MA | Simple, always in market | Whipsaws in sideways markets |
| Breakout | Trade new highs/lows | Catches big moves | Many false breakouts |
| Momentum | Recent return direction | Captures trends | Vulnerable to reversals |
| Combined | Require agreement | Fewer trades, higher conviction | May miss opportunities |

**Key insight**: Trend following works in trending markets but suffers during range-bound periods. Consider regime filtering!

**Next**: Mean Reversion strategies.""")
    ]
    return create_notebook(cells, "Trend Following Strategies")


def create_strategies_mean_reversion_notebook() -> Dict[str, Any]:
    """Strategies Module: Mean Reversion"""
    cells = [
        create_markdown_cell("""# Mean Reversion Strategies

**QuantLearn Module**: Strategy Types
**Difficulty**: Intermediate
**Time**: ~25 minutes

Learn to build strategies that profit when prices return to their mean - the opposite of trend following."""),

        create_code_cell("""#@title 📦 Setup
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

np.random.seed(42)
plt.style.use('seaborn-v0_8-whitegrid')

# Generate mean-reverting price data (Ornstein-Uhlenbeck process)
def generate_mean_reverting_data(n_days=500, mean=100, theta=0.1, sigma=2):
    prices = [mean]
    for _ in range(n_days - 1):
        dp = theta * (mean - prices[-1]) + sigma * np.random.randn()
        prices.append(prices[-1] + dp)

    dates = pd.date_range('2022-01-01', periods=n_days, freq='B')
    prices = np.array(prices)
    returns = np.diff(prices) / prices[:-1]

    return pd.DataFrame({
        'Price': prices,
        'Return': [np.nan] + list(returns)
    }, index=dates)

df = generate_mean_reverting_data()
print("✓ Setup complete!")""", hidden=True),

        create_markdown_cell("""## 1. Bollinger Bands

Trade when price deviates significantly from its moving average:
- **Upper Band** = MA + 2σ
- **Lower Band** = MA - 2σ
- **Signal**: Buy at lower band, sell at upper band"""),

        create_code_cell("""# Bollinger Bands Strategy
window = 20
num_std = 2

df['MA'] = df['Price'].rolling(window).mean()
df['Std'] = df['Price'].rolling(window).std()
df['Upper'] = df['MA'] + num_std * df['Std']
df['Lower'] = df['MA'] - num_std * df['Std']

# Z-score: how many std devs from mean
df['Z_Score'] = (df['Price'] - df['MA']) / df['Std']

# Signal: buy when below -2, sell when above +2
df['BB_Signal'] = 0
df.loc[df['Z_Score'] < -num_std, 'BB_Signal'] = 1   # Oversold -> buy
df.loc[df['Z_Score'] > num_std, 'BB_Signal'] = -1   # Overbought -> sell

# Hold position until opposite signal
df['BB_Signal'] = df['BB_Signal'].replace(0, np.nan).ffill().fillna(0)

# Calculate returns
df['BB_Position'] = df['BB_Signal'].shift(1)
df['BB_Return'] = df['BB_Position'] * df['Return']

# Visualize
fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

axes[0].plot(df['Price'], label='Price', alpha=0.8)
axes[0].plot(df['MA'], label='20-day MA', linewidth=2)
axes[0].fill_between(df.index, df['Lower'], df['Upper'], alpha=0.2, label='Bollinger Bands')
axes[0].legend()
axes[0].set_title('Bollinger Bands Mean Reversion')

axes[1].plot(df['Z_Score'], label='Z-Score')
axes[1].axhline(2, color='red', linestyle='--', alpha=0.5)
axes[1].axhline(-2, color='green', linestyle='--', alpha=0.5)
axes[1].axhline(0, color='gray', linestyle='-', alpha=0.3)
axes[1].set_ylabel('Z-Score')
axes[1].legend()

plt.tight_layout()
plt.show()"""),

        create_markdown_cell("""## 2. RSI (Relative Strength Index)

Momentum oscillator that measures overbought/oversold conditions:

$$RSI = 100 - \\frac{100}{1 + RS}$$

Where RS = Average Gain / Average Loss over N periods

- **RSI > 70**: Overbought → Sell signal
- **RSI < 30**: Oversold → Buy signal"""),

        create_code_cell("""# RSI Strategy
def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = delta.where(delta > 0, 0)
    loss = (-delta).where(delta < 0, 0)

    avg_gain = gain.rolling(period).mean()
    avg_loss = loss.rolling(period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

df['RSI'] = calculate_rsi(df['Price'], period=14)

# Signal: buy when oversold, sell when overbought
df['RSI_Signal'] = 0
df.loc[df['RSI'] < 30, 'RSI_Signal'] = 1   # Oversold -> buy
df.loc[df['RSI'] > 70, 'RSI_Signal'] = -1  # Overbought -> sell
df['RSI_Signal'] = df['RSI_Signal'].replace(0, np.nan).ffill().fillna(0)

df['RSI_Position'] = df['RSI_Signal'].shift(1)
df['RSI_Return'] = df['RSI_Position'] * df['Return']

# Plot RSI
fig, axes = plt.subplots(2, 1, figsize=(14, 6), sharex=True)

axes[0].plot(df['Price'])
axes[0].set_ylabel('Price')
axes[0].set_title('Price with RSI Signals')

axes[1].plot(df['RSI'], label='RSI')
axes[1].axhline(70, color='red', linestyle='--', label='Overbought (70)')
axes[1].axhline(30, color='green', linestyle='--', label='Oversold (30)')
axes[1].fill_between(df.index, 30, 70, alpha=0.1)
axes[1].set_ylabel('RSI')
axes[1].set_ylim(0, 100)
axes[1].legend()

plt.tight_layout()
plt.show()"""),

        create_markdown_cell("""## Strategy Comparison"""),

        create_code_cell("""# Compare strategies
df_clean = df.dropna()

fig, ax = plt.subplots(figsize=(14, 6))

strategies = {
    'Buy & Hold': (1 + df_clean['Return']).cumprod(),
    'Bollinger Bands': (1 + df_clean['BB_Return']).cumprod(),
    'RSI': (1 + df_clean['RSI_Return']).cumprod()
}

for name, cum_ret in strategies.items():
    ax.plot(cum_ret, label=name, linewidth=2 if name != 'Buy & Hold' else 1)

ax.set_ylabel('Cumulative Return')
ax.set_title('Mean Reversion Strategy Comparison')
ax.legend()
plt.show()

# Print stats
print("\\nPerformance Metrics:")
print("-" * 50)
for name, strategy in [('Bollinger', 'BB_Return'), ('RSI', 'RSI_Return')]:
    rets = df_clean[strategy]
    print(f"\\n{name}:")
    print(f"  Annual Return: {rets.mean() * 252 * 100:.1f}%")
    print(f"  Annual Vol: {rets.std() * np.sqrt(252) * 100:.1f}%")
    print(f"  Sharpe: {rets.mean() / rets.std() * np.sqrt(252):.2f}")"""),

        create_markdown_cell("""## Exercise: Z-Score Mean Reversion

Build a simple z-score mean reversion strategy:
1. Calculate the z-score of price vs 20-day MA
2. Enter long when z < -1.5, exit when z > 0
3. Enter short when z > 1.5, exit when z < 0"""),

        create_code_cell("""# Exercise: Z-Score strategy with exit rules

# TODO: Calculate z-score
z_score = None  # Your code

# TODO: Create signals with entry/exit logic
# This is trickier - you need to track the current position
df['ZS_Signal'] = 0  # Your code

# TODO: Calculate returns
df['ZS_Position'] = None
df['ZS_Return'] = None"""),

        create_code_cell("""#@title 💡 Solution

# Calculate z-score
z_score = (df['Price'] - df['Price'].rolling(20).mean()) / df['Price'].rolling(20).std()

# Entry and exit logic
position = 0
positions = []

for z in z_score:
    if np.isnan(z):
        positions.append(0)
        continue

    # Entry signals
    if z < -1.5 and position == 0:
        position = 1  # Enter long
    elif z > 1.5 and position == 0:
        position = -1  # Enter short

    # Exit signals
    elif position == 1 and z > 0:
        position = 0  # Exit long
    elif position == -1 and z < 0:
        position = 0  # Exit short

    positions.append(position)

df['ZS_Signal'] = positions
df['ZS_Position'] = df['ZS_Signal'].shift(1)
df['ZS_Return'] = df['ZS_Position'] * df['Return']

# Plot
df_zs = df.dropna()
plt.figure(figsize=(14, 5))
plt.plot((1 + df_zs['Return']).cumprod(), label='Buy & Hold', alpha=0.7)
plt.plot((1 + df_zs['BB_Return']).cumprod(), label='Bollinger', alpha=0.7)
plt.plot((1 + df_zs['ZS_Return']).cumprod(), label='Z-Score (with exits)', linewidth=2)
plt.legend()
plt.title('Z-Score Strategy with Entry/Exit Rules')
plt.show()

print("Z-Score Strategy Stats:")
rets = df_zs['ZS_Return']
print(f"Annual Return: {rets.mean() * 252 * 100:.1f}%")
print(f"Sharpe: {rets.mean() / rets.std() * np.sqrt(252):.2f}")
print(f"Time in Market: {(df_zs['ZS_Signal'] != 0).mean() * 100:.0f}%")""", hidden=True),

        create_markdown_cell("""## Summary

| Strategy | Entry Signal | Exit Signal | Best For |
|----------|--------------|-------------|----------|
| Bollinger Bands | Price hits band | Opposite band | Range-bound markets |
| RSI | RSI < 30 or > 70 | RSI crosses 50 | Identifying extremes |
| Z-Score | |z| > threshold | z crosses zero | Statistical approach |

**Key insight**: Mean reversion works when prices oscillate around a mean, but fails spectacularly in trending markets. Always know your market regime!

**Next**: Advanced Quant Techniques""")
    ]
    return create_notebook(cells, "Mean Reversion Strategies")


# ============================================================================
# NOTEBOOK REGISTRY
# ============================================================================

NOTEBOOKS = {
    'basics': {
        '01-introduction-to-returns': create_basics_returns_notebook,
        '02-descriptive-statistics': create_basics_statistics_notebook,
    },
    'backtesting': {
        '02-backtesting-fundamentals': create_backtesting_fundamentals_notebook,
    },
    'strategies': {
        '01-trend-following': create_strategies_trend_following_notebook,
        '02-mean-reversion': create_strategies_mean_reversion_notebook,
    }
}


def main():
    """Generate all notebooks."""
    project_root = Path(__file__).parent.parent
    notebooks_dir = project_root / 'notebooks'

    # Create output directories
    for module in NOTEBOOKS.keys():
        module_dir = notebooks_dir / module
        module_dir.mkdir(parents=True, exist_ok=True)

    # Generate notebooks
    generated = []
    for module, lessons in NOTEBOOKS.items():
        for lesson_slug, generator_func in lessons.items():
            notebook = generator_func()
            output_path = notebooks_dir / module / f"{lesson_slug}.ipynb"

            with open(output_path, 'w') as f:
                json.dump(notebook, f, indent=2)

            generated.append(f"{module}/{lesson_slug}")
            print(f"✓ Generated: {output_path}")

    print(f"\n🎉 Generated {len(generated)} notebooks!")
    print("\nTo use in QuantLearn:")
    print("1. Push notebooks to GitHub")
    print("2. Update lesson frontmatter with colabUrl:")
    print("   https://colab.research.google.com/github/OWNER/quantlearn/blob/main/notebooks/MODULE/LESSON.ipynb")


if __name__ == '__main__':
    main()
