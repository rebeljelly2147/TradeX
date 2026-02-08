import React, { useEffect, useRef, useMemo } from 'react';
import { createChart } from 'lightweight-charts';
import type {
    IChartApi,
    ISeriesApi,
    CandlestickData,
    LineData,
    Time
} from 'lightweight-charts';
import type { Kline } from '../services/binance';
import type { IndicatorData, SignalMarker } from '../utils/indicators';

interface TradingChartProps {
    data: Kline[];
    emaData: IndicatorData[];
    rsiData: IndicatorData[];
    signals: SignalMarker[];
    currency: 'USDT' | 'INR';
    rate: number;
    interval: string;
}

export const TradingChart: React.FC<TradingChartProps> = ({
    data,
    emaData,
    rsiData,
    signals,
    currency,
    rate,
    interval,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);

    const [tooltipData, setTooltipData] = React.useState<{
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
    } | null>(null);

    // Memoize chart data transformations with conversion
    const candleData = useMemo(
        (): CandlestickData<Time>[] =>
            data.map((d) => {
                const multiplier = currency === 'INR' ? rate : 1;
                return {
                    time: d.time as Time,
                    open: d.open * multiplier,
                    high: d.high * multiplier,
                    low: d.low * multiplier,
                    close: d.close * multiplier,
                };
            }),
        [data, currency, rate]
    );

    const emaLineData = useMemo(
        (): LineData<Time>[] =>
            emaData
                .filter((d) => d.ema !== undefined)
                .map((d) => ({
                    time: d.time as Time,
                    value: d.ema! * (currency === 'INR' ? rate : 1),
                })),
        [emaData, currency, rate]
    );

    const rsiLineData = useMemo(
        (): LineData<Time>[] =>
            rsiData
                .filter((d) => d.rsi !== undefined)
                .map((d) => ({
                    time: d.time as Time,
                    value: d.rsi!,
                })),
        [rsiData]
    );

    // Initialize charts
    useEffect(() => {
        if (!chartContainerRef.current || !rsiContainerRef.current) return;

        // Create main price chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { color: '#0f1419' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: '#334155',
            },
            timeScale: {
                borderColor: '#334155',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Add candlestick series (v4 API)
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        candlestickSeriesRef.current = candlestickSeries;

        // Add EMA line series (v4 API)
        const emaSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: 'EMA 50',
        });
        emaSeriesRef.current = emaSeries;

        // Create RSI chart
        const rsiChart = createChart(rsiContainerRef.current, {
            width: rsiContainerRef.current.clientWidth,
            height: 150,
            layout: {
                background: { color: '#0f1419' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#1e293b' },
                horzLines: { color: '#1e293b' },
            },
            rightPriceScale: {
                borderColor: '#334155',
            },
            timeScale: {
                borderColor: '#334155',
                visible: false,
            },
        });

        rsiChartRef.current = rsiChart;

        // Add RSI line series (v4 API)
        const rsiSeries = rsiChart.addLineSeries({
            color: '#9333ea',
            lineWidth: 2,
            title: 'RSI 14',
        });
        rsiSeriesRef.current = rsiSeries;

        // Tooltip logic
        const updateTooltip = (param: any) => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current!.clientWidth ||
                param.point.y < 0 ||
                param.point.y > chartContainerRef.current!.clientHeight
            ) {
                return;
            }

            const candle = param.seriesData.get(candlestickSeries);
            if (candle) {
                setTooltipData({
                    time: candle.time as number,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                });
            }
        };

        chart.subscribeCrosshairMove(updateTooltip);

        // Cleanup on unmount
        return () => {
            chart.unsubscribeCrosshairMove(updateTooltip);
            chart.remove();
            rsiChart.remove();
        };
    }, []);

    // Update chart data
    useEffect(() => {
        if (!candlestickSeriesRef.current || !emaSeriesRef.current || !rsiSeriesRef.current) return;

        candlestickSeriesRef.current.setData(candleData);
        emaSeriesRef.current.setData(emaLineData);
        rsiSeriesRef.current.setData(rsiLineData);

        // Add markers for Buy/Sell signals
        if (signals.length > 0 && candlestickSeriesRef.current) {
            try {
                (candlestickSeriesRef.current as any).setMarkers(
                    signals.map(s => ({
                        time: s.time as Time,
                        position: s.position,
                        color: s.color,
                        shape: s.shape,
                        text: s.text,
                    }))
                );
            } catch (error) {
                console.error('Error setting markers:', error);
            }
        }
    }, [candleData, emaLineData, rsiLineData, signals]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
            if (rsiChartRef.current && rsiContainerRef.current) {
                rsiChartRef.current.applyOptions({
                    width: rsiContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatPrice = (price: number) => {
        return currency === 'INR' ? `₹${price.toFixed(2)}` : `$${price.toFixed(2)}`;
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4">
            {/* Main Price Chart */}
            <div className="bg-slate-900 rounded-lg shadow-xl p-4 relative">
                <h2 className="text-xl font-bold mb-2 text-gray-100 flex items-center gap-4">
                    <span>SOL/{currency} - {interval}</span>
                    {tooltipData && (
                        <div className="flex gap-4 text-xs font-mono font-normal">
                            <span className="text-gray-400">
                                {new Date(tooltipData.time * 1000).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                            <span className={tooltipData.close >= tooltipData.open ? 'text-green-400' : 'text-red-400'}>
                                O: {formatPrice(tooltipData.open)}
                            </span>
                            <span className={tooltipData.close >= tooltipData.open ? 'text-green-400' : 'text-red-400'}>
                                H: {formatPrice(tooltipData.high)}
                            </span>
                            <span className={tooltipData.close >= tooltipData.open ? 'text-green-400' : 'text-red-400'}>
                                L: {formatPrice(tooltipData.low)}
                            </span>
                            <span className={tooltipData.close >= tooltipData.open ? 'text-green-400' : 'text-red-400'}>
                                C: {formatPrice(tooltipData.close)}
                            </span>
                        </div>
                    )}
                </h2>
                <div ref={chartContainerRef} className="w-full" />
            </div>

            {/* RSI Chart */}
            <div className="bg-slate-900 rounded-lg shadow-xl p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-100">RSI (14)</h3>
                <div ref={rsiContainerRef} className="w-full" />
            </div>
        </div>
    );
};
