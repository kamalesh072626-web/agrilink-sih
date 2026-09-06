import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Building2,
  Truck,
  Star,
  CreditCard,
  Award,
  AlertTriangle,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Layers
} from 'lucide-react';

export default function BuyerMatching() {
  const navigate = useNavigate();

  // Configuration state — mirrors the farmer's current lot profile
  const [qualityGrade, setQualityGrade] = useState('A');
  const [expectedPrice, setExpectedPrice] = useState(2700);
  const [sortBy, setSortBy] = useState('match_score');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch verified buyers from the Match Score API
  const fetchBuyers = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5000/api/buyers?quality_grade=${qualityGrade}&expected_price=${expectedPrice}&sort_by=${sortBy}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setBuyers(json.buyers);
        setTotalCount(json.count);
      } else {
        throw new Error(json.error || 'Failed to fetch buyers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [qualityGrade, expectedPrice, sortBy]);

  // Helper to pick color theme by Match Score band
  const getScoreColor = (score) => {
    if (score >= 75) return { ring: 'ring-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500', bar: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (score >= 55) return { ring: 'ring-amber-500', text: 'text-amber-400', bg: 'bg-amber-500', bar: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { ring: 'ring-rose-500', text: 'text-rose-400', bg: 'bg-rose-500', bar: 'bg-rose-500', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">

      {/* Header */}
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
                Verified Buyer Matching
                <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Phase 3
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-ranked by 4-factor Match Score (Price · Distance · Quality · Trust)
              </p>
            </div>
          </div>

          <button
            onClick={fetchBuyers}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Filter / Config Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Configure Your Lot Profile for Matching
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Lot Quality Grade</label>
              <div className="flex gap-2">
                {['A', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setQualityGrade(g)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      qualityGrade === g
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Your Expected Price <span className="text-emerald-400 font-bold">₹{expectedPrice}/q</span>
              </label>
              <input
                type="range"
                min={1800}
                max={3200}
                step={50}
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹1,800</span><span>₹3,200</span>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Sort Buyers By</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: 'match_score',     label: 'Match Score' },
                  { val: 'offered_price',   label: 'Highest Price' },
                  { val: 'trust_score',     label: 'Trust' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setSortBy(opt.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      sortBy === opt.val
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Score Algorithm Legend */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-center gap-6 text-[11px] text-slate-400">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" /> Match Score Formula:
          </span>
          <span className="font-medium text-slate-300">Price Compatibility <span className="text-emerald-400 font-bold">40 pts</span></span>
          <span>+</span>
          <span className="font-medium text-slate-300">Distance <span className="text-teal-400 font-bold">30 pts</span></span>
          <span>+</span>
          <span className="font-medium text-slate-300">Quality Match <span className="text-amber-400 font-bold">10 pts</span></span>
          <span>+</span>
          <span className="font-medium text-slate-300">Trust &amp; Reliability <span className="text-violet-400 font-bold">20 pts</span></span>
          <span>=</span>
          <span className="font-bold text-white">100 pts max</span>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            {error}. Ensure <code className="bg-rose-900/50 px-1 py-0.5 rounded font-mono">python app.py</code> is running.
          </div>
        )}

        {/* Results Header */}
        {!loading && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-white">{totalCount}</strong> verified buyers for Grade‑{qualityGrade} Tomato
              at expected ₹{expectedPrice}/q
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sorted by: <strong className="text-emerald-400 ml-1">{sortBy.replace('_', ' ')}</strong>
            </span>
          </div>
        )}

        {/* Buyer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {buyers.map((b) => {
            const colors = getScoreColor(b.match_score);
            const isTopPick = b.rank === 1;
            const grades = b.accepted_quality_grades.split(',').map(g => g.trim());
            const qualityMatched = grades.includes(qualityGrade);

            return (
              <div
                key={b.id}
                className={`bg-slate-950 rounded-2xl border transition-all flex flex-col ${
                  isTopPick
                    ? `border-emerald-500 ring-1 ring-emerald-500/30 shadow-xl shadow-emerald-950/40`
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-800/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initial */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                        isTopPick ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {b.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                          {b.name}
                          {b.verified_buyer && (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Buyer" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0" /> {b.buyer_type}
                        </div>
                      </div>
                    </div>

                    {/* Rank badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isTopPick ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{b.rank}
                    </span>
                  </div>

                  {/* Match Score Large Indicator */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Match Score</span>
                      <span className={`text-lg font-extrabold ${colors.text}`}>
                        {b.match_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                        style={{ width: `${b.match_score}%` }}
                      />
                    </div>
                    {/* Score Breakdown Chips */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        Price {b.match_breakdown.price_score}pt
                      </span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full">
                        Dist {b.match_breakdown.distance_score}pt
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        qualityMatched ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        Quality {b.match_breakdown.quality_score}pt
                      </span>
                      <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full">
                        Trust {b.match_breakdown.trust_score_pts}pt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body — Key Details */}
                <div className="p-5 space-y-3 flex-1">
                  {/* Offer Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Offer Price
                    </span>
                    <span className="font-mono font-extrabold text-base text-white">
                      ₹{b.offered_price.toLocaleString('en-IN')}/q
                    </span>
                  </div>

                  {/* Net Realisation */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Net Realisation</span>
                    <span className="font-mono font-bold text-emerald-300">
                      ₹{b.net_realisation_per_quintal.toFixed(1)}/q
                    </span>
                  </div>

                  {/* Distance */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-500" /> Distance
                    </span>
                    <span className="font-mono text-sm text-slate-200">
                      {b.market.distance_km} km · {b.market.name}
                    </span>
                  </div>

                  {/* Payment Reliability */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Payment Reliability
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${b.payment_reliability_pct >= 90 ? 'bg-emerald-500' : b.payment_reliability_pct >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${b.payment_reliability_pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm font-semibold text-slate-200">
                        {b.payment_reliability_pct}%
                      </span>
                    </div>
                  </div>

                  {/* Trust Score Stars */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Trust Score</span>
                    <span className="text-sm font-semibold text-amber-400">
                      {'★'.repeat(Math.round(b.trust_score))}{'☆'.repeat(5 - Math.round(b.trust_score))} {b.trust_score}/5
                    </span>
                  </div>

                  {/* Quality Grades Accepted */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Accepts Quality</span>
                    <div className="flex gap-1">
                      {['A', 'B', 'C'].map((g) => (
                        <span
                          key={g}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            grades.includes(g)
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-800">
                    <span className="text-slate-500">Payment: </span>{b.payment_terms}
                  </div>
                </div>

                {/* Card Footer — CTA Buttons */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate('/offers')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      isTopPick
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    View Offer
                  </button>
                  <button
                    onClick={() => navigate('/create-lot')}
                    className="py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
                  >
                    Create Lot
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
