import React, { useMemo } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ReferenceLine, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value;
    const dev = (val - 50).toFixed(3);
    return (
        <div className="bg-black/90 border border-white/15 rounded-xl px-3 py-2 text-[10px] shadow-xl">
            <p className="text-white/50 mb-1">{payload[0]?.payload?.time}</p>
            <p className="font-mono-display font-bold text-white">{val?.toFixed(3)} Hz</p>
            <p className={`font-mono-display ${parseFloat(dev) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Δ {parseFloat(dev) >= 0 ? '+' : ''}{dev}
            </p>
        </div>
    );
};

const EnergyChart = ({ frequencyHistory }) => {
    const trend = useMemo(() => {
        if (frequencyHistory.length < 2) return 'stable';
        const last = frequencyHistory[frequencyHistory.length - 1]?.freq ?? 50;
        const prev = frequencyHistory[frequencyHistory.length - 5]?.freq ?? 50;
        const diff = last - prev;
        if (diff > 0.01) return 'up';
        if (diff < -0.01) return 'down';
        return 'stable';
    }, [frequencyHistory]);

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white/40';

    const chartData = frequencyHistory.map((d, i) => ({
        time: d.time,
        freq: d.freq,
        idx: i,
    }));

    const minVal = Math.min(...chartData.map(d => d.freq), 49.5);
    const maxVal = Math.max(...chartData.map(d => d.freq), 50.5);

    return (
        <div className="glass-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-white font-bold text-sm">Frequency Timeline</h3>
                    <p className="text-[9px] text-white/30 mt-0.5">Last 60 seconds · 100ms resolution</p>
                </div>
                <div className="flex items-center gap-2">
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    <span className="text-[9px] text-white/30 uppercase font-bold tracking-wider">{trend}</span>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500/60 border border-emerald-500/40" />
                        <span className="text-[9px] text-white/30">50 Hz nominal</span>
                    </div>
                </div>
            </div>

            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)', fontFamily: 'Inter' }}
                            tickLine={false}
                            axisLine={false}
                            interval={Math.floor(chartData.length / 5)}
                        />
                        <YAxis
                            domain={[Math.floor(minVal * 100) / 100 - 0.05, Math.ceil(maxVal * 100) / 100 + 0.05]}
                            tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono', monospace" }}
                            tickLine={false}
                            axisLine={false}
                            tickCount={5}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={50} stroke="rgba(16,185,129,0.2)" strokeDasharray="4 4" />
                        <Area
                            type="monotone"
                            dataKey="freq"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#freqGradient)"
                            dot={false}
                            animationDuration={0}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EnergyChart;
