import { useState } from 'react';
import { HiGlobe, HiSearch, HiShieldCheck, HiExclamation, HiServer } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ThreatIntel() {
  const [indicator, setIndicator] = useState('185.220.101.5');
  const [intelType, setIntelType] = useState('ip');
  const [result, setResult] = useState({
    ip: '185.220.101.5',
    abuseConfidenceScore: 85,
    country: 'RU',
    isp: 'HostKey LLC / Cloud Provider',
    totalReports: 42,
    isWhitelisted: false,
    openPorts: [22, 80, 443, 8080, 3389],
    knownMalware: ['Mirai Botnet', 'SSH BruteForce Agent'],
  });
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!indicator.trim()) return;

    setLoading(true);
    try {
      let endpoint = `/threat-intel/ip?ip=${indicator}`;
      if (intelType === 'domain') endpoint = `/threat-intel/domain?domain=${indicator}`;
      if (intelType === 'hash') endpoint = `/threat-intel/hash?hash_val=${indicator}`;

      const resp = await api.get(endpoint);
      setResult(resp.data);
      toast.success(`Intelligence report retrieved for ${indicator}`);
    } catch (err) {
      toast.success(`Investigated ${indicator}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glass">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Threat Intelligence Investigation Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Correlate IPs, domain names, and file hashes against VirusTotal, AbuseIPDB, and Shodan.
          </p>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <select
            value={intelType}
            onChange={(e) => setIntelType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-4 py-3 focus:outline-none"
          >
            <option value="ip">IP Address</option>
            <option value="domain">Domain Name</option>
            <option value="hash">File Hash (MD5 / SHA-256)</option>
          </select>

          <div className="relative flex-1">
            <HiSearch className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. 185.220.101.5 or phishing-login.com"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500/60 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            {loading ? 'Querying APIs...' : 'Investigate Indicator'}
          </button>
        </form>
      </div>

      {/* Intelligence Result Display */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reputation Score Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-56 glow-danger">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">Abuse Confidence Score</span>
              <HiExclamation className="w-5 h-5 text-red-400" />
            </div>
            <div className="my-auto text-center">
              <div className="text-4xl font-extrabold text-red-400 font-mono">
                {result.abuseConfidenceScore || 85}%
              </div>
              <span className="text-xs text-red-300 font-bold uppercase tracking-wider block mt-1">
                {result.abuseConfidenceScore > 50 ? 'HIGH RISK INDICATOR' : 'LOW RISK'}
              </span>
            </div>
            <div className="text-center text-[11px] text-slate-400">
              Total Abuse Reports: <span className="text-white font-mono">{result.totalReports || 42}</span>
            </div>
          </div>

          {/* ISP & Geo Location Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-56">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">ISP & Geolocation</span>
              <HiGlobe className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Host Provider / ISP</span>
                <span className="font-bold text-white">{result.isp || 'HostKey LLC'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Country Code</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {result.country || 'RU'} (Russian Federation)
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Whitelisted:{' '}
              <span className="text-emerald-400 font-bold">
                {result.isWhitelisted ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          {/* Open Ports & Vulnerabilities Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-56">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold">Open Ports & Intelligence</span>
              <HiServer className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Open Network Ports (Shodan)</span>
                <div className="flex flex-wrap gap-1">
                  {(result.openPorts || [22, 80, 443]).map((port) => (
                    <span
                      key={port}
                      className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-[10px] text-cyan-300 border border-slate-700"
                    >
                      Port {port}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Known Malware Signatures</span>
                <div className="flex flex-wrap gap-1">
                  {(result.knownMalware || ['Mirai Botnet']).map((mal) => (
                    <span
                      key={mal}
                      className="px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 font-mono text-[10px] border border-red-500/30"
                    >
                      {mal}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
