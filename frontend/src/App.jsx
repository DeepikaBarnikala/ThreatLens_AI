
import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import Register from './pages/Register';

import { Dashboard } from './pages/Dashboard';
import { LoginMonitoring } from './pages/LoginMonitoring';
import { Alerts } from './pages/Alerts';
import { PhishingDetection } from './pages/PhishingDetection';
import { Incidents } from './pages/Incidents';
import { AIAssistant } from './pages/AIAssistant';
import { Devices } from './pages/Devices';
import { Policies } from './pages/Policies';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';

export const MainApp = () => {

  const { user, isAuthenticated, loading } = useAuth();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setShowRegister(false);
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <span>Loading ThreatLens AI…</span>
      </div>
    );
  }

  // Show registration page
  if (!isAuthenticated && showRegister) {
    return (
      <Register
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  // Show login page
  if (!isAuthenticated) {
    return (
      <Login
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  const pageTitles = {
    dashboard: 'Security Operations Dashboard',
    logs: 'Login Activity & Anomaly Monitoring',
    alerts: 'Security Alert Management & AI Triage',
    phishing: 'AI Phishing Email Detection',
    incidents: 'Incident Response & NIST Guidance',
    'ai-assistant': 'AI Security Copilot & Advisory',
    devices: 'Authorized Device & Endpoint Registry',
    policies: 'Security Policy Management',
    reports: 'Executive Management Security Reports',
    users: 'Organizational User Management'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'logs':
        return <LoginMonitoring />;
      case 'alerts':
        return <Alerts onNavigate={setCurrentPage} />;
      case 'phishing':
        return <PhishingDetection />;
      case 'incidents':
        return <Incidents />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'devices':
        return <Devices />;
      case 'policies':
        return <Policies />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <div className="main-layout">
        <Navbar
          pageTitle={pageTitles[currentPage] || 'ThreatLens AI'}
        />

        {renderPage()}
      </div>
    </div>
  );
};

export default function App() {
  return <MainApp />;
}
