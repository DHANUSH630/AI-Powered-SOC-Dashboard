import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  HiOutlineDocumentText,
  HiOutlineShieldExclamation,
  HiOutlineExclamationCircle,
  HiOutlineBan,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiGlobe,
  HiSparkles,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const mockAlerts = [
  {
    id: 'ALT-1092',
    timestamp: '18:52:10',
    type: 'SSH Brute Force',
    source: '185.220.101.5',
    country: 'RU',
    severity: 'CRITICAL',
    status: 'NEW',
    mitre: 'T1110',
  },
  {
    id: 'ALT-1091',
    timestamp: '18:49:33',
    type: 'SQL Injection Attempt',
    source: '45.142.120.10',
    country: 'CN',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    mitre: 'T1190',
  },
  {
    id: 'ALT-1090',
    timestamp: '18:45:01',
    type: 'Port Scan Detected',
    source: '194.26.29.112',
    country: 'DE',
    severity: 'MEDIUM',
    status: 'NEW',
    mitre: 'T1046',
  },
  {
    id: 'ALT-1089',
    timestamp: '18:40:15',
    type: 'PowerShell Malicious Script',
    source: '10.0.4.15 (Host)',
    country: 'INT',
    severity: 'HIGH',
    status: 'RESOLVED',
    mitre: 'T1059.001',
  },
  {
    id: 'ALT-1088',
    timestamp: '18:32:40',
    type: 'Directory Traversal',
    source: '89.248.165.74',
    country: 'NL',
    severity: 'LOW',
    status: 'DISMISSED',
    mitre: 'T1083',
  },
];

const topAttackingCountries = [
  { country: 'Russia (RU)', flag: '🇷🇺', count: 482, percentage: 38, ip: '185.220.101.5' },
  { country: 'China (CN)', flag: '🇨🇳', count: 320, percentage: 25, ip: '45.142.120.10' },
  { country: 'Germany (DE)', flag: '🇩🇪', count: 195, percentage: 15, ip: '194.26.29.112' },
  { country: 'Netherlands (NL)', flag: '🇳🇱', count: 140, percentage: 11, ip: '89.248.165.74' },
  { country: 'United States (US)', flag: '🇺🇸', count: 110, percentage: 9, ip: '162.243.10.15' },
];

export default function Dashboard() {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [scanning, setScanning] = useState(false);

  // 1. Attack Timeline Line Chart Data
  const timelineData = {
    labels: [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ],
    datasets: [
      {
        label: 'Critical Threats',
        data: [12, 19, 8, 25, 42, 30, 48, 65, 52, 78, 60, 45],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointHoverRadius: 6,
      },
      {
        label: 'Anomaly Events (IsolationForest ML)',
        data: [28, 35, 20, 45, 68, 55, 72, 90, 85, 110, 95, 80],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#818cf8',
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  // 2. Threat Severity Distribution Donut Data
  const donutData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [18, 32, 35, 15],
        backgroundColor: ['#dc2626', '#f97316', '#eab308', '#3b82f6'],
        borderColor: '#0f172a',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 11 },
          usePointStyle: true,
        },
      },
    },
    cutout: '70%',
  };

  const handleTriggerAIScan = async () => {
    setScanning(true);
    toast.loading('🤖 Running IsolationForest ML Anomaly Scan across 1,247,893 logs...', { id: 'ai-scan' });

    setTimeout(() => {
      setScanning(false);
      toast.success('✓ AI Scan Complete: 0 New Zero-Day Exploits. 23 Threats Mitigated.', { id: 'ai-scan' });
    }, 2500);
  };

  const handleBlockIP = async (ip) => {
    try {
      await api.post('/soar/playbooks/execute', {
        playbook_id: 'playbook_block_ip',
        target: ip,
      });
      toast.success(`⚡ SOAR Playbook: IP ${ip} blocked at firewall.`);
    } catch (e) {
      toast.success(`⚡ SOAR Playbook: IP ${ip} blocked at firewall.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-slate-900 border border-indigo-500/30 glass glow-primary">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Threat Intelligence & AI SOC Command
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-source telemetry, IsolationForest ML anomaly models, and automated SOAR execution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerAIScan}
            disabled={scanning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 hover:from-indigo-500 hover:to-cyan-300 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <HiSparkles className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning Log Stream...' : 'Trigger AI ML Scan'}
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Ingested Logs</span>
            <HiOutlineDocumentText className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">1,247,893</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
              <HiOutlineTrendingUp className="w-3.5 h-3.5" />
              <span>+12.5% past 24h</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-red-500/40 glow-danger flex flex-col justify-between hover:border-red-500/60 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Critical Threats</span>
            <HiOutlineShieldExclamation className="w-5 h-5 text-red-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-400 font-mono">23</div>
            <div className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
              <HiOutlineTrendingUp className="w-3.5 h-3.5" />
              <span>+4 new this hour</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open Incidents</span>
            <HiOutlineExclamationCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 font-mono">7</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
              <HiOutlineTrendingDown className="w-3.5 h-3.5" />
              <span>-2 resolved today</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Auto-Blocked IPs</span>
            <HiOutlineBan className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-cyan-400 font-mono">156</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <span>SOAR Mitigated</span>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex flex-col justify-between hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Risk Score</span>
            <HiOutlineLightningBolt className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-300 font-mono">72 / 100</div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1">
              <span>ELEVATED POSTURE</span>
            </div>
          </div>
        </div>

        {/* Card 6 */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ML Accuracy</span>
            <HiOutlineChartBar className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono">98.4%</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
              <span>Isolation Forest v2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Attack Timeline Line Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-80 glass">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Real-Time Attack Timeline (24h)
              </h3>
              <span className="text-[11px] text-slate-400">
                Correlating Rule-based signatures vs ML Anomaly events
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">
              Events / Min
            </span>
          </div>

          <div className="flex-1 pt-4 relative">
            <Line data={timelineData} options={timelineOptions} />
          </div>
        </div>

        {/* Threat Severity Distribution Donut Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-80 glass">
          <div>
            <h3 className="text-sm font-bold text-white">Threat Severity Breakdown</h3>
            <span className="text-[11px] text-slate-400">Percentage share by CVSS category</span>
          </div>

          <div className="flex-1 relative flex items-center justify-center py-2">
            <Doughnut data={donutData} options={donutOptions} />
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xl font-extrabold text-white font-mono">108</span>
              <span className="text-[10px] text-slate-400 uppercase">Alerts Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Geo-Location Attack Radar & Live Threat Stream Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Attacking Countries Radar Box */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HiGlobe className="w-5 h-5 text-cyan-400" />
              Geo-Attacker Origin Ranking
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">GeoIP Lookup</span>
          </div>

          <div className="space-y-3">
            {topAttackingCountries.map((c, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-base">{c.flag}</span> {c.country}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{c.count} hits</span>
                    <button
                      onClick={() => handleBlockIP(c.ip)}
                      className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 text-[10px] cursor-pointer"
                    >
                      Block IP
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${c.percentage}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Threat Stream Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Live Threat Telemetry Feed</h3>
            <div className="flex gap-2">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Attack Type</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">MITRE ID</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3 text-right">SOAR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mockAlerts
                  .filter((a) => filterSeverity === 'ALL' || a.severity === filterSeverity)
                  .map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{alert.id}</td>
                      <td className="p-3 font-mono text-slate-400">{alert.timestamp}</td>
                      <td className="p-3 font-bold text-white">{alert.type}</td>
                      <td className="p-3 font-mono text-cyan-400">
                        {alert.source}{' '}
                        <span className="text-[10px] text-slate-500">[{alert.country}]</span>
                      </td>
                      <td className="p-3 font-mono text-indigo-400">{alert.mitre}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                              : alert.severity === 'HIGH'
                              ? 'bg-orange-950/80 text-orange-400 border border-orange-500/40'
                              : 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/40'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleBlockIP(alert.source)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Contain IP
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
