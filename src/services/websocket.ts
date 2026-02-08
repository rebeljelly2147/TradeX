import type { Kline } from './binance';

type BinanceKlinePayload = {
    e: string; // Event type
    E: number; // Event time
    s: string; // Symbol
    k: {
        t: number; // Kline start time
        T: number; // Kline close time
        s: string; // Symbol
        i: string; // Interval
        f: number; // First trade ID
        L: number; // Last trade ID
        o: string; // Open price
        c: string; // Close price
        h: string; // High price
        l: string; // Low price
        v: string; // Base asset volume
        n: number; // Number of trades
        x: boolean; // Is this kline closed?
        q: string; // Quote asset volume
        V: string; // Taker buy base asset volume
        Q: string; // Taker buy quote asset volume
        B: string; // Ignore
    };
};

type KlineUpdateCallback = (kline: Kline) => void;

class BinanceWebSocketService {
    private ws: WebSocket | null = null;
    private subscribers: Set<KlineUpdateCallback> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private symbol: string = 'solusdt'; // Default symbol
    private interval: string = '1h';    // Default interval

    constructor() { }

    connect(symbol: string = 'solusdt', interval: string = '1h') {
        this.symbol = symbol.toLowerCase();
        this.interval = interval;
        const url = `wss://stream.binance.com:9443/ws/${this.symbol}@kline_${this.interval}`;

        console.log(`Connecting to Binance WebSocket: ${url}`);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Binance WebSocket Connected');
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const payload: BinanceKlinePayload = JSON.parse(event.data);
                if (payload.e === 'kline') {
                    const kline = this.transformPayloadToKline(payload);
                    this.notifySubscribers(kline);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('Binance WebSocket Disconnected');
            this.ws = null;
            // Auto-reconnect after 5 seconds
            this.reconnectTimer = setTimeout(() => {
                console.log('Attempting to reconnect...');
                this.connect(this.symbol, this.interval);
            }, 5000);
        };

        this.ws.onerror = (error) => {
            console.error('Binance WebSocket Error:', error);
            this.ws?.close();
        };
    }

    subscribe(callback: KlineUpdateCallback) {
        this.subscribers.add(callback);
        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.subscribers.clear();
    }

    private notifySubscribers(kline: Kline) {
        this.subscribers.forEach(callback => callback(kline));
    }

    private transformPayloadToKline(payload: BinanceKlinePayload): Kline {
        const k = payload.k;
        return {
            time: k.t / 1000, // Convert ms to seconds for lightweight-charts
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
        };
    }
}

export const binanceWS = new BinanceWebSocketService();
