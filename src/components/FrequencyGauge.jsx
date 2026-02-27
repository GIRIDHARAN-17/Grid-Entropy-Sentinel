import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FrequencyGauge = ({ frequency }) => {
    const deviation = parseFloat((frequency - 50).toFixed(3));
    const isHealthy = Math.abs(deviation) < 0.2;
    const isCritical = Math.abs(deviation) > 0.5;

    // Needle rotation: 0Hz deviation = 0deg, ±1Hz = ±90deg, clamped
    const needleAngle = Math.max(-90, Math.min(90, deviation * 90));

    // Arc percentage: maps 49Hz→51Hz range to 0→100%
    const arcPercent = Math.min(100, Math.max(0, ((frequency - 49) / 2) * 100));

    const statusColor = isCritical ? '#f43f5e' : isHealthy ? '#10b981' : '#f59e0b';
    const statusLabel = isCritical ? 'CRITICAL' : isHealthy ? 'STABLE' : 'WARNING';

    // SVG arc helper
    const arcPath = useMemo(() => {
        const cx = 128, cy = 128, r = 95;
        const startAngle = -200;
        const totalSpan = 220;
        const endAngle = startAngle + totalSpan * (arcPercent / 100);
        const toRad = (a) => (a * Math.PI) / 180;
        const sx = cx + r * Math.cos(toRad(startAngle));
        const sy = cy + r * Math.sin(toRad(startAngle));
        const ex = cx + r * Math.cos(toRad(endAngle));
        const ey = cy + r * Math.sin(toRad(endAngle));
        const large = totalSpan * (arcPercent / 100) > 180 ? 1 : 0;
        return { sx, sy, ex, ey, large, cx, cy, r, startAngle, totalSpan };
    }, [arcPercent]);

    return (
        <div className="glass-card flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
            {/* Background Glow */}
            <motion.div
                animate={{ backgroundColor: `${statusColor}22` }}
                transition={{ duration: 1 }}
                className="absolute -inset-20 blur-[100px] opacity-30 pointer-events-none"
            />

            {/* Scan line effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="scan-line absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
            </div>

            <h3 className="text-white/30 uppercase text-[9px] tracking-[0.3em] font-bold mb-6 relative z-10">
                Grid Frequency Monitor
            </h3>

            {/* SVG Gauge */}
            <div className="relative w-64 h-56 z-10">
                <svg viewBox="0 0 256 200" className="w-full h-full" overflow="visible">
                    {/* Track */}
                    <path
                        d={`M ${arcPath.sx} ${arcPath.sy} A ${arcPath.r} ${arcPath.r} 0 1 1 ${arcPath.cx + arcPath.r * Math.cos((arcPath.startAngle + arcPath.totalSpan) * Math.PI / 180)} ${arcPath.cy + arcPath.r * Math.sin((arcPath.startAngle + arcPath.totalSpan) * Math.PI / 180)}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Active Arc */}
                    <motion.path
                        d={`M ${arcPath.sx} ${arcPath.sy} A ${arcPath.r} ${arcPath.r} 0 ${arcPath.large} 1 ${arcPath.ex} ${arcPath.ey}`}
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        animate={{ stroke: statusColor }}
                        transition={{ duration: 0.5 }}
                        style={{ filter: `drop-shadow(0 0 8px ${statusColor}88)` }}
                    />

                    {/* Tick marks */}
                    {[-1, -0.5, 0, 0.5, 1].map((val) => {
                        const angle = arcPath.startAngle + arcPath.totalSpan * ((val + 1) / 2);
                        const rad = angle * Math.PI / 180;
                        const r1 = arcPath.r + 16;
                        const r2 = arcPath.r + 22;
                        return (
                            <line
                                key={val}
                                x1={arcPath.cx + r1 * Math.cos(rad)}
                                y1={arcPath.cy + r1 * Math.sin(rad)}
                                x2={arcPath.cx + r2 * Math.cos(rad)}
                                y2={arcPath.cy + r2 * Math.sin(rad)}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Needle */}
                    <motion.g
                        style={{ transformOrigin: `${arcPath.cx}px ${arcPath.cy}px` }}
                        animate={{ rotate: needleAngle }}
                        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    >
                        <line
                            x1={arcPath.cx}
                            y1={arcPath.cy}
                            x2={arcPath.cx}
                            y2={arcPath.cy - 78}
                            stroke={statusColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <circle cx={arcPath.cx} cy={arcPath.cy} r="6" fill={statusColor} />
                        <circle cx={arcPath.cx} cy={arcPath.cy} r="3" fill="#0a0a0c" />
                    </motion.g>

                    {/* Center frequency text */}
                    <text x={arcPath.cx} y={arcPath.cy + 25} textAnchor="middle" className="font-mono-display">
                        <tspan
                            x={arcPath.cx}
                            fontSize="28"
                            fontWeight="900"
                            fontFamily="'JetBrains Mono', monospace"
                            fill="white"
                            letterSpacing="-1"
                        >
                            {frequency.toFixed(3)}
                        </tspan>
                        <tspan fontSize="11" fill={statusColor} fontFamily="'Inter', sans-serif" fontWeight="700" dx="3">Hz</tspan>
                    </text>
                </svg>
            </div>

            {/* Stats Row */}
            <div className="mt-4 grid grid-cols-3 gap-4 w-full relative z-10">
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[9px] text-white/30 uppercase font-bold mb-1 tracking-wider">Deviation</p>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={deviation}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`font-mono-display text-base font-bold ${isHealthy ? 'text-emerald-400' : isCritical ? 'text-rose-400' : 'text-amber-400'}`}
                        >
                            {deviation >= 0 ? '+' : ''}{deviation.toFixed(3)}
                        </motion.p>
                    </AnimatePresence>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[9px] text-white/30 uppercase font-bold mb-1 tracking-wider">Status</p>
                    <p className={`text-base font-black uppercase tracking-tight ${isHealthy ? 'text-emerald-400' : isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                        {statusLabel}
                    </p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[9px] text-white/30 uppercase font-bold mb-1 tracking-wider">Target</p>
                    <p className="font-mono-display text-base font-bold text-white/70">50.000</p>
                </div>
            </div>
        </div>
    );
};

export default FrequencyGauge;
