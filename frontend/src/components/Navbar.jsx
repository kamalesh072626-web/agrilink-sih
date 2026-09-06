import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tractor, LogOut, User, LayoutDashboard, BarChart3, TrendingUp, Users, PlusCircle, Inbox, FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import { LanguageSelector, useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const user = JSON.parse(localStorage.getItem('agrilink_user') || 'null');

  const handleLogoClick = () => {
    if (user && user.role) {
      if (user.role === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agrilink_user');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'buyer') return '/buyer-dashboard';
    if (user?.role === 'admin') return '/admin-dashboard';
    return '/dashboard';
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tagline (Clickable) */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Tractor className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
              {t('nav.brand')}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">{t('nav.tagline')}</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => navigate(getDashboardPath())}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              ['/dashboard', '/farmer', '/buyer-dashboard', '/admin-dashboard'].includes(location.pathname)
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t('nav.dashboard')}</span>
          </button>

          <button
            onClick={() => navigate('/market-intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              location.pathname === '/market-intelligence'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('nav.marketIntelligence')}</span>
          </button>

          <button
            onClick={() => navigate('/price-forecast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              location.pathname === '/price-forecast'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('nav.priceForecast')}</span>
          </button>

          <button
            onClick={() => navigate('/buyer-matching')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              location.pathname === '/buyer-matching'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('nav.buyerMatching')}</span>
          </button>
        </nav>

        {/* Right Actions: Language Selector & User Profile */}
        <div className="flex items-center gap-3">
          <LanguageSelector />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white leading-none">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 capitalize leading-none mt-0.5">{user.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title={t('nav.logout')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              {t('nav.login')}
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
