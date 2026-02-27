import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home as HomeIcon, Filter } from 'lucide-react';

const HomeHeatmap = ({ homes }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const stats = useMemo(() => ({
        active: homes.filter(h => h.status === 'active').length,
        alert: homes.filter(h => h.status === 'alert').length,
        idle: homes.filter(h => h.status === 'idle').length,
        totalLoad: homes.reduce((s, h) => s + parseFloat(h.load || 0), 0).toFixed(1),
    }), [homes]);

    const filtered = useMemo(() => homes.filter(home => {
        const matchSearch = search === '' || String(home.id).includes(search);
        const matchFilter = filter === 'all' || home.status === filter;
        return matchSearch && matchFilter;
    }), [homes, search, filter]);

    return (
        <div className="glass-card">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-white font-bold">Residential Grid Alpha</h3>
                    <p className="text-white/30 text-[10px] mt-0.5">
                        {stats.active} active · {stats.alert} alerts · {stats.idle} idle · {stats.totalLoad} kW total
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                        <input
                            type="text"
                            placeholder="Node ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/70 placeholder:text-white/20 outline-none focus:border-white/20 w-28 transition-all"
                        />
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                        {['all', 'active', 'alert', 'idle'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${filter === f
                                    ? f === 'alert' ? 'bg-rose-500/30 text-rose-400'
                                        : f === 'idle' ? 'bg-white/10 text-white/60'
                                            : 'bg-emerald-500/30 text-emerald-400'
                                    : 'text-white/30 hover:text-white/60'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-4">
                {[
                    { status: 'active', label: 'Active', color: 'bg-emerald-500' },
                    { status: 'alert', label: 'Alert', color: 'bg-rose-500' },
                    { status: 'idle', label: 'Idle', color: 'bg-white/20' },
                ].map(({ status, label, color }) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-[9px] text-white/40">{label}</span>
                        <span className="text-[9px] text-white/20">({stats[status]})</span>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-10 sm:grid-cols-10 md:grid-cols-20 gap-1.5">
                <AnimatePresence mode="popLayout">
                    {filtered.map((home, idx) => (
                        <motion.div
                            key={home.id}
                            layout
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ delay: idx * 0.003 }}
                            whileHover={{ scale: 1.25, zIndex: 20 }}
                            className={`aspect-square rounded-[5px] relative group cursor-pointer transition-colors duration-700
                                ${home.status === 'active'
                                    ? 'bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:bg-emerald-400/70'
                                    : home.status === 'alert'
                                        ? 'bg-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.4)] hover:bg-rose-400/90'
                                        : 'bg-white/8 hover:bg-white/15'
                                }`}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-black/95 text-[8px] leading-tight text-white rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none border border-white/10 z-30 shadow-xl">
                                <p className="font-bold text-white/80">Node #{home.id}</p>
                                <p className="text-white/50">{home.load} kW · <span className={home.status === 'active' ? 'text-emerald-400' : home.status === 'alert' ? 'text-rose-400' : 'text-white/40'}>{home.status}</span></p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="col-span-10 py-16 flex flex-col items-center gap-3 opacity-30">
                        <HomeIcon className="w-8 h-8" />
                        <p className="text-xs">No nodes match filter</p>
                    </div>
                )}
            </div>

            {/* Summary bar */}
            <div className="mt-4 flex gap-1 h-1.5 rounded-full overflow-hidden">
                <motion.div
                    style={{ flex: stats.active }}
                    className="bg-emerald-500/60 rounded-full"
                    initial={{ flex: 0 }}
                    animate={{ flex: stats.active }}
                    transition={{ duration: 1 }}
                />
                <motion.div
                    style={{ flex: stats.alert }}
                    className="bg-rose-500/60 rounded-full"
                    initial={{ flex: 0 }}
                    animate={{ flex: stats.alert }}
                    transition={{ duration: 1 }}
                />
                <motion.div
                    style={{ flex: stats.idle }}
                    className="bg-white/15 rounded-full"
                    initial={{ flex: 0 }}
                    animate={{ flex: stats.idle }}
                    transition={{ duration: 1 }}
                />
            </div>
        </div>
    );
};

export default HomeHeatmap;
