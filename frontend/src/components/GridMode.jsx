import React, { useState } from 'react';
import { Globe, Zap, Settings, Power, Activity, BarChart2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const GridMode = ({ status }) => {
    const [optimizing, setOptimizing] = useState(false);

    if (!status) {
        return (
            <div className="glass-card flex items-center justify-center gap-3 text-white/30">
                <Cpu className="w-4 h-4 animate-spin" />
                <span className="text-xs">Fetching grid status...</span>
            </div>
        );
    }

    const isIsland = status.isIslandMode;
    const loadNum = parseFloat(status.load);
    const loadPct = isNaN(loadNum) ? 84 : loadNum;

    const handleOptimize = () => {
        setOptimizing(true);
        setTimeout(() => setOptimizing(false), 2500);
    };

    return (
        <div className="glass-card relative overflow-hidden h-full flex flex-col">
            {/* Rotating gear background */}
            <div className="absolute top-0 right-0 p-3 opacity-[0.04] pointer-events-none">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
                    <Settings size={100} />
                </motion.div>
            </div>

            {/* Top: Mode badge + title */}
            <div className="flex items-start justify-between relative z-10 mb-4">
                <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-bold mb-2">Grid Mode</p>
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`p-3 rounded-2xl border ${isIsland ? 'bg-amber-500/15 border-amber-500/30' : 'bg-emerald-500/15 border-emerald-500/30'}`}
                        >
                            {isIsland ? <Power size={24} className="text-amber-400" /> : <Globe size={24} className="text-emerald-400" />}
                        </motion.div>
                        <div>
                            <p className={`text-xl font-black uppercase tracking-tight leading-none ${isIsland ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {isIsland ? 'Island Mode' : 'Normal Grid'}
                            </p>
                            <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                                {isIsland ? 'AI autonomous isolation active' : 'Connected to main high-voltage core'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-[8px] font-black text-emerald-400/60 uppercase">Latency</p>
                        <p className="font-mono-display text-xs text-emerald-400 font-bold">14ms</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 relative z-10 flex-1">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 size={12} className="text-sky-400" />
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Load</span>
                    </div>
                    <p className="font-mono-display text-xl font-bold text-white leading-none">{status.load}</p>
                    {/* Load bar */}
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadPct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={12} className="text-violet-400" />
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Capacity</span>
                    </div>
                    <p className="font-mono-display text-xl font-bold text-white leading-none">{status.capacity}</p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-violet-500/60 to-violet-400/60 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 relative z-10">
                <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-400 transition-all uppercase tracking-widest disabled:opacity-60"
                >
                    {optimizing ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                                <Zap size={12} />
                            </motion.div>
                            Optimizing...
                        </>
                    ) : (
                        <>
                            <Zap size={12} />
                            Optimize Flow
                        </>
                    )}
                </button>
                <button className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                    <Settings size={14} />
                </button>
            </div>
        </div>
    );
};

export default GridMode;
