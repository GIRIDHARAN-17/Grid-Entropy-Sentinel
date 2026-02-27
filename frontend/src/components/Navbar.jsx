import React, { useState } from 'react';
import { Shield, Activity, Zap, Menu, X, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ liveStatus, frequency }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const isStable = Math.abs(frequency - 50) < 0.2;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
            <div className="max-w-[1600px] mx-auto backdrop-blur-xl bg-black/50 border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/40">
                            <Zap className="text-emerald-400 w-5 h-5" fill="currentColor" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black" />
                    </div>
                    <div>
                        <h1 className="text-base font-black tracking-tight leading-none">
                            <span className="text-white">Grid</span>
                            <span className="text-emerald-400">Ento</span>
                        </h1>
                        <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] font-medium mt-0.5">
                            AI Virtual Power Plant
                        </p>
                    </div>
                </div>

                {/* Center Stats — hidden on mobile */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Radio className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Frequency</span>
                        <span className={`font-mono-display text-sm font-bold tracking-widest ${isStable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {frequency.toFixed(3)} <span className="text-[10px] font-normal opacity-60">Hz</span>
                        </span>
                        {/* Mini bar */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${isStable ? 'bg-emerald-400' : 'bg-rose-400'}`}
                                animate={{ width: `${Math.min(100, Math.max(0, ((frequency - 49) / 2) * 100))}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Activity className="w-3 h-3 text-sky-400" />
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Grid Load</span>
                        <span className="font-mono-display text-sm font-bold text-sky-400">84%</span>
                    </div>
                </div>

                {/* Right Status */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5">
                        <div className={`status-dot ${liveStatus ? 'status-online' : 'status-offline'}`} />
                        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-widest">
                            {liveStatus ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Secure</span>
                    </div>
                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
                        onClick={() => setMobileOpen(v => !v)}
                    >
                        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden mt-2 max-w-[1600px] mx-auto backdrop-blur-xl bg-black/70 border border-white/10 rounded-2xl px-5 py-4 flex flex-col gap-3"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Frequency</span>
                            <span className={`font-mono-display text-sm font-bold ${isStable ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {frequency.toFixed(3)} Hz
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Grid Load</span>
                            <span className="font-mono-display text-sm font-bold text-sky-400">84%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`status-dot ${liveStatus ? 'status-online' : 'status-offline'}`} />
                                <span className="text-[10px] font-semibold text-white/70">{liveStatus ? 'LIVE' : 'OFFLINE'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
