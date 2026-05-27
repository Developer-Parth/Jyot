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
import LiveBackground from './components/LiveBackground';
import { Analytics } from "@vercel/analytics/next"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const onboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    setIsAuthenticated(auth);
    setHasCompletedOnboarding(onboarding);
  }, []);

  if (isAuthenticated === null || hasCompletedOnboarding === null) {
    return <div className="min-h-screen bg-orange-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <LiveBackground />
      <BrowserRouter>
      <Routes>
        {!hasCompletedOnboarding ? (
          <Route path="*" element={<Onboarding onComplete={() => {
            localStorage.setItem('hasCompletedOnboarding', 'true');
            setHasCompletedOnboarding(true);
          }} />} />
        ) : !isAuthenticated ? (
          <Route path="*" element={<Login onLogin={(userId) => {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userId', String(userId));
            setIsAuthenticated(true);
          }} />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/jaap" element={<Jaap />} />
            <Route path="/palm-reading" element={<PalmReading />} />
            <Route path="/puja" element={<Puja />} />
            <Route path="/puja/:id" element={<PujaDetail />} />
            <Route path="/profile" element={<Profile onLogout={() => {
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('userId');
              setIsAuthenticated(false);
            }} />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
    </>
  );
}
