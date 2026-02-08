# Implementation Plan - Phase 6: Time Frame Selection

## Goal
Allow the user to select different time frames (e.g., 1m, 15m, 1h, 4h, 1d) for the chart, updating both the historical data and the real-time WebSocket connection.

## Proposed Changes

### Application Logic
#### [MODIFY] [App.tsx](file:///Users/raka/Desktop/Project/Lino/src/App.tsx)
-   Add state: `const [interval, setIntervalState] = useState('1h');`
-   Define available intervals: `['1m', '3m', '5m', '15m', '1h', '4h', '1d']`.
-   Update `loadData` effect:
    -   Add `interval` to dependency array.
    -   Pass `interval` to `fetchBinanceKlines`.
    -   Pass `interval` to `binanceWS.connect`.
-   Add UI in Header:
    -   A row of buttons or a dropdown to select the interval.
    -   Highlight current interval.

## Verification Plan

### Manual Verification
-   **Switch Interval**: Click on different intervals (e.g., switch from 1h to 1m).
-   **Verify Data**: Chart should reload with new candles (zoom level might change).
-   **Verify Real-time**: Wait for a new tick. Console logs (if any) or chart updates should match the new interval frequency.
