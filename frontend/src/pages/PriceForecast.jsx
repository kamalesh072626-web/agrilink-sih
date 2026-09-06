import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Sparkles,
  Brain,
  Target,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceForecast() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  // Fetch forecast data from Flask API
  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/predict?crop=Tomato');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const json = await response.json();
      if (json.success) {
        setForecastData(json.data);
      } else {
        throw new Error(json.error || 'Forecast failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  // Derive chart data once forecast is available
  const historical = forecastData?.historical || [];
  const forecast = forecastData?.forecast || [];

  // Build Chart.js configuration
  const allLabels = [
    ...historical.map((p) => p.date_str),
    ...forecast.map((p) => p.date_str)
  ];

  // Historical prices array (with nulls for forecast region)
  const historicalPrices = [
    ...historical.map((p) => p.price),
    // Overlap: connect last historical point to first forecast point
    ...forecast.map(() => null)
  ];

  // Forecast prices array (with nulls for historical region, bridge at connection)
  const forecastPrices = [
    ...historical.slice(0, -1).map(() => null),
    // Bridge: start from last historical price
    historical.length > 0 ? historical[historical.length - 1].price : null,
    ...forecast.map((p) => p.price)
  ];

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Historical Price (₹/q)',
        data: historicalPrices,
        borderColor: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.08)',
        borderWidth: 2.5,
        pointRadius: 1.5,
        pointHoverRadius: 5,
        pointBackgroundColor: '#64748b',
        tension: 0.3,
        fill: true,
        spanGaps: false
      },
      {
        label: '7-Day AI Forecast (₹/q)',
        data: forecastPrices,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        borderWidth: 3,
        borderDash: [8, 5],
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
        spanGaps: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
          usePointStyle: true,
          pointStyleWidth: 20,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        callbacks: {
          label: function (context) {
            if (context.parsed.y !== null) {
              return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
            }
            return null;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 15
        }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)', drawBorder: false },
        ticks: {
          color: '#64748b',
          font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" },
          callback: function (value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  // Determine recommendation styling
  const recommendation = forecastData?.recommendation || '';
  const isWait = recommendation.includes('WAIT');
  const recBadgeColor = isWait
    ? 'bg-amber-500 text-slate-950'
    : 'bg-emerald-500 text-slate-950';
  const recBorderColor = isWait
    ? 'border-amber-500/50'
    : 'border-emerald-500/50';
  const recBgColor = isWait
    ? 'bg-amber-950/30'
    : 'bg-emerald-950/30';

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
                AI Price Forecasting Engine
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Scikit-Learn
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                30-Day Historical Analysis + 7-Day LinearRegression Forecast for {forecastData?.crop || 'Tomato'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchForecast}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}. Ensure <code className="bg-rose-900/50 px-1 py-0.5 rounded font-mono">python app.py</code> is running.</span>
          </div>
        )}

        {/* Top KPI Cards */}
        {forecastData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-slate-500" /> Current Price (Day 30)
              </div>
              <div className="text-2xl font-extrabold text-white">
                ₹{forecastData.current_price?.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Per quintal • {forecastData.crop}</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5" /> Predicted Price (Day 37)
              </div>
              <div className="text-2xl font-extrabold text-emerald-300">
                ₹{forecastData.predicted_7_day_price?.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 mt-1">7-day forecast endpoint</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-1">
                {forecastData.price_gain_percent >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )} Expected Change
              </div>
              <div className={`text-2xl font-extrabold ${
                forecastData.price_gain_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {forecastData.price_gain_percent >= 0 ? '+' : ''}{forecastData.price_gain_percent}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {forecastData.price_gain_percent >= 0 ? '+' : ''}₹{forecastData.price_gain_absolute?.toFixed(2)}/q
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Brain className="w-3.5 h-3.5 text-violet-400" /> Model Quality (R²)
              </div>
              <div className="text-2xl font-extrabold text-violet-300">
                {forecastData.model_score_r2}
              </div>
              <div className="text-xs text-slate-400 mt-1">{forecastData.model_type}</div>
            </div>
          </div>
        )}

        {/* Chart + Recommendation Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart Panel (2/3 width on large screens) */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Tomato Mandi Price Trend — Nashik Region</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  30-day history (solid) + 7-day AI forecast (dashed green)
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-slate-500 rounded" />
                  <span className="text-slate-400">Historical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-emerald-500 rounded border-dashed border-b border-emerald-500" style={{ borderStyle: 'dashed' }} />
                  <span className="text-emerald-400">Forecast</span>
                </div>
              </div>
            </div>

            <div className="h-[380px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading chart data...
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          {/* AI Recommendation Card (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* Primary Recommendation Card */}
            {forecastData && (
              <div className={`rounded-2xl border-2 ${recBorderColor} ${recBgColor} p-6 shadow-xl flex-1 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    AI Selling Recommendation
                  </div>

                  {/* Big Badge */}
                  <div className={`inline-block px-5 py-2.5 rounded-xl text-lg font-extrabold ${recBadgeColor} shadow-lg mb-4`}>
                    {forecastData.recommendation}
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Expected Gain</div>
                      <div className={`text-xl font-extrabold ${
                        forecastData.price_gain_percent >= 0 ? 'text-emerald-300' : 'text-rose-300'
                      }`}>
                        {forecastData.price_gain_percent >= 0 ? '+' : ''}₹{forecastData.price_gain_absolute?.toFixed(2)}/q
                        <span className="text-sm font-semibold text-slate-300 ml-1">
                          ({forecastData.price_gain_percent >= 0 ? '+' : ''}{forecastData.price_gain_percent}%)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Confidence Score</div>
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-extrabold text-white">
                          {forecastData.confidence_score}%
                        </div>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${forecastData.confidence_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context Summary */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    {forecastData.recommendation_reason}
                  </div>
                </div>
              </div>
            )}

            {/* Model Info Badge */}
            {forecastData && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Brain className="w-4 h-4 text-violet-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-300">Model: {forecastData.model_type}</div>
                    <div className="mt-0.5">
                      Features: Day Index + Arrival Volume • R² Score: {forecastData.model_score_r2}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Forecast Data Table */}
        {forecastData && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">7-Day Price Forecast Detail</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Predicted prices and arrival volumes for the upcoming week
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-emerald-400">Predicted Price (₹/q)</th>
                    <th className="py-3 px-4">Est. Arrivals (q)</th>
                    <th className="py-3 px-4">vs Current Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {forecast.map((pt) => {
                    const diff = pt.price - forecastData.current_price;
                    const diffPct = ((diff / forecastData.current_price) * 100).toFixed(1);
                    const isUp = diff >= 0;

                    return (
                      <tr key={pt.day} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200">Day {pt.day}</td>
                        <td className="py-3 px-4 text-slate-400">{pt.date_str}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-300">
                          ₹{pt.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {pt.arrivals.toFixed(0)} q
                        </td>
                        <td className={`py-3 px-4 font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}₹{diff.toFixed(2)} ({isUp ? '+' : ''}{diffPct}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
