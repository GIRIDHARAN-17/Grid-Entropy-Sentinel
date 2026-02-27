import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FrequencyGauge from './components/FrequencyGauge';
import HomeHeatmap from './components/HomeHeatmap';
import AttackAlert from './components/AttackAlert';
import GridMode from './components/GridMode';
import EnergyChart from './components/EnergyChart';
import ActionLog from './components/ActionLog';
import socketService from './services/socket';
import { getGridStatus } from './services/api';
import { MOCK_HOMES, MOCK_ALERTS, MOCK_GRID_STATUS } from './services/mockData';
import { motion } from 'framer-motion';
import { Sun, Wind, Battery, Cpu } from 'lucide-react';

// ─── Log message templates ───────────────────────────────────────────────────
const LOG_TEMPLATES = [
  { type: 'ai', messages: ['AI optimizer rebalanced sector 4-B loads', 'Neural predictor updated demand forecast', 'AI isolated faulty node #73', 'Predictive maintenance alert for transformer T-12'] },
  { type: 'success', messages: ['Frequency stabilized at 50.002 Hz', 'Solar array output synced', 'Battery storage at 94% capacity', 'Load balancing completed'] },
  { type: 'info', messages: ['Wind farm WF-3 online', 'Grid capacity check passed', 'Telemetry packet received from all 100 nodes', 'Scheduled maintenance window: 02:00 UTC'] },
  { type: 'warning', messages: ['Demand spike detected in zone 7', 'Substation S-4 running at 95%', 'Frequency drift +0.08 Hz', 'Node #42 reporting degraded performance'] },
];

let logIdCounter = 1;

const generateLog = () => {
  const tpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  const msg = tpl.messages[Math.floor(Math.random() * tpl.messages.length)];
  const now = new Date();
  return {
    id: logIdCounter++,
    type: tpl.type,
    message: msg,
    time: now.toLocaleTimeString('en-US', { hour12: false }),
  };
};

// ─── Top Stats Bar ────────────────────────────────────────────────────────────
const StatBadge = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-card py-3 px-4 flex items-center gap-3 flex-1 min-w-[140px]"
  >
    <div className={`p-2 rounded-xl border ${color.bg} ${color.border}`}>
      <Icon className={`w-4 h-4 ${color.text}`} />
    </div>
    <div>
      <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{label}</p>
      <p className={`font-mono-display text-base font-bold ${color.text}`}>{value}</p>
    </div>
  </motion.div>
);

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [frequency, setFrequency] = useState(50.0);
  const [liveStatus, setLiveStatus] = useState(false);
  const [homes, setHomes] = useState(MOCK_HOMES || []);
  const [alerts] = useState(MOCK_ALERTS || []);
  const [gridStatus, setGridStatus] = useState(MOCK_GRID_STATUS || null);
  const [frequencyHistory, setFrequencyHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [solarOutput, setSolarOutput] = useState(72);
  const [windOutput, setWindOutput] = useState(88);
  const [batteryLevel, setBatteryLevel] = useState(94);

  const addLog = useCallback((log) => {
    setLogs(prev => [...prev, log].slice(-60));
  }, []);

  useEffect(() => {
    // Connect socket
    socketService.connect();
    setLiveStatus(true);

    // Fetch grid status
    getGridStatus().then(status => {
      if (status) setGridStatus(status);
    });

    // Seed initial logs
    const seedLogs = Array.from({ length: 5 }, generateLog);
    setLogs(seedLogs);

    // Frequency simulation
    const freqInterval = setInterval(() => {
      setFrequency(prev => {
        const drift = (Math.random() - 0.5) * 0.04;
        const newFreq = parseFloat((prev + drift + (50 - prev) * 0.12).toFixed(3));

        const now = new Date();
        const timeLabel = now.toLocaleTimeString('en-US', { hour12: false, second: '2-digit' });
        setFrequencyHistory(h => [...h, { time: timeLabel, freq: newFreq }].slice(-60));

        return newFreq;
      });
    }, 1000);

    // Home load updates
    const homeInterval = setInterval(() => {
      setHomes(prev => prev.map(home =>
        Math.random() > 0.97 ? { ...home, load: (Math.random() * 5).toFixed(2) } : home
      ));
    }, 2000);

    // Log generation
    const logInterval = setInterval(() => {
      addLog(generateLog());
    }, 3500);

    // Renewable simulation
    const renewableInterval = setInterval(() => {
      setSolarOutput(prev => Math.max(40, Math.min(100, prev + (Math.random() - 0.48) * 3)));
      setWindOutput(prev => Math.max(30, Math.min(100, prev + (Math.random() - 0.5) * 4)));
      setBatteryLevel(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.51) * 0.5)));
    }, 2500);

    // Real socket listeners
    socketService.onTelemetry((data) => {
      if (data.frequency) setFrequency(data.frequency);
      if (data.homes) setHomes(data.homes);
    });

    return () => {
      socketService.disconnect();
      clearInterval(freqInterval);
      clearInterval(homeInterval);
      clearInterval(logInterval);
      clearInterval(renewableInterval);
    };
  }, [addLog]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Navbar liveStatus={liveStatus} frequency={frequency} />

      <main className="pt-24 pb-16 px-4 max-w-[1600px] mx-auto">

        {/* ─── Top KPI Bar ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          <StatBadge
            icon={Sun}
            label="Solar Output"
            value={`${solarOutput.toFixed(0)}%`}
            color={{ bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' }}
          />
          <StatBadge
            icon={Wind}
            label="Wind Output"
            value={`${windOutput.toFixed(0)}%`}
            color={{ bg: 'bg-sky-500/15', border: 'border-sky-500/30', text: 'text-sky-400' }}
          />
          <StatBadge
            icon={Battery}
            label="Battery Store"
            value={`${batteryLevel.toFixed(0)}%`}
            color={{ bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' }}
          />
          <StatBadge
            icon={Cpu}
            label="AI Ops"
            value="Active"
            color={{ bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400' }}
          />
        </motion.div>

        {/* ─── Main Grid ───────────────────────────────── */}
        <div className="grid grid-cols-12 gap-5 items-start">

          {/* Frequency Gauge — col 7 */}
          <motion.div
            className="col-span-12 lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FrequencyGauge frequency={frequency} />
          </motion.div>

          {/* Right column: GridMode + AttackAlert */}
          <motion.div
            className="col-span-12 lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col gap-5">
              <GridMode status={gridStatus} />
              <AttackAlert alerts={alerts} />
            </div>
          </motion.div>

          {/* Energy Chart — full width */}
          <motion.div
            className="col-span-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <EnergyChart frequencyHistory={frequencyHistory} />
          </motion.div>

          {/* Home Heatmap — col 8 */}
          <motion.div
            className="col-span-12 lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <HomeHeatmap homes={homes} />
          </motion.div>

          {/* Action Log — col 4 */}
          <motion.div
            className="col-span-12 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <ActionLog logs={logs} />
          </motion.div>

        </div>
      </main>

      <footer className="text-center py-8 border-t border-white/5">
        <p className="text-[9px] text-white/15 uppercase tracking-[0.4em]">
          © 2026 GridEnto Advanced Systems · AI Grid Control · DeepMind Core
        </p>
      </footer>
    </div>
  );
}

export default App;
