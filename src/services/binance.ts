import axios from 'axios';

export interface Kline {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const BINANCE_API = 'https://api.binance.com/api/v3';

/**
 * Fetch OHLCV data from Binance
 * @param symbol - Trading pair (e.g., 'SOLUSDT')
 * @param interval - Timeframe (e.g., '1h')
 * @param limit - Number of candles to fetch (default: 500)
 */
export const fetchBinanceKlines = async (
    symbol: string,
    interval: string = '1h',
    limit: number = 500
): Promise<Kline[]> => {
    try {
        const response = await axios.get(`${BINANCE_API}/klines`, {
            params: {
                symbol,
                interval,
                limit,
            },
        });

        // Transform Binance kline data to our format
        return response.data.map((kline: any[]) => ({
            time: Math.floor(kline[0] / 1000), // Convert ms to seconds
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5]),
        }));
    } catch (error) {
        console.error('Error fetching Binance data:', error);
        throw error;
    }
};
