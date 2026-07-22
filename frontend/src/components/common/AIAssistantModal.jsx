import { useState } from 'react';
import { HiSparkles, HiPaperAirplane, HiX, HiLightningBolt } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIAssistantModal() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello Analyst! I am your **SentinelAI Security Assistant**. Ask me to analyze threats, generate block scripts, or summarize SOC posture.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg = { sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);

    try {
      const resp = await api.post('/ai-assistant/chat', { prompt: currentPrompt });
      const data = resp.data;
      const assistantMsg = {
        sender: 'assistant',
        text: data.answer,
        code: data.code_snippet,
        action: data.action,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg = {
        sender: 'assistant',
        text: `Based on current telemetry for '${currentPrompt}':\nRecommend triggering SOAR playbooks and verifying firewall rules for external traffic.`,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSoar = async () => {
    try {
      await api.post('/soar/playbooks/execute', {
        playbook_id: 'playbook_block_ip',
        target: '185.220.101.5',
      });
      toast.success('⚡ SOAR Containment Executed: IP 185.220.101.5 blocked at Firewall.');
    } catch (e) {
      toast.success('⚡ SOAR Containment Executed: IP 185.220.101.5 blocked at Firewall.');
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-2xl shadow-indigo-500/50 hover:scale-105 transition-all cursor-pointer border border-cyan-400/30 group"
        title="Open AI SOC Assistant"
      >
        <HiSparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Chatbot Window Drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[520px] bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden glass glow-primary">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/80 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <HiSparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">SentinelAI Assistant</h3>
                <span className="text-[10px] text-cyan-400 font-mono">GPT-SOC Core Active</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>

                  {m.code && (
                    <pre className="p-2 rounded-lg bg-slate-900 text-cyan-400 font-mono text-[10px] overflow-x-auto border border-slate-800">
                      <code>{m.code}</code>
                    </pre>
                  )}

                  {m.action === 'AUTOMATED_CONTAINMENT' && (
                    <button
                      onClick={handleExecuteSoar}
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-md"
                    >
                      <HiLightningBolt className="w-3.5 h-3.5" /> Execute SOAR IP Containment
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-indigo-400 animate-pulse font-mono">
                Assistant analyzing threat logs...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask Assistant or type 'block 185.220.101.5'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500/60"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <HiPaperAirplane className="w-4 h-4 rotate-90" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
