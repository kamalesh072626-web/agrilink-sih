import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  IndianRupee,
  Truck,
  Clock,
  AlertTriangle,
  RefreshCw,
  Star,
  MapPin,
  Hourglass,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

// ---------------------------------------------------------------------------
// MOCK OFFERS DATA
// In a production Phase 4, these would be fetched from a real-time API
// (e.g., via WebSockets or polling). Rich demonstration mock data is used.
// ---------------------------------------------------------------------------
const MOCK_OFFERS = [
  {
    id: 'OFR-2001',
    buyer_name: 'Reliance Fresh Procurement',
    buyer_type: 'Retailer',
    lot_code: 'LOT-1001',
    crop: 'Tomato',
    quantity: 30,
    quality_grade: 'A',
    offered_price: 2850,
    net_realisation: 2369,
    distance_km: 168,
    transport_cost: 520.8,
    storage_cost: 36,
    payment_terms: 'T+2 Bank Transfer',
    payment_reliability_pct: 95,
    trust_score: 4.8,
    match_score: 91.2,
    status: 'PENDING',
    validity_hours: 24,
    message: 'We are interested in procuring Grade-A Nashik tomatoes for our 420 stores across Maharashtra. Offer valid for 24 hours.',
    offer_date: '2026-09-05'
  },
  {
    id: 'OFR-2002',
    buyer_name: 'FreshMart E-Commerce',
    buyer_type: 'E-Commerce',
    lot_code: 'LOT-1001',
    crop: 'Tomato',
    quantity: 20,
    quality_grade: 'A',
    offered_price: 2760,
    net_realisation: 2741.6,
    distance_km: 8,
    transport_cost: 17.6,
    storage_cost: 36,
    payment_terms: 'Instant UPI Settlement',
    payment_reliability_pct: 97,
    trust_score: 4.6,
    match_score: 88.4,
    status: 'PENDING',
    validity_hours: 18,
    message: 'Offering premium listing on FreshMart platform + instant UPI payment. Pickup from your farm gate. No transport cost for you.',
    offer_date: '2026-09-05'
  },
  {
    id: 'OFR-2003',
    buyer_name: 'Deccan Food Processors Ltd',
    buyer_type: 'Processor',
    lot_code: 'LOT-1002',
    crop: 'Tomato',
    quantity: 30,
    quality_grade: 'B',
    offered_price: 2680,
    net_realisation: 2644,
    distance_km: 212,
    transport_cost: 689,
    storage_cost: 36,
    payment_terms: 'Instant UPI Settlement',
    payment_reliability_pct: 95,
    trust_score: 4.7,
    match_score: 79.6,
    status: 'ACCEPTED',
    validity_hours: 48,
    message: 'Confirmed procurement for ketchup manufacturing line. Grade-B acceptable. Processing plant pickup arranged.',
    offer_date: '2026-09-04'
  },
  {
    id: 'OFR-2004',
    buyer_name: 'Kisan Mandi Aggregators',
    buyer_type: 'Wholesaler',
    lot_code: 'LOT-1002',
    crop: 'Tomato',
    quantity: 25,
    quality_grade: 'B',
    offered_price: 2320,
    net_realisation: 2175,
    distance_km: 58,
    transport_cost: 145,
    storage_cost: 36,
    payment_terms: '2 Days Post-Delivery',
    payment_reliability_pct: 82,
    trust_score: 4.1,
    match_score: 62.3,
    status: 'REJECTED',
    validity_hours: 12,
    message: 'Standard wholesale rate applicable. Open to negotiation for bulk volumes.',
    offer_date: '2026-09-04'
  },
  {
    id: 'OFR-2005',
    buyer_name: 'ABC Foods Pvt Ltd',
    buyer_type: 'Processor',
    lot_code: 'LOT-1001',
    crop: 'Tomato',
    quantity: 30,
    quality_grade: 'A',
    offered_price: 2700,
    net_realisation: 2621,
    distance_km: 32,
    transport_cost: 76.8,
    storage_cost: 36,
    payment_terms: 'RTGS within 24 hours',
    payment_reliability_pct: 93,
    trust_score: 4.5,
    match_score: 84.7,
    status: 'COUNTER_OFFERED',
    validity_hours: 36,
    message: 'We counter-offer ₹2,750/q for the full lot of 30 quintals with RTGS next-day settlement.',
    offer_date: '2026-09-05'
  }
];

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Review',
    icon: <Hourglass className="w-3.5 h-3.5" />,
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400 animate-pulse'
  },
  ACCEPTED: {
    label: 'Accepted',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400'
  },
  REJECTED: {
    label: 'Rejected',
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: 'bg-slate-700/50 text-slate-400 border-slate-600',
    dot: 'bg-slate-500'
  },
  COUNTER_OFFERED: {
    label: 'Counter Offered',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    dot: 'bg-violet-400 animate-pulse'
  }
};

export default function Offers() {
  const navigate = useNavigate();

  // Local state to manage offer statuses (simulates real-time interactions)
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [counterInput, setCounterInput] = useState({});
  const [showCounterFor, setShowCounterFor] = useState(null);

  // Update an offer's status in local state
  const updateStatus = (offerId, newStatus) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
    if (newStatus !== 'COUNTER_OFFERED') {
      setShowCounterFor(null);
    }
  };

  const submitCounter = (offerId) => {
    const price = parseFloat(counterInput[offerId]);
    if (!price || price <= 0) return;
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? { ...o, status: 'COUNTER_OFFERED', message: `Counter offered at ₹${price}/q by farmer.` }
          : o
      )
    );
    setShowCounterFor(null);
  };

  const filteredOffers = filterStatus === 'ALL'
    ? offers
    : offers.filter((o) => o.status === filterStatus);

  const pendingCount = offers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTER_OFFERED').length;

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
                Digital Offer Inbox
                {pendingCount > 0 && (
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                    {pendingCount} Action Required
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Buyer offers for your active lots — Accept, Reject, or Counter
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {offers.length} total offers
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* Status Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'COUNTER_OFFERED', 'ACCEPTED', 'REJECTED'].map((status) => {
            const count = status === 'ALL'
              ? offers.length
              : offers.filter((o) => o.status === status).length;
            const cfg = STATUS_CONFIG[status];

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  filterStatus === status
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                {status === 'ALL' ? 'All Offers' : STATUS_CONFIG[status].label}
                <span className="ml-1 text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Offer Cards */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No offers in this category.
          </div>
        )}

        {filteredOffers.map((offer) => {
          const statusCfg = STATUS_CONFIG[offer.status];
          const isPending = offer.status === 'PENDING';
          const isCounter = offer.status === 'COUNTER_OFFERED';
          const isAccepted = offer.status === 'ACCEPTED';
          const isRejected = offer.status === 'REJECTED';

          return (
            <div
              key={offer.id}
              className={`bg-slate-950 rounded-2xl border transition-all ${
                isPending ? 'border-amber-500/40 shadow-lg shadow-amber-950/20' :
                isCounter ? 'border-violet-500/40 shadow-lg shadow-violet-950/20' :
                isAccepted ? 'border-emerald-500/30' :
                'border-slate-800 opacity-60'
              }`}
            >
              {/* Card Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {/* Buyer Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                    isAccepted ? 'bg-emerald-500 text-slate-950' :
                    isPending || isCounter ? 'bg-amber-500 text-slate-950' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {offer.buyer_name.charAt(0)}
                  </div>

                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                      {offer.buyer_name}
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Buyer" />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                      <span>{offer.buyer_type}</span>
                      <span className="text-slate-600">·</span>
                      <span>Offer ID: <span className="font-mono text-slate-300">{offer.id}</span></span>
                      <span className="text-slate-600">·</span>
                      <span>Lot: <span className="font-mono text-slate-300">{offer.lot_code}</span></span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${statusCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Left: Offer Details */}
                <div className="space-y-3">
                  {/* Offered Price — HERO number */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Offered Price</div>
                    <div className="text-3xl font-extrabold text-white">
                      ₹{offer.offered_price.toLocaleString('en-IN')}
                      <span className="text-base font-normal text-slate-400">/q</span>
                    </div>
                    <div className="text-xs text-emerald-400 font-semibold mt-1">
                      Net Realisation: ₹{offer.net_realisation.toFixed(0)}/q
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <div className="text-slate-500 mb-0.5">Quantity</div>
                      <div className="font-bold text-slate-200">{offer.quantity} quintals</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <div className="text-slate-500 mb-0.5">Grade</div>
                      <div className="font-bold text-slate-200">Grade {offer.quality_grade}</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <div className="text-slate-500 mb-0.5 flex items-center gap-1"><Truck className="w-3 h-3" /> Distance</div>
                      <div className="font-bold text-slate-200">{offer.distance_km} km</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <div className="text-slate-500 mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Valid for</div>
                      <div className="font-bold text-amber-300">{offer.validity_hours}h</div>
                    </div>
                  </div>

                  {/* Cost Breakdown Chip Row */}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Transport: -₹{offer.transport_cost}/q
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Storage: -₹{offer.storage_cost}/q
                    </span>
                  </div>
                </div>

                {/* Right: Buyer Credibility + Message */}
                <div className="space-y-3">
                  {/* Trust & Reliability */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Buyer Credibility</div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400" /> Trust Score
                      </span>
                      <span className="font-bold text-amber-400">
                        {'★'.repeat(Math.round(offer.trust_score))}{'☆'.repeat(5 - Math.round(offer.trust_score))} {offer.trust_score}/5
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Payment Reliability</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${offer.payment_reliability_pct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${offer.payment_reliability_pct}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-200">{offer.payment_reliability_pct}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Match Score</span>
                      <span className={`font-bold ${
                        offer.match_score >= 75 ? 'text-emerald-400' :
                        offer.match_score >= 55 ? 'text-amber-400' : 'text-rose-400'
                      }`}>{offer.match_score} / 100</span>
                    </div>

                    <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                      Payment: <span className="text-slate-300 font-semibold">{offer.payment_terms}</span>
                    </div>
                  </div>

                  {/* Buyer Message */}
                  <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Buyer Message
                    </div>
                    "{offer.message}"
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {(isPending || isCounter) && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(offer.id, 'ACCEPTED')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <ThumbsUp className="w-4 h-4" /> Accept Offer
                    </button>
                    <button
                      onClick={() => updateStatus(offer.id, 'REJECTED')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-slate-700 hover:border-rose-700 transition-all"
                    >
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setShowCounterFor(showCounterFor === offer.id ? null : offer.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-violet-900/40 hover:bg-violet-900/60 text-violet-300 border border-violet-700/40 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" /> Counter Offer
                    </button>
                  </div>

                  {/* Inline Counter Offer Input */}
                  {showCounterFor === offer.id && (
                    <div className="flex gap-2 items-center bg-slate-900 border border-violet-500/30 rounded-xl px-4 py-3 animate-in fade-in">
                      <span className="text-sm text-slate-400 font-semibold shrink-0">Your counter price: ₹</span>
                      <input
                        type="number"
                        placeholder={`e.g. ${offer.offered_price + 100}`}
                        value={counterInput[offer.id] || ''}
                        onChange={(e) => setCounterInput((prev) => ({ ...prev, [offer.id]: e.target.value }))}
                        className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none placeholder-slate-600"
                      />
                      <span className="text-slate-400 text-xs">/q</span>
                      <button
                        onClick={() => submitCounter(offer.id)}
                        className="px-4 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-slate-950 text-xs font-bold transition-all"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Accepted State Confirmation */}
              {isAccepted && (
                <div className="px-5 pb-5">
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    You accepted this offer. The buyer will contact you within 24 hours to arrange logistics.
                    Batch total: <strong className="text-emerald-300 ml-1">₹{(offer.offered_price * offer.quantity).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      </main>
    </div>
  );
}
