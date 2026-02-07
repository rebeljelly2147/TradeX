import { EMA, RSI } from 'technicalindicators';
import type { Kline } from '../services/binance';

export interface IndicatorData {
    time: number;
    ema?: number;
    rsi?: number;
}

export interface SignalMarker {
    time: number;
    position: 'aboveBar' | 'belowBar';
    color: string;
    shape: 'arrowUp' | 'arrowDown';
    text: string;
    signalType: 'primary' | 'retest';
}

/**
 * Calculate EMA (Exponential Moving Average)
 */
export const calculateEMA = (
    data: Kline[],
    period: number = 50
): IndicatorData[] => {
    const closePrices = data.map((d) => d.close);
    const emaValues = EMA.calculate({
        period,
        values: closePrices,
    });

    // Pad the beginning with undefined values to match data length
    const paddedEMA = [
        ...Array(data.length - emaValues.length).fill(undefined),
        ...emaValues,
    ];

    return data.map((kline, index) => ({
        time: kline.time,
        ema: paddedEMA[index],
    }));
};

/**
 * Calculate RSI (Relative Strength Index)
 */
export const calculateRSI = (
    data: Kline[],
    period: number = 14
): IndicatorData[] => {
    const closePrices = data.map((d) => d.close);
    const rsiValues = RSI.calculate({
        period,
        values: closePrices,
    });

    // Pad the beginning with undefined values to match data length
    const paddedRSI = [
        ...Array(data.length - rsiValues.length).fill(undefined),
        ...rsiValues,
    ];

    return data.map((kline, index) => ({
        time: kline.time,
        rsi: paddedRSI[index],
    }));
};

/**
 * Generate Buy/Sell signals based on RSI thresholds with retest detection
 * 
 * Primary Signals:
 * - Buy: RSI crosses above oversold threshold
 * - Sell: RSI crosses below overbought threshold
 * 
 * Retest Signals (when enabled):
 * - After a primary BUY: RSI drops to retestLevel and bounces back up
 * - After a primary SELL: RSI rises to retestLevel and drops back down
 */
export const generateSignals = (
    data: Kline[],
    rsiData: IndicatorData[],
    oversoldThreshold: number = 30,
    overboughtThreshold: number = 70,
    retestLevel: number = 50,
    enableRetest: boolean = false
): SignalMarker[] => {
    const signals: SignalMarker[] = [];

    // State tracking for retest detection
    let lastPrimarySignal: 'buy' | 'sell' | null = null;
    let waitingForRetest = false;
    let hasRetested = false;

    for (let i = 1; i < rsiData.length; i++) {
        const prevRSI = rsiData[i - 1].rsi;
        const currRSI = rsiData[i].rsi;

        if (prevRSI === undefined || currRSI === undefined) continue;

        // PRIMARY SIGNAL DETECTION

        // Buy signal: RSI crosses above oversold threshold
        if (prevRSI <= oversoldThreshold && currRSI > oversoldThreshold) {
            signals.push({
                time: data[i].time,
                position: 'belowBar',
                color: '#26a69a',
                shape: 'arrowUp',
                text: 'BUY',
                signalType: 'primary',
            });

            // Update state for retest tracking
            lastPrimarySignal = 'buy';
            waitingForRetest = false;
            hasRetested = false;
        }

        // Sell signal: RSI crosses below overbought threshold
        if (prevRSI >= overboughtThreshold && currRSI < overboughtThreshold) {
            signals.push({
                time: data[i].time,
                position: 'aboveBar',
                color: '#ef5350',
                shape: 'arrowDown',
                text: 'SELL',
                signalType: 'primary',
            });

            // Update state for retest tracking
            lastPrimarySignal = 'sell';
            waitingForRetest = false;
            hasRetested = false;
        }

        // RETEST SIGNAL DETECTION
        if (!enableRetest) continue;

        if (lastPrimarySignal === 'buy') {
            // For BUY retests: wait for RSI to drop to retestLevel, then bounce back up

            // Check if RSI has dropped to or below retest level
            if (currRSI <= retestLevel && !waitingForRetest) {
                waitingForRetest = true;
                hasRetested = true;
            }

            // If we've touched retest level and RSI is now crossing back above it
            if (waitingForRetest && hasRetested && prevRSI <= retestLevel && currRSI > retestLevel) {
                signals.push({
                    time: data[i].time,
                    position: 'belowBar',
                    color: '#4ade80', // Lighter green for retest
                    shape: 'arrowUp',
                    text: 'BUY',
                    signalType: 'retest',
                });

                // Reset for potential next retest
                waitingForRetest = false;
                hasRetested = false;
            }
        }

        if (lastPrimarySignal === 'sell') {
            // For SELL retests: wait for RSI to rise to retestLevel, then drop back down

            // Check if RSI has risen to or above retest level
            if (currRSI >= retestLevel && !waitingForRetest) {
                waitingForRetest = true;
                hasRetested = true;
            }

            // If we've touched retest level and RSI is now crossing back below it
            if (waitingForRetest && hasRetested && prevRSI >= retestLevel && currRSI < retestLevel) {
                signals.push({
                    time: data[i].time,
                    position: 'aboveBar',
                    color: '#fb7185', // Lighter red for retest
                    shape: 'arrowDown',
                    text: 'SELL',
                    signalType: 'retest',
                });

                // Reset for potential next retest
                waitingForRetest = false;
                hasRetested = false;
            }
        }
    }

    return signals;
};
