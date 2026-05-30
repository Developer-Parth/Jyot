/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jaap from './pages/Jaap';
import PalmReading from './pages/PalmReading';
import Puja from './pages/Puja';
import PujaDetail from './pages/PujaDetail';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Subscription from './pages/Subscription';
import PrivacyPolicy from './pages/PrivacyPolicy';
import WishList from './pages/WishList';
import WishDetail from './pages/WishDetail';
import RecordWish from './pages/RecordWish';
import AdminDashboard from './pages/AdminDashboard';
import Help from './pages/Help';
import LiveBackground from './components/LiveBackground';
import { Analytics } from "@vercel/analytics/react"
import { getToken, clearToken, isAuthenticated as checkAuth } from './services/auth';

export default function App() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const onboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    setHasCompletedOnboarding(onboarding);
    setIsAuth(onboarding ? checkAuth() : false);
  }, []);

  if (isAuth === null || hasCompletedOnboarding === null) {
    return <div className="min-h-screen bg-orange-50 flex items-center justify-center">Loading...</div>;
  }

  const handleLogin = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('isAuthenticated');
    setIsAuth(false);
  };

  return (
    <>
      <Analytics />
      <LiveBackground />
      <BrowserRouter>
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {!hasCompletedOnboarding ? (
          <Route path="*" element={<Onboarding onComplete={() => {
            localStorage.setItem('hasCompletedOnboarding', 'true');
            setHasCompletedOnboarding(true);
          }} />} />
        ) : !isAuth ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/jaap" element={<Jaap />} />
            <Route path="/palm-reading" element={<PalmReading />} />
            <Route path="/puja" element={<Puja />} />
            <Route path="/puja/:id" element={<PujaDetail />} />
            <Route path="/wishes" element={<WishList />} />
            <Route path="/wish/:id" element={<WishDetail />} />
            <Route path="/record-wish" element={<RecordWish />} />
            <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
            <Route path="/help" element={<Help />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
    </>
  );
}
