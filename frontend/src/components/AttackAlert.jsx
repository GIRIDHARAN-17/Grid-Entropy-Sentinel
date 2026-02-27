import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Cpu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_CONFIG = {
    Security: { color: 'rose', icon: ShieldAlert },
    Frequency: { color: 'amber', icon: AlertTriangle },
    Load: { color: 'orange', icon: AlertTriangle },
    System: { color: 'sky', icon: AlertTriangle },
};

const AttackAlert = ({ alerts: initialAlerts }) => {
    const [alerts, setAlerts] = useState(initialAlerts);

    const clearAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
    const clearAll = () => setAlerts([]);

    return (
        <div className="glass-card h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-500/20 rounded-lg border border-rose-500/30">
                        <ShieldAlert className="text-rose-400 w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-none">Threat Detection</h3>
                        <p className="text-[9px] text-white/30 mt-0.5">Cyber & Grid attack monitor</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <motion.span
                        animate={alerts.length > 0 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`px-2 py-1 text-[9px] rounded-md border font-black uppercase tracking-wider
                            ${alerts.length > 0
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                    >
                        {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                    </motion.span>
                </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                <AnimatePresence initial={false}>
                    {alerts.map((alert) => {
                        const cfg = SEVERITY_CONFIG[alert.type] || SEVERITY_CONFIG.System;
                        const Icon = cfg.icon;
                        const c = cfg.color;
                        return (
                            <motion.div
                                key={alert.id}
                                layout
                                initial={{ x: 40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -30, opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className={`p-3 bg-${c}-950/20 border border-${c}-500/20 rounded-xl flex gap-3 relative overflow-hidden group`}
                            >
                                {/* Hover sweep */}
                                <div className={`absolute inset-0 bg-gradient-to-r from-${c}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className={`mt-0.5 flex-shrink-0 p-1.5 bg-${c}-500/20 rounded-lg`}>
                                    <Icon className={`w-3 h-3 text-${c}-400`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-black text-${c}-400 uppercase tracking-wider`}>
                                            {alert.type}
                                        </span>
                                        <span className="text-[9px] text-white/20">·</span>
                                        <span className="text-[9px] text-white/30">
                                            {new Date(alert.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/75 leading-relaxed truncate">
                                        {alert.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => clearAlert(alert.id)}
                                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
                                >
                                    <X className="w-3 h-3 text-white/40" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Empty State */}
                {alerts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-10 gap-3"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-emerald-400/60" />
                        </div>
                        <p className="text-xs text-white/30 text-center">All systems nominal<br />No threats detected</p>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <button
                onClick={clearAll}
                disabled={alerts.length === 0}
                className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/40 hover:bg-white/10 hover:text-white/70 transition-all uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <X className="w-3 h-3" />
                Clear All Logs
            </button>
        </div>
    );
};

export default AttackAlert;
