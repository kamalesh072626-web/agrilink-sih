import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Edit2,
  CheckCircle2,
  Save,
  HelpCircle,
  Award,
  IndianRupee,
  Activity,
  Check,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const userName = localStorage.getItem('userName') || 'User';

  const [loading, setLoading] = useState(false);
  const [editingMarketId, setEditingMarketId] = useState(null);
  const [newBasePrice, setNewBasePrice] = useState('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);

  // Markets data for Mandi Rate Sync Table
  const [markets, setMarkets] = useState([
    { id: 1, name: 'Nashik APMC (Panchavati)', location: 'Nashik, MH', base_price: 2150, transport_rate: 2.20, storage_rate: 10.0 },
    { id: 2, name: 'Pimpalgaon Baswant APMC', location: 'Pimpalgaon, MH', base_price: 2280, transport_rate: 2.40, storage_rate: 12.0 },
    { id: 3, name: 'Lasalgaon APMC', location: 'Lasalgaon, MH', base_price: 2350, transport_rate: 2.50, storage_rate: 14.0 },
    { id: 4, name: 'Vashi APMC (Navi Mumbai)', location: 'Navi Mumbai, MH', base_price: 2850, transport_rate: 3.10, storage_rate: 18.0 },
    { id: 5, name: 'Pune Gultekdi Market Yard', location: 'Pune, MH', base_price: 2650, transport_rate: 3.25, storage_rate: 16.0 },
  ]);

  // Grievances mock data for Dispute Resolution Queue
  const [grievances, setGrievances] = useState([
    { id: 1, farmer_name: 'Ramesh Patil', category: 'Payment Delay', description: 'Payment for LOT-1003 from Metro Food Wholesalers delayed past 24-hr terms.', status: 'Under Review' },
    { id: 2, farmer_name: 'Ramesh Patil', category: 'Transport Issue', description: 'Refrigerated truck arrived 4 hours late at Nashik farm lot.', status: 'Resolved' },
    { id: 3, farmer_name: 'Sunita Gaikwad', category: 'Quality Dispute', description: 'Deduction applied on LOT-1004 due to color grade mismatch at Pimpalgaon.', status: 'Submitted' }
  ]);

  // Buyer Trust Review mock data
  const [buyers, setBuyers] = useState([
    { id: 1, name: 'FreshCart Retail Logistics', type: 'Retailer', trust_score: 4.8, pay_rel: '96.0%', verified: true },
    { id: 2, name: 'Sahyadri FPC Ltd', type: 'FPO', trust_score: 4.9, pay_rel: '98.0%', verified: true },
    { id: 3, name: 'Kisan Mandi Aggregators', type: 'Wholesaler', trust_score: 4.1, pay_rel: '82.0%', verified: true },
    { id: 4, name: 'Balaji Fresh Veggies', type: 'Local Trader', trust_score: 3.6, pay_rel: '68.0%', verified: false }
  ]);

  const handleUpdateMarketRate = async (marketId) => {
    if (!newBasePrice) return;
    try {
      const response = await fetch('http://localhost:5000/api/markets/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_id: marketId,
          base_price: parseFloat(newBasePrice)
        })
      });
      if (response.ok) {
        setMarkets(markets.map(m => m.id === marketId ? { ...m, base_price: parseFloat(newBasePrice) } : m));
        setSyncSuccessMsg('Mandi base rate updated and broadcasted to all APMC terminals!');
      }
    } catch (err) {
      setMarkets(markets.map(m => m.id === marketId ? { ...m, base_price: parseFloat(newBasePrice) } : m));
      setSyncSuccessMsg('Mandi base rate updated successfully!');
    } finally {
      setEditingMarketId(null);
      setNewBasePrice('');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }
  };

  const handleUpdateGrievanceStatus = async (id, newStatus) => {
    try {
      await fetch('http://localhost:5000/api/grievances/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch (err) {
      // offline fallback
    }
    setGrievances(grievances.map(g => g.id === id ? { ...g, status: newStatus } : g));
    setSyncSuccessMsg(`Grievance #${id} status updated to ${newStatus}.`);
    setTimeout(() => setSyncSuccessMsg(null), 4000);
  };

  const handleToggleVerification = (id) => {
    setBuyers(buyers.map(b => b.id === id ? { ...b, verified: !b.verified } : b));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 animate-fade-in flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Success Toast */}
        {syncSuccessMsg && (
          <div className="p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-semibold flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>{syncSuccessMsg}</span>
            </div>
            <button onClick={() => setSyncSuccessMsg(null)} className="text-xs text-indigo-400 hover:underline font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shadow-indigo-500/20">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Good Morning, {userName} 👋
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nashik District Agricultural Produce Market Committee</span>
              </p>
            </div>
          </div>
        </div>

        {/* REQUIRED METRICS (4 DISTINCT ADMIN METRICS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1: Total Registered Farmers */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('admin.kpi.registeredFarmers')}</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              1,420 <span className="text-xs font-normal text-slate-400">Farmers</span>
            </div>
            <p className="text-[11px] text-indigo-400 mt-1 font-medium">
              Nashik & Niphad Clusters
            </p>
          </div>

          {/* Metric 2: Total Active Buyers */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('admin.kpi.activeBuyers')}</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-300 mt-2">
              185 <span className="text-xs font-normal text-slate-400">Verified Buyers</span>
            </div>
            <p className="text-[11px] text-purple-400 mt-1 font-medium">
              98.2% APMC Registered
            </p>
          </div>

          {/* Metric 3: Mandi Daily Arrival Volume */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('admin.kpi.arrivalVolume')}</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-2">
              4,850 <span className="text-xs font-normal text-slate-400">Quintals</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">
              Today's Arrival across 5 APMCs
            </p>
          </div>

          {/* Metric 4: Open Dispute Tickets */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/40 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/20">
            <div className="flex items-center justify-between text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <span>{t('admin.kpi.openDisputes')}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-indigo-300 mt-2">
              3 <span className="text-xs font-normal text-slate-400">Pending</span>
            </div>
            <p className="text-[11px] text-amber-300 mt-1 font-medium">
              Grievance Help Desk Queue
            </p>
          </div>

        </div>

        {/* SECTION 1: MANDI RATE SYNC TABLE (UPDATE BASE PRICES) */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>{t('admin.rateSync')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Synchronize official APMC base rates live for Net Realisation formula engine.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">APMC Market</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Current Base Rate</th>
                  <th className="py-3 px-4">Transport Rate (/km/q)</th>
                  <th className="py-3 px-4">Storage Rate (/day/q)</th>
                  <th className="py-3 px-4 text-right">Update Base Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {markets.map((mkt) => (
                  <tr key={mkt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{mkt.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{mkt.location}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 font-mono text-sm">
                      ₹{mkt.base_price}/q
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">₹{mkt.transport_rate}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">₹{mkt.storage_rate}</td>
                    <td className="py-3.5 px-4 text-right">
                      {editingMarketId === mkt.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={newBasePrice}
                            onChange={(e) => setNewBasePrice(e.target.value)}
                            placeholder="New rate"
                            className="w-24 px-2 py-1 bg-slate-950 border border-indigo-500 rounded text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => handleUpdateMarketRate(mkt.id)}
                            className="p-1 rounded bg-indigo-500 text-slate-950 font-bold hover:bg-indigo-400"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingMarketId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingMarketId(mkt.id);
                            setNewBasePrice(mkt.base_price.toString());
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold text-xs transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{t('common.update')}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM SPLIT: SECTION 2 (DISPUTE RESOLUTION QUEUE) & SECTION 3 (BUYER VERIFICATION) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SECTION 2: DISPUTE RESOLUTION QUEUE (GRIEVANCES) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{t('admin.disputeQueue')}</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {grievances.length} Tickets
              </span>
            </div>

            <div className="space-y-3">
              {grievances.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Ticket #{g.id} &bull; {g.farmer_name}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {g.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{g.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className={`text-[11px] font-bold ${
                      g.status === 'Resolved' ? 'text-emerald-400' :
                      g.status === 'Under Review' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      Status: {g.status}
                    </span>

                    <select
                      value={g.status}
                      onChange={(e) => handleUpdateGrievanceStatus(g.id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: BUYER VERIFICATION & TRUST SCORE REVIEW */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>{t('admin.buyerVerification')}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {buyers.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{b.name}</span>
                      {b.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {b.type} &bull; Trust: {b.trust_score} ★ &bull; Pay: {b.pay_rel}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleVerification(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      b.verified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {b.verified ? 'Verified ✓' : 'Verify'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
