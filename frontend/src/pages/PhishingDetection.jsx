import React, { useState, useEffect } from 'react';
import {
  MailCheck,
  Send,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Link,
  User,
  FileText,
  Clock,
  HelpCircle
} from 'lucide-react';
import { phishingApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { AIModal } from '../components/AIModal';
import { useAuth } from '../context/AuthContext';

export const PhishingDetection = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    subject: '',
    sender_address: '',
    email_content: '',
    suspicious_url: ''
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // AI Modal for past reports
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await phishingApi.getReports();
      setPastReports(res.data);
    } catch (err) {
      console.error('Failed to load phishing reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLoadSample = (sampleType) => {
    if (sampleType === 'office365') {
      setForm({
        subject: 'URGENT: Microsoft 365 Password Expiration in 24 Hours',
        sender_address: 'support-admin@it-microsoft-portal.xyz',
        email_content: 'Your corporate Microsoft 365 password will expire today. To keep your current password and prevent mailbox deactivation, verify your credentials here: https://it-microsoft-portal.xyz/login-verify',
        suspicious_url: 'https://it-microsoft-portal.xyz/login-verify'
      });
    } else if (sampleType === 'payroll') {
      setForm({
        subject: 'Action Required: Payroll Direct Deposit Error',
        sender_address: 'payroll-department@mail-service.top',
        email_content: 'We could not process your semi-monthly direct deposit. Confirm your employee portal credentials and update your banking PIN at: http://192.168.1.100/payroll',
        suspicious_url: 'http://192.168.1.100/payroll'
      });
    } else if (sampleType === 'suspicious') {
      setForm({
        subject: 'FedEx: Package pending customs clearance verification',
        sender_address: 'tracking@delivery-notice-express.com',
        email_content: 'Your shipment is delayed at the distribution facility. Review tracking invoice and confirm your phone number and address.',
        suspicious_url: 'http://bit.ly/track-pkg-992'
      });
    } else if (sampleType === 'legit') {
      setForm({
        subject: 'Campus Department Colloquium Schedule - Next Friday',
        sender_address: 'dean-office@threatlens.ai',
        email_content: 'Good morning everyone, please find the speaker lineup and abstracts for next week’s academic seminar in Hall 102. Lunch will be provided.',
        suspicious_url: ''
      });
    }
    setCurrentResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.sender_address || !form.email_content) {
      alert('Please fill in Subject, Sender Address, and Email Content.');
      return;
    }

    setAnalyzing(true);
    setCurrentResult(null);
    try {
      const res = await phishingApi.analyze(form);
      setCurrentResult(res.data);
      fetchReports();
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('Error analyzing email submission.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewAiDetails = (report) => {
    try {
      const parsed = report.ai_explanation ? JSON.parse(report.ai_explanation) : null;
      if (parsed) {
        setAiModalData(parsed);
        setAiModalOpen(true);
      }
    } catch (e) {
      console.error('Error parsing AI explanation:', e);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>AI Phishing Email Detection & Triage</h2>
          <p>
            Machine learning content analysis (TF-IDF + Logistic Regression) paired with deceptive domain and psychological pressure heuristics.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left: Email Submission Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MailCheck size={18} color="#2563eb" />
              <span>Submit Email for Security Inspection</span>
            </div>
          </div>

          {/* Quick-load Samples */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Load Demo Test Samples:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLoadSample('office365')}>
                Office365 Quota (Phish)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLoadSample('payroll')}>
                Direct Deposit (Phish)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLoadSample('suspicious')}>
                FedEx Notice (Suspicious)
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleLoadSample('legit')}>
                Campus Seminar (Legit)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Subject Line</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. URGENT: Action required on your account"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Sender Address / Header</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. support@it-portal.xyz"
                  value={form.sender_address}
                  onChange={(e) => setForm({ ...form, sender_address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Embedded Link / URL (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. http://192.168.1.50/login"
                  value={form.suspicious_url}
                  onChange={(e) => setForm({ ...form, suspicious_url: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Body Content</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Paste the full email text here for semantic and psychological pressure inspection..."
                value={form.email_content}
                onChange={(e) => setForm({ ...form, email_content: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-ai"
              style={{ width: '100%', padding: '12px' }}
              disabled={analyzing}
            >
              <Sparkles size={16} />
              <span>{analyzing ? 'Inspecting ML Vectors & Domain...' : 'Analyze Email Security Risk'}</span>
            </button>
          </form>
        </div>

        {/* Right: Real-time Analysis Outcome */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} color="#06b6d4" />
              <span>Inspection Outcome & Threat Intelligence</span>
            </div>
          </div>

          {!currentResult ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <MailCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Awaiting Email Submission</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Fill out the form or select a test sample to view predictions, confidence scores, and GenAI safe response guidance.
              </p>
            </div>
          ) : (
            <div>
              {/* Verdict Header */}
              <div style={{
                padding: '18px',
                borderRadius: '10px',
                marginBottom: '20px',
                backgroundColor: currentResult.prediction === 'Phishing' ? '#fef2f2' : currentResult.prediction === 'Suspicious' ? '#fffbeb' : '#ecfdf5',
                border: `1px solid ${currentResult.prediction === 'Phishing' ? '#fecaca' : currentResult.prediction === 'Suspicious' ? '#fde68a' : '#a7f3d0'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: currentResult.prediction === 'Phishing' ? '#b91c1c' : currentResult.prediction === 'Suspicious' ? '#b45309' : '#047857'
                  }}>
                    {currentResult.prediction.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                    {currentResult.report_id}
                  </span>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    <span>ML Confidence Score</span>
                    <span>{currentResult.confidence_score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${currentResult.confidence_score}%`,
                        height: '100%',
                        backgroundColor: currentResult.prediction === 'Phishing' ? '#ef4444' : currentResult.prediction === 'Suspicious' ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Detected Reasons */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Why Was This Flagged?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentResult.reasons?.map((reason, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                      <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                  Recommended Action
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {currentResult.recommended_action}
                </p>
              </div>

              {/* GenAI Technical Breakdown Button */}
              {currentResult.ai_explanation && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => {
                    try {
                      setAiModalData(JSON.parse(currentResult.ai_explanation));
                      setAiModalOpen(true);
                    } catch (e) {}
                  }}
                >
                  <Sparkles size={14} color="#0284c7" />
                  <span>View GenAI Technical & Employee Guidance</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Historical Submissions Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '20px 24px 12px 24px', marginBottom: 0 }}>
          <div className="card-title">
            <Clock size={18} color="#2563eb" />
            <span>Phishing Submission History</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Submitted By</th>
                <th>Subject Line</th>
                <th>Sender Header</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th style={{ textAlign: 'right' }}>Intelligence</th>
              </tr>
            </thead>
            <tbody>
              {loadingReports ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Loading past submissions...
                  </td>
                </tr>
              ) : pastReports.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No reports submitted yet.
                  </td>
                </tr>
              ) : (
                pastReports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#2563eb' }}>
                        {r.report_id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.submitted_by}</span>
                    </td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.subject}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {r.sender_address}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        backgroundColor: r.prediction === 'Phishing' ? '#fee2e2' : r.prediction === 'Suspicious' ? '#fef3c7' : '#dcfce7',
                        color: r.prediction === 'Phishing' ? '#991b1b' : r.prediction === 'Suspicious' ? '#b45309' : '#15803d'
                      }}>
                        {r.prediction}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.confidence_score}%</span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewAiDetails(r)}
                      >
                        <Sparkles size={12} color="#0284c7" />
                        <span>AI Insights</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Explanation Modal */}
      <AIModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="Phishing Threat Intelligence"
        data={aiModalData}
        type="phishing"
      />
    </div>
  );
};
