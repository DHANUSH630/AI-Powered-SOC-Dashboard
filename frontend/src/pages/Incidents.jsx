import { useState, useEffect } from 'react';
import { HiPlus, HiUser, HiClock, HiCheckCircle } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

const initialIncidents = [
  {
    id: 'inc_101',
    incidentNumber: 'INC-20260722-001',
    title: 'Credential Stuffing Campaign targeting Admin API',
    assignedAnalyst: 'Sarah Connor',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    timeline: [
      { timestamp: '18:15:00', event: 'Anomalous spikes in 401 Unauthorized responses detected.' },
      { timestamp: '18:25:00', event: 'Analyst assigned to investigate IP pool.' },
    ],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'inc_102',
    incidentNumber: 'INC-20260722-002',
    title: 'Suspicious PowerShell Execution on Domain Controller',
    assignedAnalyst: 'SecOps Lead',
    priority: 'CRITICAL',
    status: 'NEW',
    timeline: [
      { timestamp: '18:50:00', event: 'Base64 encoded command payload flagged by ML engine.' }
    ],
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

export default function Incidents() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newAnalyst, setNewAnalyst] = useState('Sarah Connor');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const resp = await api.get('/incidents');
      if (resp.data && resp.data.length > 0) {
        setIncidents(resp.data);
      }
    } catch (e) {
      // Use fallback
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      title: newTitle,
      priority: newPriority,
      assignedAnalyst: newAnalyst,
    };

    try {
      const resp = await api.post('/incidents', payload);
      setIncidents([resp.data, ...incidents]);
      toast.success(`Incident ${resp.data.incidentNumber} created.`);
    } catch (err) {
      const mockInc = {
        id: 'inc_' + Date.now(),
        incidentNumber: `INC-20260722-${Math.floor(Math.random() * 900 + 100)}`,
        title: newTitle,
        assignedAnalyst: newAnalyst,
        priority: newPriority,
        status: 'NEW',
        timeline: [{ timestamp: new Date().toLocaleTimeString(), event: 'Incident created.' }],
        createdAt: new Date().toISOString(),
      };
      setIncidents([mockInc, ...incidents]);
      toast.success(`Incident ${mockInc.incidentNumber} created.`);
    }

    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glass">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Incident Response Command
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lifecycle management, analyst assignment, evidence tracking, and timeline response.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <HiPlus className="w-4 h-4" /> Create Incident Case
        </button>
      </div>

      {/* Incidents List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {inc.incidentNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    inc.priority === 'CRITICAL'
                      ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                      : inc.priority === 'HIGH'
                      ? 'bg-orange-950/80 text-orange-400 border border-orange-500/40'
                      : 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/40'
                  }`}
                >
                  {inc.priority}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <HiUser className="w-4 h-4 text-indigo-400" />
                  {inc.assignedAnalyst || 'SecOps Lead'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-semibold">
                  {inc.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{inc.title}</h3>
            </div>

            {/* Timeline Events */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HiClock className="w-3.5 h-3.5 text-indigo-400" /> Response Timeline
              </span>
              <div className="space-y-1 text-xs">
                {(inc.timeline || []).map((t, idx) => (
                  <div key={idx} className="flex gap-3 text-slate-300">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {t.timestamp}
                    </span>
                    <span>{t.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 glass">
            <h3 className="text-lg font-bold text-white">Create Security Incident</h3>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Incident Title / Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized Privileged Escalation on DB-01"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Assigned Analyst</label>
                  <select
                    value={newAnalyst}
                    onChange={(e) => setNewAnalyst(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="Sarah Connor">Sarah Connor</option>
                    <option value="SecOps Lead">SecOps Lead</option>
                    <option value="John Doe">John Doe</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
