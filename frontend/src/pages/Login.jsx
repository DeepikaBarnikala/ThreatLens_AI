import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = ({ onRegister }) => {
  const { login, quickLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(roleKey);
    } catch (err) {
      setError('Demo authentication failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      roleKey: 'admin',
      title: 'Sarah Chen',
      role: 'Admin / CISO',
      dept: 'Executive Security',
      desc: 'Full administrative access, user directory, policies & audit trails.'
    },
    {
      roleKey: 'secmanager',
      title: 'Marcus Vance',
      role: 'Security Manager',
      dept: 'SOC Operations',
      desc: 'SOC leadership, high-level metrics, policy oversight & security reporting.'
    },
    {
      roleKey: 'itadmin',
      title: 'Alex Rivera',
      role: 'IT Administrator',
      dept: 'IT Infrastructure',
      desc: 'Anomaly monitoring, alert triage, NIST checklist incident remediation.'
    },
    {
      roleKey: 'employee',
      title: 'Emma Watson',
      role: 'Employee / Staff',
      dept: 'Academic Operations',
      desc: 'Submit phishing emails for AI scanning, check personal device status.'
    }
  ];

  return (
    <main className="auth-page">
      <div className="auth-layout">
        
        {/* Left: Branding & Value Proposition */}
        <section className="auth-intro">
          <div className="auth-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div className="auth-brand-mark" style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)'
            }}>
              <Shield size={28} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>ThreatLens AI</h1>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                AI-Powered Security Operations Platform
              </span>
            </div>
          </div>

          <p className="auth-lead" style={{ color: '#94a3b8', fontSize: '1.025rem', lineHeight: 1.6, marginBottom: '28px' }}>
            Designed for colleges, universities, and small organizations without dedicated SOC teams.
            Autonomous login anomaly detection, instant phishing triage, and NIST 7-phase incident guidance powered by Generative AI.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.875rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4' }}></div>
              <span>Machine Learning Behavioral Anomaly Engine (Isolation Forest)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.875rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
              <span>TF-IDF + Heuristic Phishing Classifier with Confidence Scoring</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.875rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              <span>Generative AI Security Copilot & NIST Response Guidance</span>
            </div>
          </div>

          {/* Quick Demo Role Cards */}
          <div style={{ marginTop: '32px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Quick Demo 1-Click Access
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.roleKey}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(acc.roleKey)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#38bdf8' }}>{acc.role}</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{acc.title}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Login Form Card */}
        <section className="auth-card" aria-labelledby="login-title" style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          border: '1px solid #e2e8f0'
        }}>
          <div className="auth-card-icon"><Lock size={19} /></div>
          <p className="auth-kicker">SECURE ACCESS</p>
          <h2 id="login-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Sign In to ThreatLens AI
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
            Enter your credentials or click any demo account on the left.
          </p>

          {error && (
            <div className="auth-error" role="alert" style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username or Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-username"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="admin or admin@threatlens.ai"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
            <span style={{ fontWeight: 700 }}>Demo Password for all accounts:</span> <code style={{ color: '#2563eb', fontWeight: 600 }}>Admin@123</code>
          </div>
          <div className="auth-footer">
            <span>New to ThreadLens AI?</span>
            <button type="button" className="auth-link" onClick={onRegister}>
              Create an account <ArrowRight size={15} />
            </button>
          </div>
        </section>

      </div>
    </main>
  );
};
