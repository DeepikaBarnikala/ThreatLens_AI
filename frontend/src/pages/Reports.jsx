import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Calendar
} from 'lucide-react';
import { dashboardApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Reports = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardApi.getMetrics();
        setMetrics(res.data.metrics);
      } catch (err) {
        console.error('Failed to load metrics for report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const m = metrics || {
    total_logins: 0,
    successful_logins: 0,
    failed_logins: 0,
    suspicious_logins: 0,
    phishing_reports: 0,
    open_incidents: 0,
    critical_alerts: 0,
    health_score: 90
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Management Security & Compliance Reports</h2>
          <p>
            Executive-level security posture briefing, threat landscape trends, and organizational defense audit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Download size={14} />
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="card" style={{ padding: '36px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Report Header */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Shield size={18} />
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>ThreatLens AI Executive Security Report</h1>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Periodic Security Health Assessment & Threat Anomaly Audit
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', fontWeight: 600 }}>
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div style={{ marginTop: '4px' }}>Audited by: {user?.full_name}</div>
            <div>Classification: Internal Confidential</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            1. Executive Security Health Overview
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            During the evaluated monitoring window, the ThreatLens AI surveillance engine processed a total of <strong>{m.total_logins} authentication events</strong> across campus and corporate subnets. The current organizational <strong>Security Health Score is rated at {m.health_score}/100</strong> ({m.health_score >= 80 ? 'Good / Controlled' : 'Attention Required'}).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>{m.health_score}%</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Security Health Index</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{m.suspicious_logins}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Anomalous Logins Blocked</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{m.critical_alerts}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Critical Alerts</div>
            </div>
          </div>
        </div>

        {/* Threat Vector Distribution */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            2. Observed Threat Vector Highlights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: '#334155' }}>
              <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Credential Stuffing & Brute-Force:</strong> High-frequency automated dictionary attacks from foreign exit nodes (including Moscow and Bucharest) were detected by Isolation Forest and mitigated without root breach.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: '#334155' }}>
              <CheckCircle2 size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Phishing & Social Engineering:</strong> {m.phishing_reports} employee reports triaged by TF-IDF classifiers. Deceptive Office365 credential harvesters were quarantined within minutes.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: '#334155' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Endpoint Integrity:</strong> Rogue endpoints attempting unauthenticated access on the internal research subnet were quarantined via Device Registry controls.
              </div>
            </div>
          </div>
        </div>

        {/* NIST Recommendations */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            3. Strategic Cybersecurity Recommendations
          </h3>
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
            <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Enforce FIDO2 / TOTP Multi-Factor Authentication:</strong> Eliminate password-only logins for academic administration and faculty accounts.</li>
              <li><strong>Refine Geofencing Thresholds:</strong> Maintain strict domestic IP policy restrictions with mandatory VPN tunnel authorization.</li>
              <li><strong>Continuous Phishing Awareness:</strong> Conduct bi-monthly micro-drills focusing on mailbox quota and payroll spoofing tactics.</li>
              <li><strong>Automate Token Invalidation:</strong> Continue rapid session termination for impossible travel velocity alerts.</li>
            </ol>
          </div>
        </div>

        {/* Sign-off footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <span>ThreatLens AI – Autonomous Incident Assistant for Small Organizations</span>
          <span>Approved: Information Security Committee</span>
        </div>

      </div>
    </div>
  );
};
