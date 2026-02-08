# Development Log: Financial Charting Dashboard

This document tracks the features and implementation details of the Lino Financial Charting Dashboard.

## Overview
A high-performance, real-time cryptocurrency charting application built with React, Vite, and Lightweight Charts. It features live Binance data, technical indicators (EMA, RSI), and currency conversion.

## Features Implemented

### 1. Real-time Charting
-   **Engine**: Powered by `lightweight-charts` for smooth, high-performance rendering.
-   **Data Source**: Historical data via Binance REST API; real-time updates via Binance WebSocket (`wss://stream.binance.com`).
-   **Candlestick Chart**: displays Open, High, Low, Close (OHLC) data.

### 2. Technical Indicators
-   **EMA (Exponential Moving Average)**: 50-period EMA overlay on the main chart.
-   **RSI (Relative Strength Index)**: 14-period RSI displayed in a separate pane below the main chart.
-   **Signals**: Visual markers indicating Buy/Sell signals based on RSI thresholds (Buy < 30, Sell > 70).

### 3. Currency Conversion (USDT <-> INR)
-   **Dynamic Toggling**: Users can switch between UDP (USDT) and INR views instantly.
-   **Real-time Rates**: Fetches live USDT/INR exchange rates from CoinGecko API every 60 seconds.
-   **Fallback**: Uses a safe default rate (87.50) if the API is unreachable.
-   **Visuals**: Updates all price scales, tooltips, and indicators to the selected currency symbol (`$` or `₹`).

### 4. Time Frame Selection
-   **Intervals**: Support for `1m`, `3m`, `5m`, `15m`, `1h`, `4h`, `1d`, `1w`.
-   **Live Switching**: Changing the interval reloads historical data and reconnects the WebSocket stream to the correct channel automatically.

## Directory Structure

```
src/
├── components/
│   ├── TradingChart.tsx   # Main chart component (Lightweight Charts)
│   └── ControlPanel.tsx   # Config panel for strategy settings
├── services/
│   ├── binance.ts         # REST API for historical data
│   └── websocket.ts       # WebSocket service for live updates
├── utils/
│   ├── indicators.ts      # EMA, RSI, and Signal calculation logic
│   └── currency.ts        # CoinGecko API for INR rates
└── App.tsx                # Main application logic and state management
```

## Development Phases

### Phase 1: Setup & Fixes
-   Resolved TypeScript errors in chart integration.
-   Fixed `ResizeObserver` loop limits and import issues.

### Phase 2: Real-time Data
-   Implemented `BinanceWebSocketService` for robust streaming.
-   Added logic to update the *latest* candle in real-time vs appending new candles.

### Phase 3: Technical Indicators
-   Integrated `technicalindicators` library.
-   Added synchronized crosshair movement between Price and RSI charts.

### Phase 4 & 5: Currency Logic
-   Added global currency state.
-   Implemented custom hook-like logic for fetching CoinGecko rates.
-   Applied conversion math to all chart data points before rendering.

### Phase 6: Time Frames
-   Added interval state `1h`, `15m`, etc.
-   Refactored data fetching to depend on the selected interval.
-   Updated UI header with selector buttons.
