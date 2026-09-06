import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MarketIntelligence from './pages/MarketIntelligence';
import PriceForecast from './pages/PriceForecast';
import BuyerMatching from './pages/BuyerMatching';
import CreateLot from './pages/CreateLot';
import Offers from './pages/Offers';
import Transactions from './pages/Transactions';
import Grievances from './pages/Grievances';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Role Dashboards */}
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Feature Modules */}
        <Route path="/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/price-forecast" element={<PriceForecast />} />
        <Route path="/buyer-matching" element={<BuyerMatching />} />
        <Route path="/create-lot" element={<CreateLot />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/grievances" element={<Grievances />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
