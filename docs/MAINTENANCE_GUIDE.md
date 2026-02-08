# Maintenance & Customization Guide

This guide explains how each feature is implemented and which files you need to edit to customize the application.

## 1. Time Frame Selection
**Feature**: Allows switching between 1m, 15m, 1h, etc.
**How it works**:
-   `App.tsx` holds the `interval` state (default '1h').
-   Changing it triggers a re-fetch of historical data and reconnects the WebSocket.

**How to Edit**:
-   **To add/remove intervals**:
    -   Open `src/App.tsx`.
    -   Locate the `INTERVALS` array (around line 30).
    -   Add string values like `'2h'` or remove existing ones. The app handles the rest automatically.

## 2. Currency Conversion (USDT/INR)
**Feature**: Toggles chart prices between USDT and INR.
**How it works**:
-   `utils/currency.ts` fetches the rate from CoinGecko.
-   `App.tsx` holds `currency` and `inrRate` state.
-   `TradingChart.tsx` applies multiplication before rendering.

**How to Edit**:
-   **To change the API provider**:
    -   Open `src/utils/currency.ts`.
    -   Modify `fetchUSDTToINR` to call a different API or return a fixed value.
-   **To add a new currency (e.g. EUR)**:
    1.  Open `src/App.tsx`.
    2.  Update the state: `useState<'USDT' | 'INR' | 'EUR'>`.
    3.  Add a button in the header for EUR.
    4.  Update `currency.ts` to fetch EUR rates.

## 3. Technical Indicators (EMA & RSI)
**Feature**: Calculates 50-period EMA and 14-period RSI.
**How it works**:
-   Math logic is in `src/utils/indicators.ts` using `technicalindicators` library.
-   Calculations happen in `App.tsx` every time `data` updates.

**How to Edit**:
-   **To change the periods (e.g. EMA 50 -> EMA 200)**:
    -   Open `src/App.tsx`.
    -   Find `calculateEMA(data, 50)` and change `50` to `200`.
-   **To change the colors**:
    -   Open `src/components/TradingChart.tsx`.
    -   Find `addLineSeries` for EMA or RSI and change `color: '#...'`.

## 4. Signal Logic (Buy/Sell Markers)
**Feature**: Displays arrows when RSI crosses thresholds (30/70).
**How it works**:
-   `generateSignals` in `utils/indicators.ts` analyzes the data array.
-   It detects crossovers and returns a list of markers.

**How to Edit**:
-   **To change the logic (e.g. add MACD condition)**:
    -   Open `src/utils/indicators.ts`.
    -   Modify the `generateSignals` function. You can access price data (`data`) and indicator data (`rsiData`) here.
-   **To change default thresholds**:
    -   Open `src/App.tsx`.
    -   Modify the `config` state initialization values (buyThreshold, sellThreshold).

## 5. Real-time Data Connection
**Feature**: Connects to Binance WebSocket for live updates.
**How it works**:
-   `src/services/websocket.ts` manages the WebSocket connection.
-   It handles reconnection automatically.

**How to Edit**:
-   **To change the data source**:
    -   Open `src/services/websocket.ts`.
    -   Update the URL in `connect` method if using a different proxy or exchange.
-   **To change the trading pair**:
    -   Open `src/App.tsx`.
    -   Find `fetchBinanceKlines('SOLUSDT', ...)` and `binanceWS.connect('solusdt', ...)`.
    -   Change 'solusdt' to 'btcusdt' or any other pair.

## 6. Building for Production
To save your changes and create a deployed version:
1.  Run `npm run build` in the terminal.
2.  The output files will be in the `dist/` folder, ready to be hosted.
