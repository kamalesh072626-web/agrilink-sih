import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Truck,
  Warehouse,
  IndianRupee,
  Award,
  ArrowLeft,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Scale,
  Receipt,
  ChevronDown,
  Minus
} from 'lucide-react';

export default function MarketIntelligence() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // User input controls
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState(20);
  const [storageDays, setStorageDays] = useState(3);

  // Fetch market intelligence from Flask API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5000/api/market-intelligence?storage_days=${storageDays}&quantity_quintals=${quantity}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const json = await response.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || 'Failed to fetch');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storageDays, quantity]);

  const markets = data?.markets || [];
  const summary = data?.summary || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      
      {/* Sticky Header */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/farmer')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Market Intelligence Engine
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Full comparative breakdown with APMC Cess, Transport & Storage deductions
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Input Controls Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
            <Scale className="w-4 h-4" />
            Configure Analysis Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Crop</label>
              <div className="relative">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                >
                  <option value="Tomato">🍅 Tomato (Nashik Region)</option>
                  <option value="Onion">🧅 Onion</option>
                  <option value="Grapes">🍇 Grapes</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Quantity (Quintals)
                <span className="text-slate-500 font-normal ml-1">= {quantity * 100} kg</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
              />
            </div>

            {/* Storage Days Slider */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Storage Duration
                <span className="text-emerald-400 font-bold ml-1">{storageDays} {storageDays === 1 ? 'day' : 'days'}</span>
              </label>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={storageDays}
                onChange={(e) => setStorageDays(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5">
                <span>0d</span>
                <span>3d</span>
                <span>7d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Realisation Formula Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 border border-emerald-800/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            Complete Net Farmer Realisation Formula
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[120px]">
              <div className="text-[10px] uppercase text-slate-400 font-sans font-semibold mb-1">Gross Value</div>
              <div className="font-bold text-sm text-white">Mandi Base Price</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">₹/quintal</div>
            </div>

            <Minus className="w-5 h-5 text-rose-400 shrink-0" />

            <div className="px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-center min-w-[120px]">
              <div className="text-[10px] uppercase text-rose-400 font-sans font-semibold mb-1">
                <Truck className="w-3 h-3 inline mr-1" />Logistics
              </div>
              <div className="font-bold text-sm text-rose-300">Transport Cost</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Distance × Rate</div>
            </div>

            <Minus className="w-5 h-5 text-amber-400 shrink-0" />

            <div className="px-4 py-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center min-w-[120px]">
              <div className="text-[10px] uppercase text-amber-400 font-sans font-semibold mb-1">
                <Warehouse className="w-3 h-3 inline mr-1" />Warehousing
              </div>
              <div className="font-bold text-sm text-amber-300">Storage Cost</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">{storageDays}d × Rate/day</div>
            </div>

            <Minus className="w-5 h-5 text-violet-400 shrink-0" />

            <div className="px-4 py-3 rounded-xl bg-violet-950/40 border border-violet-800/40 text-center min-w-[120px]">
              <div className="text-[10px] uppercase text-violet-400 font-sans font-semibold mb-1">
                <Receipt className="w-3 h-3 inline mr-1" />APMC Cess
              </div>
              <div className="font-bold text-sm text-violet-300">Mandi Fee</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">1% of Gross</div>
            </div>

            <span className="text-slate-500 font-bold text-xl">=</span>

            <div className="px-4 py-3 rounded-xl bg-emerald-950/60 border-2 border-emerald-500/60 text-center min-w-[140px] shadow-lg shadow-emerald-950/30">
              <div className="text-[10px] uppercase text-emerald-400 font-sans font-semibold mb-1">
                <Award className="w-3 h-3 inline mr-1" />Pocket Money
              </div>
              <div className="font-bold text-sm text-emerald-200">NET REALISATION</div>
              <div className="text-[10px] text-emerald-400/80 font-sans mt-0.5">Actual Farmer Income</div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}. Ensure <code className="bg-rose-900/50 px-1 py-0.5 rounded font-mono">python app.py</code> is running.</span>
          </div>
        )}

        {/* Summary KPI Bar */}
        {!loading && data && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5" /> Best Market
              </div>
              <div className="text-lg font-extrabold text-white">{summary.best_market}</div>
              <div className="text-xs text-slate-400">Net: ₹{summary.best_net_per_quintal}/q</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-teal-400 flex items-center gap-1 mb-1">
                <IndianRupee className="w-3.5 h-3.5" /> Batch Potential
              </div>
              <div className="text-lg font-extrabold text-teal-300">
                ₹{Number(summary.best_batch_net || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400">{quantity} quintals × best net</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> Net Spread
              </div>
              <div className="text-lg font-extrabold text-amber-400">
                ₹{summary.net_difference_per_quintal}/q
              </div>
              <div className="text-xs text-slate-400">Best vs worst market gap</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Receipt className="w-3.5 h-3.5" /> APMC Cess Applied
              </div>
              <div className="text-lg font-extrabold text-slate-200">
                {summary.mandi_cess_rate_percent}%
              </div>
              <div className="text-xs text-slate-400">Maharashtra APMC standard</div>
            </div>
          </div>
        )}

        {/* Market Comparison Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">APMC Market Net Realisation Comparison</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranked by actual farmer income after all deductions • {quantity} quintals • {storageDays}-day storage
              </p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sorted: <strong className="text-emerald-400">Net Realisation ↓</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4"># Market</th>
                  <th className="py-3.5 px-4">Distance</th>
                  <th className="py-3.5 px-4">Gross Rate</th>
                  <th className="py-3.5 px-4 text-rose-400">Transport</th>
                  <th className="py-3.5 px-4 text-amber-400">Storage ({storageDays}d)</th>
                  <th className="py-3.5 px-4 text-violet-400">Mandi Cess</th>
                  <th className="py-3.5 px-4">Total Deductions</th>
                  <th className="py-3.5 px-4 bg-emerald-950/30 text-emerald-400">Net Realisation</th>
                  <th className="py-3.5 px-4">Batch Total ({quantity}q)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {markets.map((m, idx) => {
                  const isRecommended = m.ai_recommended;

                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${
                        isRecommended
                          ? 'bg-emerald-950/25 hover:bg-emerald-950/35'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Rank & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isRecommended
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            #{m.rank}
                          </span>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                              {m.name}
                              {isRecommended && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">
                                  <ShieldCheck className="w-3 h-3" /> AI Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" /> {m.location}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Distance */}
                      <td className="py-4 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-500" />
                          {m.distance_km} km
                        </div>
                      </td>

                      {/* Gross Rate */}
                      <td className="py-4 px-4 font-mono font-semibold text-slate-200">
                        ₹{m.gross_price_per_quintal.toFixed(0)}/q
                      </td>

                      {/* Transport Cost */}
                      <td className="py-4 px-4 font-mono text-rose-300">
                        -₹{m.transport_cost_per_quintal.toFixed(1)}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {m.distance_km}km × ₹{m.transport_rate_per_km}
                        </span>
                      </td>

                      {/* Storage Cost */}
                      <td className="py-4 px-4 font-mono text-amber-300">
                        -₹{m.storage_cost_per_quintal.toFixed(1)}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {storageDays}d × ₹{m.storage_rate_per_day}
                        </span>
                      </td>

                      {/* Mandi Cess */}
                      <td className="py-4 px-4 font-mono text-violet-300">
                        -₹{m.mandi_fee_per_quintal.toFixed(1)}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          1% of ₹{m.gross_price_per_quintal}
                        </span>
                      </td>

                      {/* Total Deductions */}
                      <td className="py-4 px-4 font-mono text-rose-400 font-semibold">
                        -₹{m.total_deductions_per_quintal.toFixed(1)}
                      </td>

                      {/* Net Realisation */}
                      <td className={`py-4 px-4 font-mono ${isRecommended ? 'bg-emerald-950/20' : ''}`}>
                        <div className={`text-base font-extrabold ${isRecommended ? 'text-emerald-300' : 'text-slate-200'}`}>
                          ₹{m.net_realisation_per_quintal.toFixed(1)}/q
                        </div>
                        <div className="text-[10px] text-emerald-400/80 font-sans">
                          {isRecommended ? '★ Highest Net' : 'per quintal'}
                        </div>
                      </td>

                      {/* Batch Total */}
                      <td className="py-4 px-4 font-mono font-bold text-teal-300">
                        ₹{Number(m.batch_net.toFixed(0)).toLocaleString('en-IN')}
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {quantity}q total
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>All values in INR (₹). APMC cess at {summary.mandi_cess_rate_percent || 1}% of gross.</span>
            <span>Dynamic calculations powered by AgriLink AI Engine</span>
          </div>
        </div>

      </main>
    </div>
  );
}
