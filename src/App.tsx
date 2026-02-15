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

import { fetchUSDTToINR } from './utils/currency';

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

  // Currency state
  const [currency, setCurrency] = useState<'USDT' | 'INR'>('USDT');
  const [inrRate, setInrRate] = useState<number>(87.50);

  // Timeframe state
  const [interval, setIntervalState] = useState('1h');
  const INTERVALS = ['1m', '3m', '5m', '15m', '1h', '4h', '1d', '1w'];

  // Symbol state
  const [symbol, setSymbol] = useState('SOL');
  const SYMBOLS = [
    { name: 'BTC', pair: 'BTCUSDT', display: 'Bitcoin' },
    { name: 'ETH', pair: 'ETHUSDT', display: 'Ethereum' },
    { name: 'XRP', pair: 'XRPUSDT', display: 'XRP' },
    { name: 'SOL', pair: 'SOLUSDT', display: 'Solana' },
  ];

  // Fetch INR rate periodically
  useEffect(() => {
    const updateRate = async () => {
      const rate = await fetchUSDTToINR();
      setInrRate(rate);
    };

    updateRate(); // Fetch immediately
    const timer = setInterval(updateRate, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch candles for selected symbol and interval
        const selectedSymbol = SYMBOLS.find(s => s.name === symbol);
        if (!selectedSymbol) return;

        const klines = await fetchBinanceKlines(selectedSymbol.pair, interval, 500);
        setData(klines);

        // Start WebSocket connection
        binanceWS.connect(selectedSymbol.pair.toLowerCase(), interval);

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
  }, [interval, symbol]);

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
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Financial Charting Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time {symbol}/{currency} analysis ({interval}) with EMA 50 and RSI 14
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Symbol Selector */}
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
            {SYMBOLS.map((sym) => (
              <button
                key={sym.name}
                onClick={() => setSymbol(sym.name)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${symbol === sym.name
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
              >
                {sym.name}
              </button>
            ))}
          </div>

          {/* Interval Selector */}
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-600">
            {INTERVALS.map((int) => (
              <button
                key={int}
                onClick={() => setIntervalState(int)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${interval === int
                  ? 'bg-slate-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
              >
                {int}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrency(prev => prev === 'USDT' ? 'INR' : 'USDT')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium transition-colors border border-slate-600 flex items-center gap-2"
          >
            <span>{currency === 'USDT' ? '🇺🇸 USDT' : '🇮🇳 INR'}</span>
            <span className="text-slate-500">→</span>
            <span>{currency === 'USDT' ? '🇮🇳 INR' : '🇺🇸 USDT'}</span>
          </button>
        </div>
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
        {data.length > 0 && (
          <TradingChart
            data={data}
            emaData={emaData}
            rsiData={rsiData}
            signals={signals}
            currency={currency}
            rate={inrRate}
            interval={interval}
            symbol={symbol}
          />
        )}
      </main>

      <footer className="mt-8 pb-4 text-center text-sm text-gray-500">
        <p>Data from Binance Public API • Technical Indicators: EMA (50), RSI (14)</p>
      </footer>
    </div>
  );
}

export default App;
