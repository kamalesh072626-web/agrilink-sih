import React, { useState, useEffect } from 'react';
import { 
  ReceiptText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CreditCard, 
  PackageCheck, 
  User, 
  MapPin, 
  RefreshCw, 
  Building2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Transactions() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTxnId, setSelectedTxnId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/transactions?farmer_id=1');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        if (data.transactions.length > 0) {
          setSelectedTxnId(data.transactions[0].id);
        }
      } else {
        throw new Error(data.error || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const selectedTxn = transactions.find((t) => t.id === selectedTxnId) || transactions[0];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {t('nav.transactions')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time harvest lot dispatch, logistics tracking, and escrow payout status
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : t('common.refresh')}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300 font-medium">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}. Check if backend API `http://localhost:5000` is running.</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left Column: Transaction Selector Cards */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-1">
              Your Harvest Lots ({transactions.length})
            </h3>

            {transactions.map((txn) => {
              const isSelected = txn.id === selectedTxnId;
              return (
                <div
                  key={txn.id}
                  onClick={() => setSelectedTxnId(txn.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-850 border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {txn.lot_code}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{txn.crop}</h4>
                      <p className="text-xs text-slate-400">{txn.quantity_quintals} Quintals &bull; {txn.buyer_name}</p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        txn.status_color === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {txn.status_title}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Gross: ₹{txn.gross_price_per_quintal}/q</span>
                    <span className="font-bold text-emerald-400">Payout: ₹{txn.total_payout.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Transaction Detail & Vertical Timeline */}
          {selectedTxn && (
            <div className="lg:col-span-7 space-y-6">
              
              {/* Transaction Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{selectedTxn.id}</h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {selectedTxn.lot_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Destination: <strong className="text-slate-200">{selectedTxn.destination_market}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Expected Net Payout</div>
                    <div className="text-xl font-extrabold text-emerald-400">
                      ₹{selectedTxn.total_payout.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Driver / Transport Details Pill */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-slate-400">Assigned Logistics: </span>
                      <strong className="text-slate-200">{selectedTxn.driver_name}</strong>
                    </div>
                  </div>
                  <div className="text-right font-medium text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-800/50">
                    ETA: {selectedTxn.eta}
                  </div>
                </div>

                {/* Vertical Timeline Component */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Transaction Progress Pipeline
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {selectedTxn.timeline.map((step) => {
                      const isCompleted = step.status === 'completed';
                      const isActive = step.status === 'active';
                      const isPending = step.status === 'pending';

                      return (
                        <div key={step.step} className="relative flex items-start gap-4">
                          
                          {/* Timeline Dot Indicator */}
                          <div
                            className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                              isCompleted
                                ? 'bg-emerald-500 text-slate-950 ring-4 ring-slate-900'
                                : isActive
                                ? 'bg-blue-500 text-slate-950 animate-pulse ring-4 ring-blue-500/20'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                            ) : isActive ? (
                              <span className="w-2 h-2 rounded-full bg-slate-950" />
                            ) : (
                              <span className="text-[10px]">{step.step}</span>
                            )}
                          </div>

                          {/* Step Content */}
                          <div
                            className={`flex-1 p-4 rounded-xl border transition-all ${
                              isCompleted
                                ? 'bg-slate-950/60 border-slate-800'
                                : isActive
                                ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-950/40'
                                : 'bg-slate-950/30 border-slate-850 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h5
                                className={`text-sm font-bold ${
                                  isCompleted
                                    ? 'text-emerald-300'
                                    : isActive
                                    ? 'text-blue-300'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step.title}
                              </h5>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {step.timestamp}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Escrow Guarantee */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3 text-xs text-emerald-300 mt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>AgriLink Escrow Protection:</strong> Funds are locked upon Buyer Match and automatically disbursed to farmer bank account immediately upon weighbridge gate verification.
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
