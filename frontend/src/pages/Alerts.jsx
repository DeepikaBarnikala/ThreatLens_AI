import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  ArrowUpRight,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { alertsApi, aiApi } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { AIModal } from '../components/AIModal';
import { useAuth } from '../context/AuthContext';

export const Alerts = ({ onNavigate }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Escalation Modal
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [escalateForm, setEscalateForm] = useState({
    title: '',
    incident_type: 'Suspicious account access',
    assigned_to: user?.full_name || 'IT Administrator'
  });
  const [escalating, setEscalating] = useState(false);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await alertsApi.getAlerts(params);
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [search, severityFilter, statusFilter]);

  const handleResolve = async (alertId) => {
    try {
      await alertsApi.updateAlert(alertId, { status: 'Resolved' });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      alert('Error updating alert status');
    }
  };

  const handleExplainAI = async (alert) => {
    setAiLoading(true);
    try {
      const res = await aiApi.explainAlert({
        alert_id: alert.alert_id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        source: alert.source
      });
      setAiData(res.data);
      setAiModalOpen(true);
    } catch (err) {
      console.error('AI explanation failed:', err);
      alert('Unable to generate AI explanation.');
    } finally {
      setAiLoading(false);
    }
  };

  const openEscalateModal = (alert) => {
    setSelectedAlert(alert);
    setEscalateForm({
      title: `Incident Response: ${alert.title}`,
      incident_type: alert.title.toLowerCase().includes('phishing') ? 'Phishing email attack' : 'Suspicious account access',
      assigned_to: user?.full_name || 'Alex Rivera (IT Lead)'
    });
    setEscalateModalOpen(true);
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setEscalating(true);
    try {
      await alertsApi.escalateAlert(selectedAlert.id, escalateForm);
      setEscalateModalOpen(false);
      fetchAlerts();
      if (onNavigate) {
        onNavigate('incidents');
      }
    } catch (err) {
      console.error('Escalation failed:', err);
      alert('Error escalating alert to incident');
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Security Alert Triage</h2>
          <p>
            Review automated threat signals, investigate with Generative AI, and escalate critical alerts to structured response incidents.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAlerts}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search alerts by title, ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '160px' }}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          className="form-control"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Investigating">Investigating</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Alerts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Severity</th>
                <th>Alert Title & Description</th>
                <th>Detection Source</th>
                <th>Status</th>
                <th>Assigned Lead</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading security alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No alerts found.
                  </td>
                </tr>
              ) : (
                alerts.map((alt) => (
                  <tr key={alt.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#2563eb' }}>
                        {alt.alert_id}
                      </span>
                    </td>
                    <td>
                      <SeverityBadge severity={alt.severity} />
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                        {alt.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                        {alt.description}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                        {alt.source}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={alt.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#334155' }}>
                        {alt.assigned_to || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(alt.timestamp).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-ai btn-sm"
                          onClick={() => handleExplainAI(alt)}
                          disabled={aiLoading}
                          title="Generate AI explanation for IT Admin"
                        >
                          <Sparkles size={13} />
                          <span>Explain AI</span>
                        </button>

                        {alt.status !== 'Resolved' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEscalateModal(alt)}
                              title="Escalate Alert to Formal Incident"
                            >
                              <ArrowUpRight size={13} />
                              <span>Escalate</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleResolve(alt.id)}
                              title="Mark as Resolved"
                              style={{ color: '#059669' }}
                            >
                              <CheckCircle size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation to Incident Modal */}
      {escalateModalOpen && (
        <div className="modal-overlay" onClick={() => setEscalateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <ArrowUpRight size={20} color="#2563eb" />
                <span>Escalate Alert to Incident</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEscalateModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleEscalateSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                  Escalating this alert automatically initializes an NIST 7-phase response checklist and creates an incident audit timeline.
                </p>

                <div className="form-group">
                  <label className="form-label">Incident Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={escalateForm.title}
                    onChange={(e) => setEscalateForm({ ...escalateForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Classification Type</label>
                  <select
                    className="form-control"
                    value={escalateForm.incident_type}
                    onChange={(e) => setEscalateForm({ ...escalateForm, incident_type: e.target.value })}
                  >
                    <option value="Brute-force login attack">Brute-force login attack</option>
                    <option value="Suspicious account access">Suspicious account access</option>
                    <option value="Phishing email attack">Phishing email attack</option>
                    <option value="Unknown device login">Unknown device login</option>
                    <option value="Credential Compromise">Credential Compromise</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Response Lead</label>
                  <input
                    type="text"
                    className="form-control"
                    value={escalateForm.assigned_to}
                    onChange={(e) => setEscalateForm({ ...escalateForm, assigned_to: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEscalateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={escalating}>
                  {escalating ? 'Initializing NIST Plan...' : 'Escalate & Open Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      <AIModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="Security Alert AI Analysis"
        data={aiData}
        type="alert"
      />
    </div>
  );
};
