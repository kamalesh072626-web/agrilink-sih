import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tractor,
  TrendingUp,
  Truck,
  Warehouse,
  IndianRupee,
  Award,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Package,
  ExternalLink
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const userName = localStorage.getItem('userName') || 'User';

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [buyersList, setBuyersList] = useState([]);
  const [dealSuccessMsg, setDealSuccessMsg] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, buyersRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard?storage_days=1'),
        fetch('http://localhost:5000/api/buyers?storage_days=1')
      ]);

      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        if (dashJson.success) setDashboardData(dashJson);
      }
      if (buyersRes.ok) {
        const buyersJson = await buyersRes.json();
        if (buyersJson.success) setBuyersList(buyersJson.buyers || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLockDeal = (buyerName, netPrice) => {
    setDealSuccessMsg(`Deal linkage locked with ${buyerName} at ₹${netPrice}/q Net Realisation! E-Mandi pass generated.`);
    setTimeout(() => setDealSuccessMsg(null), 5000);
  };

  const kpis = dashboardData?.kpis;
  const farmer = dashboardData?.farmer || { name: 'Ramesh Patil', location: 'Nashik (Dindori Road), MH', crop: 'Tomato', quantity_quintals: 60 };
  const markets = dashboardData?.markets || [
    { name: 'Lasalgaon APMC', distance_km: 58, base_price: 2350, cost_breakdown: { transport_cost: 145, storage_cost: 14, net_realisation: 2191 } },
    { name: 'Pimpalgaon APMC', distance_km: 32, base_price: 2280, cost_breakdown: { transport_cost: 76.8, storage_cost: 12, net_realisation: 2191.2 } },
    { name: 'Nashik APMC', distance_km: 8, base_price: 2150, cost_breakdown: { transport_cost: 17.6, storage_cost: 10, net_realisation: 2122.4 } }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 animate-fade-in flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner Notification if deal locked */}
        {dealSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{dealSuccessMsg}</span>
            </div>
            <button onClick={() => navigate('/transactions')} className="text-xs bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg font-bold hover:bg-emerald-400">
              Track Transaction
            </button>
          </div>
        )}

        {/* Top Profile & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Good Morning, {userName} 👋
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{farmer.location} &bull; {farmer.crop} ({farmer.quantity_quintals} Quintals)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/create-lot')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('farmer.myLots')} & Digitization</span>
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* REQUIRED METRICS (4 DISTINCT METRICS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1: Current Mandi Price */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('farmer.kpi.currentMandiPrice')}</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              ₹{kpis?.gross_price ? kpis.gross_price.toLocaleString() : '2,350'}<span className="text-xs font-normal text-slate-400">/q</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Lasalgaon APMC Base Rate
            </p>
          </div>

          {/* Metric 2: Expected 7-Day Price */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('farmer.kpi.expectedPrice')}</span>
              <Award className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-teal-300 mt-2">
              ₹2,780<span className="text-xs font-normal text-slate-400">/q</span>
            </div>
            <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3 h-3" /> +18.2% AI Forecast Rise
            </p>
          </div>

          {/* Metric 3: Transport Deductions */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('farmer.kpi.transportDeductions')}</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-2">
              ₹{kpis?.transport_cost ? kpis.transport_cost.toLocaleString() : '145'}<span className="text-xs font-normal text-slate-400">/q</span>
            </div>
            <p className="text-[11px] text-amber-400 mt-1 font-medium">
              Freight cost at ₹2.50/km/q
            </p>
          </div>

          {/* Metric 4: Net Realisation */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/40 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/20">
            <div className="flex items-center justify-between text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span>{t('farmer.kpi.netRealisation')}</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2">
              ₹{kpis?.net_realisation ? kpis.net_realisation.toLocaleString() : '2,191'}<span className="text-xs font-normal text-emerald-200">/q</span>
            </div>
            <p className="text-[11px] text-emerald-300 mt-1 font-medium">
              Real Net Return in pocket
            </p>
          </div>

        </div>

        {/* SECTION 1: AI SELLING WINDOW RECOMMENDATION ("WAIT 3-5 DAYS") */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('farmer.aiRecommendation')}</span>
              </div>
              <h3 className="text-3xl font-black text-white flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-2xl tracking-wide shadow-lg">
                  {t('farmer.sellingWindow')}
                </span>
                <span className="text-sm font-semibold text-emerald-300">Confidence: 87%</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                AgriLink AI engine forecasts tomato mandi arrivals in Nashik region to peak and taper off in 4 days. Postponing sales by 3–5 days maximizes Net Farmer Realisation by an estimated +₹240/quintal.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/price-forecast')}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            >
              <span>View Full AI Price Forecast</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECTION 2: NEARBY MANDI COMPARISON TABLE */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{t('farmer.mandiTable')}</span>
            </h3>
            <button
              onClick={() => navigate('/market-intelligence')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Detailed Breakdown &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mandi Destination</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Gross Rate (/q)</th>
                  <th className="py-3 px-4">Transport Freight</th>
                  <th className="py-3 px-4">Storage Fee</th>
                  <th className="py-3 px-4">Net Realisation (/q)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {markets.map((mkt, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span>{mkt.name}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{mkt.distance_km} km</td>
                    <td className="py-3.5 px-4 text-slate-200 font-semibold">₹{mkt.base_price}/q</td>
                    <td className="py-3.5 px-4 text-amber-400 font-mono">-₹{mkt.cost_breakdown?.transport_cost || 0}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">-₹{mkt.cost_breakdown?.storage_cost || 0}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm font-mono">
                      ₹{mkt.cost_breakdown?.net_realisation || mkt.base_price}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/market-intelligence')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-all"
                      >
                        Compare Logistics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM SPLIT: SECTION 3 (MY LOTS) & SECTION 4 (MATCHED BUYERS PREVIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SECTION 3: MY LOTS BUTTON & LOTS DRAWER PREVIEW */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>{t('farmer.myLots')}</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  2 Active Lots
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>LOT-1001</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Grade A</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">30 Quintals Tomato &bull; Harvested Sep 1</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 font-mono">Min ₹2,400/q</div>
                    <span className="text-[10px] text-emerald-300 font-medium">ACTIVE</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>LOT-1002</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-semibold">Grade B</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">30 Quintals Tomato &bull; Harvested Sep 3</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-teal-400 font-mono">Min ₹2,200/q</div>
                    <span className="text-[10px] text-teal-300 font-medium">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/create-lot')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Digitize & Add New Crop Lot</span>
            </button>
          </div>

          {/* SECTION 4: MATCHED BUYERS PREVIEW */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('farmer.matchedBuyers')}</span>
              </h3>
              <button
                onClick={() => navigate('/buyer-matching')}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                View All Verified Buyers &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {buyersList.slice(0, 3).map((buyer, bIdx) => (
                <div key={bIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{buyer.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        {buyer.match_score ? `${buyer.match_score}% Match` : '96% Match'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Trust: {buyer.trust_score} ★</span>
                      <span>&bull;</span>
                      <span>Payment: {buyer.payment_terms}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        ₹{buyer.offered_price}/q Gross
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Net ~₹{buyer.cost_breakdown?.net_realisation || buyer.offered_price - 120}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLockDeal(buyer.name, buyer.cost_breakdown?.net_realisation || buyer.offered_price - 120)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
                    >
                      Accept Deal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
