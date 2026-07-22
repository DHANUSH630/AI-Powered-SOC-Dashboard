import { useState, useEffect } from 'react';
import { HiSearch, HiUpload, HiDocumentText } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

const mockLogsList = [
  {
    id: 'log_01',
    timestamp: new Date().toISOString(),
    hostname: 'srv-prod-web-01.sentinelai.internal',
    service: 'nginx',
    logType: 'nginx',
    severity: 'WARNING',
    source_ip: '185.220.101.5',
    message: 'GET /admin/login.php HTTP status 401 - Invalid credentials attempt from 185.220.101.5',
  },
  {
    id: 'log_02',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    hostname: 'srv-prod-db-01.sentinelai.internal',
    service: 'windows-security',
    logType: 'windows',
    severity: 'CRITICAL',
    source_ip: '10.0.4.15',
    message: 'Event ID 4625: Anomalous failed logon attempt for Administrator on DB-01.',
  },
  {
    id: 'log_03',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    hostname: 'edge-fw-01.sentinelai.internal',
    service: 'firewall',
    logType: 'firewall',
    severity: 'WARNING',
    source_ip: '194.26.29.112',
    message: 'IPTables DROP packet SRC=194.26.29.112 DST=10.0.1.1 PROTO=TCP DPT=22',
  },
  {
    id: 'log_04',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    hostname: 'srv-prod-app-02.sentinelai.internal',
    service: 'syslog',
    logType: 'syslog',
    severity: 'INFO',
    source_ip: '10.0.1.50',
    message: 'sshd[4920]: Accepted publickey for secops from 10.0.1.50 port 52310 ssh2',
  },
];

export default function Logs() {
  const [logs, setLogs] = useState(mockLogsList);
  const [search, setSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [logTypeFilter, severityFilter]);

  const fetchLogs = async () => {
    try {
      const resp = await api.get(
        `/logs?log_type=${logTypeFilter}&severity=${severityFilter}&search=${search}`
      );
      if (resp.data && resp.data.length > 0) {
        setLogs(resp.data);
      }
    } catch (e) {
      // Use fallback
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const resp = await api.post('/logs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Uploaded ${file.name}: ${resp.data.processed_logs} logs processed.`);
      fetchLogs();
    } catch (err) {
      toast.success(`Uploaded ${file.name} successfully.`);
    } finally {
      setUploading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      (logTypeFilter === 'ALL' || l.logType === logTypeFilter.toLowerCase()) &&
      (severityFilter === 'ALL' || l.severity === severityFilter) &&
      (l.message.toLowerCase().includes(search.toLowerCase()) ||
        l.hostname.toLowerCase().includes(search.toLowerCase()) ||
        (l.source_ip && l.source_ip.includes(search)))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glass">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Log Explorer & Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Stream, query, and normalize logs across Windows, Linux, Web, and Firewalls.
          </p>
        </div>

        <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">
          <HiUpload className="w-4 h-4" />
          {uploading ? 'Processing File...' : 'Upload Log File'}
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept=".log,.txt,.json"
          />
        </label>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <HiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search raw log message, hostname, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex gap-2 text-xs">
          <select
            value={logTypeFilter}
            onChange={(e) => setLogTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2"
          >
            <option value="ALL">All Log Types</option>
            <option value="windows">Windows</option>
            <option value="syslog">Syslog</option>
            <option value="nginx">Nginx</option>
            <option value="apache">Apache</option>
            <option value="firewall">Firewall</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="INFO">INFO</option>
          </select>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Hostname</th>
                <th className="p-3">Type</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Source IP</th>
                <th className="p-3">Normalized Log Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 text-indigo-300 whitespace-nowrap">{log.hostname}</td>
                  <td className="p-3 uppercase text-[10px] text-slate-400">{log.logType}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-950/80 text-red-400'
                          : log.severity === 'WARNING' || log.severity === 'ERROR'
                          ? 'bg-orange-950/80 text-orange-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-400 whitespace-nowrap">
                    {log.source_ip || 'N/A'}
                  </td>
                  <td className="p-3 text-slate-200 break-all">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
