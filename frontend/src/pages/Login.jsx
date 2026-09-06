import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Tractor, 
  Building2, 
  ShieldCheck, 
  Phone, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  UserCheck
} from 'lucide-react';

import { LanguageSelector, useLanguage } from '../context/LanguageContext';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  // Switch persona tab
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorBanner(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorBanner(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mobileNumber,
          password: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRole', data.role);
        
        if (data.role === 'buyer') {
          navigate('/buyer-dashboard');
        } else if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorBanner(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorBanner('Could not connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestBypass = (role = 'farmer') => {
    const guestNames = {
      farmer: 'Guest Farmer',
      buyer: 'Guest Buyer',
      admin: 'Guest Admin'
    };
    localStorage.setItem('userName', guestNames[role] || 'User');
    localStorage.setItem('userRole', role);
    if (role === 'buyer') navigate('/buyer-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden animate-fade-in">
      
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
        </div>
      </header>

      {/* Main Split Screen Area */}
      <main className="flex-1 grid md:grid-cols-12 z-10">
        
        {/* Left Side: Clean Hero & Formula Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-8 sm:p-12 flex flex-col justify-center border-r border-slate-800/60 relative overflow-hidden">
          <div className="space-y-6 relative z-10 max-w-xl mx-auto">
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {t('hero.title')}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {t('hero.tagline')}
            </p>



          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="md:col-span-6 bg-slate-900 p-8 sm:p-12 flex flex-col justify-center items-center">
          <div className="max-w-md w-full space-y-6">
            
            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Sign In to AgriLink</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your persona role or enter your registered account credentials.
              </p>
            </div>

            {/* Persona Tabs */}
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleRoleChange('farmer')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Tractor className="w-3.5 h-3.5" />
                <span>Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('buyer')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'buyer'
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Buyer</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-500 text-slate-950 shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p className="text-[11px] text-rose-300 mt-0.5">{errorBanner}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Mobile Number / Phone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mobile Number / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Your registered mobile number"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Bypass */}
            <button
              type="button"
              onClick={() => handleGuestBypass(selectedRole)}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Demo Access ({selectedRole.toUpperCase()})</span>
            </button>

            {/* Link to Signup */}
            <p className="text-center text-xs text-slate-400 pt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-400 font-semibold hover:underline">
                Register New Account
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
