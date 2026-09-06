import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Package,
  IndianRupee,
  CheckCircle2,
  Truck,
  Search,
  Filter,
  Send,
  X,
  Clock,
  ShieldCheck,
  FileCheck,
  TrendingUp,
  MapPin,
  RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const userName = localStorage.getItem('userName') || 'User';

  const [loading, setLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [offerModalLot, setOfferModalLot] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerTerms, setOfferTerms] = useState('Instant UPI / NEFT');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState(null);

  // Sample farmer crop lots for buyer procurement
  const [lots, setLots] = useState([
    { id: 1, lot_code: 'LOT-1001', farmer_name: 'Ramesh Patil', location: 'Nashik (Dindori Road), MH', crop: 'Tomato', quantity: 30, grade: 'A', moisture: '8.2%', min_price: 2400, expected_price: 2750, status: 'ACTIVE' },
    { id: 2, lot_code: 'LOT-1002', farmer_name: 'Ramesh Patil', location: 'Nashik (Dindori Road), MH', crop: 'Tomato', quantity: 30, grade: 'B', moisture: '9.1%', min_price: 2200, expected_price: 2500, status: 'ACTIVE' },
    { id: 3, lot_code: 'LOT-1004', farmer_name: 'Sunita Gaikwad', location: 'Niphad, Nashik, MH', crop: 'Tomato', quantity: 25, grade: 'C', moisture: '10.5%', min_price: 1900, expected_price: 2100, status: 'ACTIVE' },
    { id: 4, lot_code: 'LOT-1005', farmer_name: 'Vishnu Deshmukh', location: 'Pimpalgaon, Nashik, MH', crop: 'Tomato', quantity: 50, grade: 'A', moisture: '7.8%', min_price: 2500, expected_price: 2850, status: 'ACTIVE' },
    { id: 5, lot_code: 'LOT-1006', farmer_name: 'Anand Shinde', location: 'Lasalgaon, Nashik, MH', crop: 'Tomato', quantity: 45, grade: 'B', moisture: '8.8%', min_price: 2300, expected_price: 2600, status: 'ACTIVE' },
  ]);

  // Direct Contracts mock data
  const [contracts] = useState([
    { id: 'CTR-8801', farmer: 'Ramesh Patil', crop: 'Tomato', quantity: '60 Quintals', price: '₹2,650/q', status: 'Confirmed', date: '2026-09-05' },
    { id: 'CTR-8802', farmer: 'Sunita Gaikwad', crop: 'Tomato', quantity: '40 Quintals', price: '₹2,400/q', status: 'Pending Farmer Acceptance', date: '2026-09-06' }
  ]);

  // Logistics Pickup mock data
  const [logistics] = useState([
    { id: 'TRK-901', driver: 'Suresh Transport Services', route: 'Dindori Farm Lot -> Vashi APMC Warehouse', vehicle: 'MH-15-EG-4421 (Refrigerated Truck)', status: 'In Transit (ETA 3 hrs)', load: '60 Quintals' },
    { id: 'TRK-902', driver: 'Nashik Agro Logistics', route: 'Niphad Farm Lot -> Pimpalgaon Hub', vehicle: 'MH-15-BV-8820 (Bolero Pickup)', status: 'Scheduled for Pickup Today 4:00 PM', load: '40 Quintals' }
  ]);

  const handleOpenOfferModal = (lot) => {
    setOfferModalLot(lot);
    setOfferPrice(lot.expected_price || 2600);
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerModalLot || !offerPrice) return;

    try {
      const response = await fetch('http://localhost:5000/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_code: offerModalLot.lot_code,
          offer_price: parseFloat(offerPrice),
          buyer_name: 'ABC Foods Logistics'
        })
      });
      const data = await response.json();
      setOfferSuccessMsg(data.message || `Offer of ₹${offerPrice}/q submitted for ${offerModalLot.lot_code}!`);
      
      // Update local lot status
      setLots(lots.map(l => l.lot_code === offerModalLot.lot_code ? { ...l, status: 'OFFERED' } : l));
    } catch (err) {
      setOfferSuccessMsg(`Offer of ₹${offerPrice}/q placed for ${offerModalLot.lot_code}!`);
    } finally {
      setOfferModalLot(null);
      setTimeout(() => setOfferSuccessMsg(null), 5000);
    }
  };

  const filteredLots = lots.filter(lot => {
    const matchesGrade = selectedGrade === 'ALL' || lot.grade === selectedGrade;
    const matchesSearch = lot.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lot.lot_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 animate-fade-in flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Success Alert */}
        {offerSuccessMsg && (
          <div className="p-4 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-sm font-semibold flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <span>{offerSuccessMsg}</span>
            </div>
            <button onClick={() => setOfferSuccessMsg(null)} className="text-xs text-teal-400 hover:underline font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow-md shadow-teal-500/20">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Good Morning, {userName} 👋
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Bulk Purchaser &bull; Nashik & Mumbai APMC Hubs</span>
              </p>
            </div>
          </div>
        </div>

        {/* REQUIRED METRICS (4 DISTINCT BUYER METRICS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Metric 1: Active Purchase Inquiries */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('buyer.kpi.activeInquiries')}</span>
              <FileCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              14 <span className="text-xs font-normal text-slate-400">Inquiries</span>
            </div>
            <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" /> 4 Active RFQs in Nashik
            </p>
          </div>

          {/* Metric 2: Pending Lots in Region */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('buyer.kpi.pendingLots')}</span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-2">
              42 <span className="text-xs font-normal text-slate-400">Lots (1,280 q)</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">
              Grade A/B Tomato Lots available
            </p>
          </div>

          {/* Metric 3: Average Purchase Price */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/40">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{t('buyer.kpi.avgPurchasePrice')}</span>
              <IndianRupee className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-cyan-300 mt-2">
              ₹2,420<span className="text-xs font-normal text-slate-400">/q</span>
            </div>
            <p className="text-[11px] text-cyan-400 mt-1 font-medium">
              -3.8% below nominal mandi rate
            </p>
          </div>

          {/* Metric 4: Fulfillment Rate */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-500/40 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-teal-500/20">
            <div className="flex items-center justify-between text-teal-300 text-xs font-bold uppercase tracking-wider">
              <span>{t('buyer.kpi.fulfillmentRate')}</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-teal-400 mt-2">
              94.2%
            </div>
            <p className="text-[11px] text-teal-300 mt-1 font-medium">
              Verified Escrow Trust Record
            </p>
          </div>

        </div>

        {/* SECTION 1: AVAILABLE FARMER CROP LOTS (FILTERABLE BY GRADE, MOISTURE, QUANTITY) */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-400" />
                <span>{t('buyer.availableLots')}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Filter by harvest grade, moisture percentage, and minimum farmer price.</p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search farmer or location..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['ALL', 'A', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedGrade === g
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredLots.map((lot) => (
              <div key={lot.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{lot.lot_code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      lot.grade === 'A' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      lot.grade === 'B' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      Grade {lot.grade}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mt-2">{lot.farmer_name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{lot.location}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Quantity:</span>
                      <p className="font-bold text-white">{lot.quantity} Quintals</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Moisture:</span>
                      <p className="font-bold text-teal-300">{lot.moisture}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Min Reserve:</span>
                      <p className="font-mono text-slate-300 font-bold">₹{lot.min_price}/q</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Expected:</span>
                      <p className="font-mono text-teal-400 font-bold">₹{lot.expected_price}/q</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className={`text-[10px] font-bold uppercase ${lot.status === 'OFFERED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {lot.status === 'OFFERED' ? 'Offer Submitted' : 'Available Now'}
                  </span>
                  <button
                    onClick={() => handleOpenOfferModal(lot)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('buyer.makeOffer')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2 & SECTION 3 SPLIT: DIRECT CONTRACT REQUESTS & LOGISTICS PICKUP STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SECTION 2: DIRECT CONTRACT REQUESTS */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-400" />
                <span>{t('buyer.directContracts')}</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                2 Contracts
              </span>
            </div>

            <div className="space-y-3">
              {contracts.map((ctr) => (
                <div key={ctr.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">{ctr.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ctr.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ctr.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <div>
                      <p className="font-semibold text-slate-100">{ctr.farmer} &bull; {ctr.crop}</p>
                      <p className="text-[11px] text-slate-400">{ctr.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-teal-400">{ctr.price}</div>
                      <div className="text-[10px] text-slate-500">{ctr.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: LOGISTICS PICKUP STATUS */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>{t('buyer.logisticsPickup')}</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Live Tracking
              </span>
            </div>

            <div className="space-y-3">
              {logistics.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">{log.id} &bull; {log.driver}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                      {log.load}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{log.route}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <span className="font-mono text-slate-400">{log.vehicle}</span>
                    <span className="text-emerald-400 font-semibold">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* MAKE AN OFFER MODAL OVERLAY */}
      {offerModalLot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-teal-400" />
                <span>Submit Purchase Offer</span>
              </h3>
              <button onClick={() => setOfferModalLot(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white">{offerModalLot.farmer_name} &bull; {offerModalLot.lot_code}</div>
              <p className="text-slate-400">{offerModalLot.quantity} Quintals Tomato &bull; Grade {offerModalLot.grade}</p>
              <p className="text-teal-400 font-mono">Farmer Expected Price: ₹{offerModalLot.expected_price}/q</p>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Offered Price (₹ per Quintal)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="Enter price per quintal"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-teal-500"
                  />
                  <IndianRupee className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Terms
                </label>
                <select
                  value={offerTerms}
                  onChange={(e) => setOfferTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="Instant UPI / NEFT">Instant Bank Transfer (Same Day)</option>
                  <option value="Escrow / 24-hr Clearance">Escrow / 24-hr Clearance</option>
                  <option value="T+1 Working Day Settlement">T+1 Working Day Settlement</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModalLot(null)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
