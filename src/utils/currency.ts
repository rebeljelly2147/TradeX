
export const fetchUSDTToINR = async (): Promise<number> => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr');
        const data = await response.json();
        if (data.tether && data.tether.inr) {
            return data.tether.inr;
        }
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Failed to fetch USDT/INR rate:', error);
        return 87.50; // Fallback rate
    }
};
