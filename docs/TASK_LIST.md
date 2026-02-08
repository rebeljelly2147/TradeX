# Tasks

- [x] Investigate `lightweight-charts` type definitions <!-- id: 0 -->
- [x] Implement correct API calls in `TradingChart.tsx` <!-- id: 1 -->
- [x] Verify fix by checking for type errors <!-- id: 2 -->

## Phase 2: Real-time Data
- [x] Create `WebSocketService` for Binance streams <!-- id: 3 -->
- [x] Integrate WebSocket updates in `App.tsx` <!-- id: 4 -->
- [x] Implement efficient state updates (update last candle vs append new) <!-- id: 5 -->
- [x] Verify real-time updates and indicator recalculation <!-- id: 6 -->

## Phase 3: Tooltip & Overlay
- [x] Create `ChartTooltip` component or overlay logic <!-- id: 7 -->
- [x] Integrate `subscribeCrosshairMove` in `TradingChart.tsx` <!-- id: 8 -->
- [x] Format and display OHLC + Time data dynamically <!-- id: 9 -->

## Phase 4: INR Conversion
- [x] Add INR/USD exchange rate fetching (or fixed constants) <!-- id: 10 -->
- [x] Add currency toggle state in `App.tsx` <!-- id: 11 -->
- [x] Pass currency mode and rate to `TradingChart.tsx` <!-- id: 12 -->
- [x] Update tooltip and scale to show INR values <!-- id: 13 -->

## Phase 5: Dynamic Exchange Rate
- [x] Implement `fetchUSDTPrice` service using CoinGecko API <!-- id: 14 -->
- [x] Update `App.tsx` to fetch rate on interval (e.g., 60s) <!-- id: 15 -->
- [x] Add fallback mechanism (last known rate or constant) <!-- id: 16 -->

## Phase 6: Time Frame Selection
- [x] Add interval selector UI in `App.tsx` <!-- id: 17 -->
- [x] Update `App.tsx` state to specific interval <!-- id: 18 -->
- [x] Re-fetch data and reconnect WebSocket on interval change <!-- id: 19 -->
