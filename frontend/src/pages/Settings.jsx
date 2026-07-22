import { useState } from 'react';
import { HiCog, HiSave, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Settings() {
  const [slackUrl, setSlackUrl] = useState('');
  const [virusTotalKey, setVirusTotalKey] = useState('vt_api_key_hidden_****');
  const [abuseIpKey, setAbuseIpKey] = useState('abuse_ip_key_hidden_****');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System configuration saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between glass">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            System Settings & Webhook Integrations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure external API keys, notification webhooks, and log retention parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Webhook Notifications Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🔔 Notification Webhook Dispatchers
          </h3>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Slack Webhook URL</label>
            <input
              type="text"
              placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500/60"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              High & Critical alerts will automatically trigger formatted Slack channel alerts.
            </span>
          </div>
        </div>

        {/* Threat Intelligence API Keys */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🔑 Threat Intelligence API Keys
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">VirusTotal API Key</label>
              <input
                type="password"
                value={virusTotalKey}
                onChange={(e) => setVirusTotalKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">AbuseIPDB API Key</label>
              <input
                type="password"
                value={abuseIpKey}
                onChange={(e) => setAbuseIpKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🖥️ System Health & Cluster Status
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">FastAPI Server</span>
              <span className="text-emerald-400 font-bold font-mono">ONLINE (8000)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">MongoDB Cluster</span>
              <span className="text-emerald-400 font-bold font-mono">CONNECTED</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Redis Cache</span>
              <span className="text-emerald-400 font-bold font-mono">HEALTHY</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <HiSave className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
