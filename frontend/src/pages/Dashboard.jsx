import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  MailCheck,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dashboardApi, aiApi } from '../api/client';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AIModal } from '../components/AIModal';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getMetrics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleExplainAlert = async (alert) => {
    setAiLoading(true);
    try {
      const res = await aiApi.explainAlert({
        alert_id: alert.alert_id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        source: alert.source
      });
      setAiModalData(res.data);
      setAiModalOpen(true);
    } catch (err) {
      console.error('Failed to explain alert:', err);
      alert('Unable to load GenAI explanation at this moment.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p>Loading ThreatLens Intelligence...</p>
      </div>
    );
  }

  const m = data?.metrics || {
    total_logins: 0,
    successful_logins: 0,
    failed_logins: 0,
    suspicious_logins: 0,
    phishing_reports: 0,
    open_incidents: 0,
    critical_alerts: 0,
    health_score: 100
  };

  return (
    <div className="page-body">
      {/* Top Welcome Bar */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>Security Operations Center</h2>
          <p>
            Welcome, <strong>{user?.full_name}</strong> ({user?.role}). Real-time telemetry and threat intelligence.
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row (Calculated from Actual DB Records) */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Logins"
          value={m.total_logins}
          subtext={`${m.successful_logins} successful • ${m.failed_logins} failed`}
          icon={Activity}
          color="#2563eb"
          bg="#eff6ff"
        />
        <MetricCard
          title="Suspicious Logins"
          value={m.suspicious_logins}
          subtext="ML Anomaly Engine detections"
          icon={ShieldAlert}
          color="#f59e0b"
          bg="#fffbeb"
        />
        <MetricCard
          title="Phishing Reports"
          value={m.phishing_reports}
          subtext="Submitted employee emails"
          icon={MailCheck}
          color="#06b6d4"
          bg="#ecfeff"
        />
        <MetricCard
          title="Open Incidents"
          value={m.open_incidents}
          subtext="Active SANS/NIST response"
          icon={ShieldCheck}
          color="#8b5cf6"
          bg="#f5f3ff"
        />
        <MetricCard
          title="Critical Alerts"
          value={m.critical_alerts}
          subtext="Requires immediate triage"
          icon={AlertTriangle}
          color="#ef4444"
          bg="#fef2f2"
        />
        <MetricCard
          title="Security Health"
          value={`${m.health_score}%`}
          subtext={m.health_score >= 80 ? 'Optimal Defense Posture' : 'Elevated Threat State'}
          icon={HeartPulse}
          color={m.health_score >= 80 ? '#10b981' : '#f59e0b'}
          bg={m.health_score >= 80 ? '#ecfdf5' : '#fffbeb'}
        />
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Chart 1: Login Activity Trend */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="#2563eb" />
              <span>Authentication Activity (Past 7 Days)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Total vs Suspicious vs Failed</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={data?.activity_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSusp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Logins" />
                <Area type="monotone" dataKey="suspicious" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSusp)" name="Suspicious / Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Alert Severity Distribution */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <ShieldAlert size={18} color="#f59e0b" />
              <span>Alert Severity Distribution</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Risk Breakdown</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Two-Column Feeds: Recent Alerts & Recent Incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Recent Alerts Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="#ef4444" />
              <span>Recent Security Alerts</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('alerts')}>
              View All Alerts
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!data?.recent_alerts || data.recent_alerts.length === 0) ? (
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>No alerts logged.</p>
            ) : (
              data.recent_alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <SeverityBadge severity={alert.severity} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{alert.alert_id}</span>
                      <StatusBadge status={alert.status} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {alert.title}
                    </div>
                  </div>

                  <button
                    className="btn btn-ai btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={() => handleExplainAlert(alert)}
                    disabled={aiLoading}
                  >
                    <Sparkles size={13} />
                    <span>Explain AI</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Incidents Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={18} color="#2563eb" />
              <span>Active Response Incidents</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('incidents')}>
              Incident Management
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!data?.recent_incidents || data.recent_incidents.length === 0) ? (
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>No incidents declared.</p>
            ) : (
              data.recent_incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <StatusBadge status={inc.status} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{inc.incident_id}</span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {inc.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Assigned: {inc.assigned_to}
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={() => onNavigate('incidents')}
                  >
                    <span>Checklist</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* AI Explanation Modal */}
      <AIModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="Security Alert AI Analysis"
        data={aiModalData}
        type="alert"
      />
    </div>
  );
};
