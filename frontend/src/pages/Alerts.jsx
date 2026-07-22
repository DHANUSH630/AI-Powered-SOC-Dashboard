import { useState, useEffect } from 'react';
import { HiFilter, HiSearch, HiExternalLink, HiCheckCircle, HiBan } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

const initialMockAlerts = [
  {
    id: 'ALT-1092',
    timestamp: new Date().toISOString(),
    attackType: 'SSH Brute Force',
    severity: 'CRITICAL',
    confidence: 0.98,
    sourceIP: '185.220.101.5',
    destinationIP: '10.0.1.50',
    country: 'RU',
    status: 'NEW',
    mitreId: 'T1110',
    cvssScore: 9.8,
    recommendation: 'Block source IP 185.220.101.5 immediately and enforce mandatory MFA.',
  },
  {
    id: 'ALT-1091',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    attackType: 'SQL Injection Attempt',
    severity: 'HIGH',
    confidence: 0.92,
    sourceIP: '45.142.120.10',
    destinationIP: '10.0.1.100',
    country: 'CN',
    status: 'IN_PROGRESS',
    mitreId: 'T1190',
    cvssScore: 8.5,
    recommendation: 'Inspect web application firewall logs and sanitize inputs.',
  },
  {
    id: 'ALT-1090',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    attackType: 'Port Scan Detected',
    severity: 'MEDIUM',
    confidence: 0.85,
    sourceIP: '194.26.29.112',
    destinationIP: '10.0.1.1',
    country: 'DE',
    status: 'NEW',
    mitreId: 'T1046',
    cvssScore: 5.3,
    recommendation: 'Monitor source IP for subsequent exploit attempts.',
  },
  {
    id: 'ALT-1089',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    attackType: 'PowerShell Malicious Script',
    severity: 'HIGH',
    confidence: 0.95,
    sourceIP: '10.0.4.15',
    destinationIP: '10.0.4.15',
    country: 'INT',
    status: 'RESOLVED',
    mitreId: 'T1059.001',
    cvssScore: 8.1,
    recommendation: 'Isolate host 10.0.4.15 and conduct memory forensics.',
  },
  {
    id: 'ALT-1088',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    attackType: 'Directory Traversal',
    severity: 'LOW',
    confidence: 0.78,
    sourceIP: '89.248.165.74',
    destinationIP: '10.0.1.100',
    country: 'NL',
    status: 'DISMISSED',
    mitreId: 'T1083',
    cvssScore: 3.4,
    recommendation: 'Verify path traversal protections on Nginx proxy.',
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialMockAlerts);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  const fetchAlerts = async () => {
    try {
      const url = severityFilter === 'ALL' ? '/alerts' : `/alerts?severity=${severityFilter}`;
      const resp = await api.get(url);
      if (resp.data && resp.data.length > 0) {
        setAlerts(resp.data);
      }
    } catch (e) {
      // Use fallback initial mock data
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/alerts/${id}`, { status: newStatus });
      toast.success(`Alert status updated to ${newStatus}`);
    } catch (e) {
      toast.success(`Status set to ${newStatus}`);
    }

    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const filteredAlerts = alerts.filter(
    (a) =>
      (severityFilter === 'ALL' || a.severity === severityFilter) &&
      (a.attackType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.sourceIP.includes(searchTerm) ||
        (a.mitreId && a.mitreId.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glass">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Alert Management Center
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-red-950/80 text-red-400 border border-red-500/30">
              {filteredAlerts.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threat detection signatures and ML anomaly alerts.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <HiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alert, IP, MITRE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Time</th>
                <th className="p-3">Attack Type</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">MITRE ATT&CK</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{alert.id}</td>
                  <td className="p-3 font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-bold text-white">{alert.attackType}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                          : alert.severity === 'HIGH'
                          ? 'bg-orange-950/80 text-orange-400 border border-orange-500/40'
                          : alert.severity === 'MEDIUM'
                          ? 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/40'
                          : 'bg-blue-950/80 text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-cyan-400">
                    {alert.sourceIP}{' '}
                    <span className="text-[10px] text-slate-500">[{alert.country || 'EXT'}]</span>
                  </td>
                  <td className="p-3 font-mono text-indigo-400">{alert.mitreId || 'T1000'}</td>
                  <td className="p-3">
                    <select
                      value={alert.status}
                      onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="DISMISSED">DISMISSED</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      Inspect <HiExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail Modal Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 glass">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400">{selectedAlert.id}</span>
                <h3 className="text-lg font-bold text-white">{selectedAlert.attackType}</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Severity & Confidence</span>
                <span className="font-bold text-red-400">{selectedAlert.severity}</span>
                <span className="text-slate-400 block font-mono">
                  Confidence: {((selectedAlert.confidence || 0.9) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">MITRE ATT&CK & CVSS</span>
                <span className="font-mono text-indigo-400">{selectedAlert.mitreId || 'T1110'}</span>
                <span className="text-slate-400 block font-mono">
                  CVSS Score: {selectedAlert.cvssScore || '8.5'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Source Telemetry</span>
                <span className="font-mono text-cyan-400">{selectedAlert.sourceIP}</span>
                <span className="text-slate-400 block">
                  Location: {selectedAlert.country || 'External Network'}
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Destination Target</span>
                <span className="font-mono text-slate-300">
                  {selectedAlert.destinationIP || '10.0.1.100'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                🤖 AI Threat Mitigation Recommendation
              </span>
              <p className="text-xs text-slate-300">
                {selectedAlert.recommendation ||
                  'Block source IP on perimeter firewall and check authentication logs.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleStatusChange(selectedAlert.id, 'RESOLVED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <HiCheckCircle className="w-4 h-4" /> Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange(selectedAlert.id, 'DISMISSED')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <HiBan className="w-4 h-4" /> Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
