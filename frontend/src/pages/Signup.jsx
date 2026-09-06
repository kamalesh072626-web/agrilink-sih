import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Tractor, 
  Building2, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Lock,
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  Zap,
  Sprout
} from 'lucide-react';

import { LanguageSelector, useLanguage } from '../context/LanguageContext';

export default function Signup() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    password: '',
    location: '',
    primaryCrop: '',
    role: 'farmer'
  });
  const [signupError, setSignupError] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.mobileNumber,
          password: formData.password,
          role: formData.role,
          location: formData.location
        })
      });
      const data = await response.json();
      if (response.status === 201 && data.success) {
        alert('Account created successfully! Please sign in.');
        navigate('/');
      } else {
        setSignupError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setSignupError('Could not connect to server. Please try again later.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGuestBypass = () => {
    navigate('/farmer');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Tractor className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {t('nav.brand')}
            </h1>
            <p className="text-xs text-slate-400">{t('nav.tagline')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button
            onClick={handleGuestBypass}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            {t('nav.guestMode')}
          </button>
        </div>
      </header>

      {/* Main Split Screen Area */}
      <main className="flex-1 grid md:grid-cols-12 z-10">
        
        {/* Left Side: Agricultural Branding */}
        <div className="md:col-span-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-8 sm:p-12 flex flex-col justify-between border-r border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Join AgriLink Marketplace
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Create Your Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Farmer & Buyer Account</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Connect directly with verified buyers, calculate Net Realisation across APMCs, and eliminate transport middlemen.
            </p>

            {/* Steps */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Digitize your harvest lots with quality grade photos</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Get matched automatically with verified high-trust buyers</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Track live transport delivery and resolve disputes instantly</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 relative z-10 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">AgriLink Producer Network</p>
              <p className="text-[11px] text-slate-400">Strengthening Market Linkages for Agri Producers</p>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-emerald-900/50 border border-emerald-700/50 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              Instant Setup
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-6 bg-slate-900 p-8 sm:p-12 flex flex-col justify-center items-center">
          <div className="max-w-md w-full space-y-6">
            
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Register New Account</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fill in your details to create your AgriLink profile.
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Your Role
              </label>
              <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'farmer' })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'farmer'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tractor className="w-3.5 h-3.5" />
                  <span>Farmer/FPO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'buyer'
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'admin'
                      ? 'bg-indigo-500 text-slate-950 shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>APMC Admin</span>
                </button>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* Error Banner */}
              {signupError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {signupError}
                </div>
              )}

              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name / Organization Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mobile Number (for OTP &amp; SMS Alerts)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-xs font-medium border-r border-slate-700/60 pr-2">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full pl-16 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Location (Taluka / District / State)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Dindori, Nashik, Maharashtra"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Crop produced / required */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Primary Commodity / Crop
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="primaryCrop"
                    value={formData.primaryCrop}
                    onChange={handleChange}
                    placeholder="e.g. Tomato, Onion, Grape"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <Sprout className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{signupLoading ? 'Creating Account...' : 'Create Account & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs">or Instant Guest Access</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGuestBypass}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Continue as Guest (Demo Mode)</span>
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">
              Already registered?{' '}
              <Link to="/" className="text-emerald-400 font-semibold hover:underline">
                Sign In Here
              </Link>
            </p>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500 z-10">
        AgriLink Smart Mandi Linkages &bull; Built with React, Flask & SQLite
      </footer>
    </div>
  );
}
