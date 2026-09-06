import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Tractor,
  Package,
  IndianRupee,
  Calendar,
  Leaf,
  AlertTriangle,
  Loader2,
  ClipboardList
} from 'lucide-react';

// Available crops and grade descriptions
const CROPS = ['Tomato', 'Onion', 'Grapes', 'Potato', 'Cauliflower'];

const GRADE_INFO = {
  A: {
    label: 'Grade A — Premium',
    desc: 'Uniform colour, no blemishes, >90% marketable. Best export / modern retail quality.',
    color: 'border-emerald-500 bg-emerald-950/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  B: {
    label: 'Grade B — Standard',
    desc: 'Minor surface defects, 75–90% marketable. Suitable for wholesale mandis.',
    color: 'border-amber-500 bg-amber-950/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  C: {
    label: 'Grade C — Processing',
    desc: 'Visible bruising or irregular size. Ideal for processors / ketchup factories.',
    color: 'border-slate-600 bg-slate-800/20',
    badge: 'bg-slate-700/50 text-slate-300 border-slate-600'
  }
};

const INITIAL_FORM = {
  crop: 'Tomato',
  quantity: '',
  harvest_date: '',
  quality_grade: 'A',
  minimum_price: '',
  expected_price: '',
  farmer_id: 1
};

export default function CreateLot() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [createdLot, setCreatedLot] = useState(null); // Holds the success response

  // Update a single form field and clear its validation error
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};
    if (!form.crop) newErrors.crop = 'Please select a crop.';
    if (!form.quantity || parseFloat(form.quantity) <= 0)
      newErrors.quantity = 'Quantity must be a positive number.';
    if (!form.harvest_date) newErrors.harvest_date = 'Please enter the harvest date.';
    if (!form.minimum_price || parseFloat(form.minimum_price) <= 0)
      newErrors.minimum_price = 'Enter a valid minimum price.';
    if (!form.expected_price || parseFloat(form.expected_price) <= 0)
      newErrors.expected_price = 'Enter a valid expected price.';
    if (parseFloat(form.expected_price) < parseFloat(form.minimum_price))
      newErrors.expected_price = 'Expected price must be ≥ minimum price.';
    return newErrors;
  };

  // Submit the form to the Flask /api/lots POST endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        crop: form.crop,
        quantity: parseFloat(form.quantity),
        harvest_date: form.harvest_date,
        quality_grade: form.quality_grade,
        minimum_price: parseFloat(form.minimum_price),
        expected_price: parseFloat(form.expected_price),
        farmer_id: form.farmer_id
      };

      const res = await fetch('http://localhost:5000/api/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        setCreatedLot(json);
        setForm(INITIAL_FORM);
      } else {
        throw new Error(json.error || 'Lot creation failed');
      }
    } catch (err) {
      setApiError(err.message || 'Server error. Is app.py running?');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- SUCCESS STATE ----
  if (createdLot) {
    const lot = createdLot.lot;
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/farmer')}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-lg font-bold text-white">Lot Created Successfully</h1>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-950 border-2 border-emerald-500 rounded-2xl p-8 shadow-2xl shadow-emerald-950/40 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">Lot Digitized!</h2>
              <p className="text-slate-400 text-sm mt-1">
                Your harvest lot is now live and buyer matching has been triggered.
              </p>
            </div>

            {/* Lot ID Big Display */}
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl py-5 px-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Lot Reference ID</div>
              <div className="text-4xl font-extrabold text-white tracking-tight">{createdLot.lot_code}</div>
              <div className="text-xs text-slate-500 mt-1">Use this ID to track buyer enquiries</div>
            </div>

            {/* Lot Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              {[
                { label: 'Crop', val: lot.crop },
                { label: 'Quantity', val: `${lot.quantity} quintals` },
                { label: 'Grade', val: `Grade ${lot.quality_grade}` },
                { label: 'Harvest Date', val: lot.harvest_date },
                { label: 'Min Price', val: `₹${lot.minimum_price}/q` },
                { label: 'Expected Price', val: `₹${lot.expected_price}/q` },
              ].map(({ label, val }) => (
                <div key={label} className="bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">
                  <div className="text-slate-500 mb-0.5">{label}</div>
                  <div className="font-semibold text-slate-200">{val}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCreatedLot(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
              >
                Create Another Lot
              </button>
              <button
                onClick={() => navigate('/buyer-matching')}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
              >
                Find Buyers →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- FORM STATE ----
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/farmer')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Digitize Your Harvest Lot
              <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full">
                Phase 3
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Register your harvest and get matched with verified buyers instantly
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* API Error Banner */}
          {apiError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              {apiError}
            </div>
          )}

          {/* SECTION 1: Crop Details */}
          <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Section 1 — Crop Details
            </h2>

            {/* Crop Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Crop Type *</label>
              <div className="flex flex-wrap gap-2">
                {CROPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleChange('crop', c)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                      form.crop === c
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Harvest Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Quantity (Quintals) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="e.g. 20"
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors ${
                    errors.quantity ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {errors.quantity && <p className="text-[11px] text-rose-400 mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Harvest Date *
                </label>
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(e) => handleChange('harvest_date', e.target.value)}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors ${
                    errors.harvest_date ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {errors.harvest_date && <p className="text-[11px] text-rose-400 mt-1">{errors.harvest_date}</p>}
              </div>
            </div>
          </section>

          {/* SECTION 2: Quality Grade */}
          <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-4 h-4 text-amber-400" />
              Section 2 — Quality Assessment
            </h2>

            <div className="space-y-2.5">
              {Object.entries(GRADE_INFO).map(([g, info]) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleChange('quality_grade', g)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    form.quality_grade === g ? info.color : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{info.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      form.quality_grade === g ? info.badge : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {form.quality_grade === g ? 'SELECTED' : 'SELECT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{info.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 3: Pricing */}
          <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <IndianRupee className="w-4 h-4 text-teal-400" />
              Section 3 — Pricing (INR per Quintal)
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Minimum Acceptable Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="500"
                    placeholder="e.g. 2400"
                    value={form.minimum_price}
                    onChange={(e) => handleChange('minimum_price', e.target.value)}
                    className={`w-full bg-slate-900 border rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors ${
                      errors.minimum_price ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {errors.minimum_price && <p className="text-[11px] text-rose-400 mt-1">{errors.minimum_price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Target / Expected Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="500"
                    placeholder="e.g. 2750"
                    value={form.expected_price}
                    onChange={(e) => handleChange('expected_price', e.target.value)}
                    className={`w-full bg-slate-900 border rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors ${
                      errors.expected_price ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                </div>
                {errors.expected_price && <p className="text-[11px] text-rose-400 mt-1">{errors.expected_price}</p>}
              </div>
            </div>

            {/* Helpful note about Net Realisation */}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-[11px] text-emerald-300/90">
              <strong className="text-emerald-400">💡 Tip:</strong> Your Net Realisation (after transport + storage deductions) will typically be ₹150–550 below the offered price depending on market distance. AgriLink calculates this precisely for each buyer.
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl text-base font-extrabold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Lot...
              </>
            ) : (
              <>
                <ClipboardList className="w-5 h-5" />
                Create Harvest Lot
              </>
            )}
          </button>

        </form>
      </main>
    </div>
  );
}
