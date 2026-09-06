import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  FileText,
  MessageSquareText,
  LifeBuoy
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Grievances() {
  const { t } = useLanguage();
  
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [category, setCategory] = useState('Payment Delay');
  const [description, setDescription] = useState('');

  const fetchGrievances = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/grievances?farmer_id=1');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setGrievances(data.grievances);
      } else {
        throw new Error(data.error || 'Failed to fetch grievances');
      }
    } catch (err) {
      console.error('Error fetching grievances:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('http://localhost:5000/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: 1,
          category,
          description: description.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Grievance ticket created successfully!');
        setDescription('');
        fetchGrievances(); // Refresh list
      } else {
        throw new Error(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('Error submitting grievance:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('title.grievancePortal')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Report payment delays, quality disputes, or logistics issues for rapid APMC arbitration
            </p>
          </div>
        </div>

        <button
          onClick={fetchGrievances}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Accessible Grievance Submission Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-emerald-400" />
                Report an Issue / Dispute
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tickets are assigned directly to APMC Mandi Officers & AgriLink dispute resolution team.
              </p>
            </div>

            {/* Notification Banners */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Issue Category <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Payment Delay">💳 Payment Delay (Escrow / Bank transfer delayed)</option>
                  <option value="Quality Dispute">⚖️ Quality Dispute (Grade mismatch or unexpected deduction)</option>
                  <option value="Transport Issue">🚛 Transport Issue (Driver delay, vehicle damage)</option>
                  <option value="Other">❓ Other Mandi Dispute</option>
                </select>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Problem Description <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide transaction code, buyer name, or specific problem encountered..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-750 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('common.submit')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Submitted Grievances Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Submitted Tickets & History ({grievances.length})
              </h3>
              <span className="text-xs text-slate-400">Farmer A/c #1</span>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">{t('common.loading')}</p>
              </div>
            ) : grievances.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                No grievance tickets submitted yet. All transactions operating smoothly.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/60">
                    {grievances.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          #TKT-{1000 + g.id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {g.category}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={g.description}>
                          {g.description}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(g.status)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {g.created_at ? g.created_at.split(' ')[0] : 'Today'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
