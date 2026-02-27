import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

const LOG_TYPE_STYLES = {
    info: { color: 'text-sky-400', dot: 'bg-sky-400' },
    success: { color: 'text-emerald-400', dot: 'bg-emerald-400' },
    warning: { color: 'text-amber-400', dot: 'bg-amber-400' },
    error: { color: 'text-rose-400', dot: 'bg-rose-400' },
    ai: { color: 'text-violet-400', dot: 'bg-violet-400' },
};

const ActionLog = ({ logs }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-card flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-500/20 rounded-lg border border-violet-500/30">
                        <Terminal className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-none">System Log</h3>
                        <p className="text-[9px] text-white/30 mt-0.5">Real-time AI action stream</p>
                    </div>
                </div>
                <span className="text-[9px] text-white/20 font-mono-display">{logs.length} entries</span>
            </div>

            {/* Log scroll area */}
            <div
                ref={scrollRef}
                className="flex-1 space-y-1.5 overflow-y-auto min-h-0 pr-1"
                style={{ maxHeight: 200 }}
            >
                <AnimatePresence initial={false}>
                    {logs.map((log) => {
                        const style = LOG_TYPE_STYLES[log.type] || LOG_TYPE_STYLES.info;
                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-2 group"
                            >
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                                <div className="flex-1 min-w-0">
                                    <span className="font-mono-display text-[9px] text-white/20 mr-2">{log.time}</span>
                                    <span className={`text-[10px] font-medium ${style.color}`}>[{log.type.toUpperCase()}]</span>
                                    <span className="text-[10px] text-white/60 ml-1">{log.message}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Blinking cursor */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                <span className="text-[9px] font-mono-display text-emerald-400/60">grid@ento:~$</span>
                <span className="text-[9px] font-mono-display text-white/30">awaiting next directive</span>
                <span className="cursor-blink text-emerald-400 text-sm leading-none">▋</span>
            </div>
        </div>
    );
};

export default ActionLog;
