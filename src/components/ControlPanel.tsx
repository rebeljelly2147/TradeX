import React from 'react';

export interface TradingConfig {
    buyThreshold: number;
    sellThreshold: number;
    retestLevel: number;
    targetPoints: number;
    stopLossPoints: number;
    enableRetest: boolean;
}

interface ControlPanelProps {
    config: TradingConfig;
    onConfigChange: (config: TradingConfig) => void;
    onClearSignals: () => void;
    strategyActive: boolean;
    currentSignal: string;
    totalSignals: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    config,
    onConfigChange,
    onClearSignals,
    strategyActive,
    currentSignal,
    totalSignals,
}) => {
    const handleInputChange = (field: keyof TradingConfig, value: number | boolean) => {
        onConfigChange({
            ...config,
            [field]: value,
        });
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Signal Configuration */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                        Signal Configuration
                    </h3>

                    <div className="space-y-2">
                        <label className="block">
                            <span className="text-sm text-slate-400">Buy RSI Threshold</span>
                            <input
                                type="number"
                                value={config.buyThreshold}
                                onChange={(e) => handleInputChange('buyThreshold', Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm text-slate-400">Sell RSI Threshold</span>
                            <input
                                type="number"
                                value={config.sellThreshold}
                                onChange={(e) => handleInputChange('sellThreshold', Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                min="0"
                                max="100"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm text-slate-400">Retest RSI Level</span>
                            <input
                                type="number"
                                value={config.retestLevel}
                                onChange={(e) => handleInputChange('retestLevel', Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="0"
                                max="100"
                            />
                        </label>
                    </div>
                </div>

                {/* Risk Management */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                        Risk Management
                    </h3>

                    <div className="space-y-2">
                        <label className="block">
                            <span className="text-sm text-slate-400">Target Points</span>
                            <input
                                type="number"
                                value={config.targetPoints}
                                onChange={(e) => handleInputChange('targetPoints', Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                min="0"
                                step="0.1"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm text-slate-400">Stop Loss Points</span>
                            <input
                                type="number"
                                value={config.stopLossPoints}
                                onChange={(e) => handleInputChange('stopLossPoints', Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                min="0"
                                step="0.1"
                            />
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.enableRetest}
                                onChange={(e) => handleInputChange('enableRetest', e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300">Enable Retest Signals</span>
                        </label>
                    </div>

                    <button
                        onClick={onClearSignals}
                        className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                        Clear Signals
                    </button>
                </div>

                {/* Strategy Status */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                        Strategy Status
                    </h3>

                    <div className="space-y-3 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                            <div className="mt-1 flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${strategyActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                <span className={`text-sm font-semibold ${strategyActive ? 'text-green-400' : 'text-gray-400'}`}>
                                    {strategyActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Current Signal</span>
                            <div className="mt-1 text-sm font-medium text-slate-200">
                                {currentSignal || 'No Signal'}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Total Signals</span>
                            <div className="mt-1 text-2xl font-bold text-blue-400">
                                {totalSignals}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
