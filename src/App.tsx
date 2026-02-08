import { useState, useEffect } from 'react';
import { TradingChart } from './components/TradingChart';
import { ControlPanel } from './components/ControlPanel';
import type { TradingConfig } from './components/ControlPanel';
import { fetchBinanceKlines } from './services/binance';
import type { Kline } from './services/binance';
import {
  calculateEMA,
  calculateRSI,
  generateSignals,
} from './utils/indicators';
import { binanceWS } from './services/websocket';
import './index.css';

function App() {
  const [data, setData] = useState<Kline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trading configuration state
  const [config, setConfig] = useState<TradingConfig>({
    buyThreshold: 70,
    sellThreshold: 30,
    retestLevel: 50,
    targetPoints: 5,
    stopLossPoints: 2,
    enableRetest: true,
  });



  // ... (imports remain the same)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch SOL/USDT 1-hour candles (Binance uses USDT, not USD)
        const klines = await fetchBinanceKlines('SOLUSDT', '1h', 500);
        setData(klines);

        // Start WebSocket connection
        binanceWS.connect('solusdt', '1h');

        // Subscribe to updates
        const unsubscribe = binanceWS.subscribe((newKline) => {
          console.log('WS Update:', newKline.close, new Date(newKline.time * 1000).toLocaleTimeString());
          setData((prevData) => {
            if (prevData.length === 0) return [newKline];

            const lastKline = prevData[prevData.length - 1];

            // If the new kline has the same time as the last one, update it
            if (lastKline.time === newKline.time) {
              const newData = [...prevData];
              newData[newData.length - 1] = newKline;
              return newData;
            }

            // If the new kline is newer, append it
            if (newKline.time > lastKline.time) {
              return [...prevData, newKline];
            }

            return prevData;
          });
        });

        // Cleanup function for this effect
        return () => {
          unsubscribe();
          binanceWS.disconnect();
        };

      } catch (err) {
        setError('Failed to load chart data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup on unmount (if component unmounts before loadData completes/returns)
    return () => {
      binanceWS.disconnect();
    };
  }, []);

  // Calculate indicators
  const emaData = data.length > 0 ? calculateEMA(data, 50) : [];
  const rsiData = data.length > 0 ? calculateRSI(data, 14) : [];
  const signals = data.length > 0
    ? generateSignals(
      data,
      rsiData,
      config.sellThreshold,
      config.buyThreshold,
      config.retestLevel,
      config.enableRetest
    )
    : [];

  // Calculate strategy status
  const strategyActive = data.length > 0;
  const lastSignal = signals.length > 0 ? signals[signals.length - 1] : null;
  const currentSignal = lastSignal
    ? `${lastSignal.text} (${lastSignal.signalType === 'primary' ? 'Primary' : 'Retest'})`
    : 'No Signal';
  const totalSignals = signals.length;

  const handleClearSignals = () => {
    console.log('Clear signals clicked - will implement marker clearing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300 text-lg">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center bg-red-900/20 border border-red-500 rounded-lg p-6">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-100">
          Financial Charting Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time SOL/USD analysis with EMA 50 and RSI 14
        </p>
      </header>

      <main className="container mx-auto px-4">
        {/* Control Panel */}
        <div className="mt-6">
          <ControlPanel
            config={config}
            onConfigChange={setConfig}
            onClearSignals={handleClearSignals}
            strategyActive={strategyActive}
            currentSignal={currentSignal}
            totalSignals={totalSignals}
          />
        </div>

        {/* Trading Chart */}
        <TradingChart
          data={data}
          emaData={emaData}
          rsiData={rsiData}
          signals={signals}
        />
      </main>

      <footer className="mt-8 pb-4 text-center text-sm text-gray-500">
        <p>Data from Binance Public API • Technical Indicators: EMA (50), RSI (14)</p>
      </footer>
    </div>
  );
}

export default App;
