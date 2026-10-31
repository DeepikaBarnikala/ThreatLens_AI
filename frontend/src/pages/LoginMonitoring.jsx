import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle,
  XCircle,
  PlusCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { logsApi } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';

export const LoginMonitoring = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [onlyAnomalous, setOnlyAnomalous] = useState(false);

  // Simulation Modal
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simForm, setSimForm] = useState({
    username: 'sarah.ciso',
    ip_address: '185.220.101.44',
    location: 'Moscow, Russia',
    device: 'Linux x86_64 - Curl Bot',
    status: 'Failed',
    failed_attempts: 6
  });
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (search) params.username = search;
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      if (onlyAnomalous) params.is_anomalous = true;

      const res = await logsApi.getLogs(params);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load login logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, statusFilter, severityFilter, onlyAnomalous]);

  const handleApplyPreset = (preset) => {
    if (preset === 'normal') {
      setSimForm({
        username: user?.username || 'admin',
        ip_address: '192.168.10.55',
        location: 'Austin, TX - Campus LAN',
        device: 'MacBook Pro - Chrome',
        status: 'Success',
        failed_attempts: 0
      });
    } else if (preset === 'brute_force') {
      setSimForm({
        username: 'admin',
        ip_address: '185.220.101.99',
        location: 'Moscow, Russia',
        device: 'Python-urllib/3.10 Bot',
        status: 'Failed',
        failed_attempts: 7
      });
    } else if (preset === 'impossible_travel') {
      setSimForm({
        username: 'secmanager',
        ip_address: '102.89.44.12',
        location: 'Lagos, Nigeria',
        device: 'Generic Firefox / Linux',
        status: 'Failed',
        failed_attempts: 3
      });
    } else if (preset === 'off_hours') {
      setSimForm({
        username: 'employee',
        ip_address: '194.26.29.50',
        location: 'Bucharest, Romania',
        device: 'Kali Linux Tor Node',
        status: 'Failed',
        failed_attempts: 5
      });
    }
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    setSimulating(true);
    setSimResult(null);
    try {
      // Create actual log entry which automatically evaluates anomaly and creates alert if high/critical
      const res = await logsApi.createLog(simForm);
      setSimResult(res.data);
      fetchLogs();
    } catch (err) {
      console.error('Failed to simulate login:', err);
      alert('Simulation error.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Login Activity & Anomaly Monitoring</h2>
          <p>
            Continuous behavioral inspection utilizing Isolation Forest ML & heuristic threat velocity profiling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-ai btn-sm" onClick={() => { setSimModalOpen(true); setSimResult(null); }}>
            <PlusCircle size={14} />
            <span>Simulate Anomaly Scenario</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '150px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          className="form-control"
          style={{ width: '150px' }}
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="">All Severities</option>
          <option value="Low">Low (0-29)</option>
          <option value="Medium">Medium (30-49)</option>
          <option value="High">High (50-74)</option>
          <option value="Critical">Critical (75-100)</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyAnomalous}
            onChange={(e) => setOnlyAnomalous(e.target.checked)}
          />
          <ShieldAlert size={15} color="#ef4444" />
          <span>Show Anomalies Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>IP & Geolocation</th>
                <th>Device Signature</th>
                <th>Status</th>
                <th>Failures</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Detected Anomaly Flags</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading telemetry records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No login records matching filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let parsedReasons = [];
                  try {
                    parsedReasons = log.anomaly_reasons ? JSON.parse(log.anomaly_reasons) : [];
                  } catch (e) {
                    parsedReasons = log.anomaly_reasons ? [log.anomaly_reasons] : [];
                  }

                  return (
                    <tr key={log.id} style={{ backgroundColor: log.is_anomalous ? 'rgba(254, 242, 242, 0.4)' : undefined }}>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.username}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{log.location}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{log.ip_address}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.825rem', color: '#334155' }}>{log.device}</span>
                      </td>
                      <td>
                        {log.status === 'Success' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.825rem', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Success
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.825rem', fontWeight: 600 }}>
                            <XCircle size={14} /> Failed
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: log.failed_attempts >= 3 ? 700 : 400, color: log.failed_attempts >= 3 ? '#dc2626' : 'inherit' }}>
                          {log.failed_attempts}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{log.risk_score}</span>
                          <div style={{ width: '45px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${log.risk_score}%`,
                                height: '100%',
                                backgroundColor: log.risk_score >= 75 ? '#ef4444' : log.risk_score >= 50 ? '#f59e0b' : log.risk_score >= 30 ? '#3b82f6' : '#10b981'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <SeverityBadge severity={log.severity} />
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {parsedReasons.map((r, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.7rem',
                                background: log.is_anomalous ? '#fee2e2' : '#f1f5f9',
                                color: log.is_anomalous ? '#991b1b' : '#475569',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.login_time).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Simulation Modal */}
      {simModalOpen && (
        <div className="modal-overlay" onClick={() => setSimModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Sparkles size={20} color="#2563eb" />
                <span>Simulate Anomaly Scenario (Live ML Evaluation)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSimModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                Quickly test how the Isolation Forest ML model and rule heuristics score various login vectors.
              </p>

              {/* Presets */}
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Load Pre-configured Threat Scenario:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleApplyPreset('normal')}>
                    Normal Campus Access
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleApplyPreset('brute_force')}>
                    Brute-Force (Moscow)
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleApplyPreset('impossible_travel')}>
                    Impossible Travel (Nigeria)
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleApplyPreset('off_hours')}>
                    Off-Hours Tor Attack
                  </button>
                </div>
              </div>

              <form onSubmit={handleSimulateSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={simForm.username}
                      onChange={(e) => setSimForm({ ...simForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IP Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={simForm.ip_address}
                      onChange={(e) => setSimForm({ ...simForm, ip_address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location / Geolocation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={simForm.location}
                      onChange={(e) => setSimForm({ ...simForm, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Device Footprint</label>
                    <input
                      type="text"
                      className="form-control"
                      value={simForm.device}
                      onChange={(e) => setSimForm({ ...simForm, device: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Login Status</label>
                    <select
                      className="form-control"
                      value={simForm.status}
                      onChange={(e) => setSimForm({ ...simForm, status: e.target.value })}
                    >
                      <option value="Success">Success</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Failed Attempts Count</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      className="form-control"
                      value={simForm.failed_attempts}
                      onChange={(e) => setSimForm({ ...simForm, failed_attempts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }} disabled={simulating}>
                  {simulating ? 'Analyzing ML Vector...' : 'Execute Live Anomaly Evaluation'}
                </button>
              </form>

              {/* Simulation Output Card */}
              {simResult && (
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: simResult.is_anomalous ? '#fef2f2' : '#ecfdf5', border: `1px solid ${simResult.is_anomalous ? '#fecaca' : '#a7f3d0'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SeverityBadge severity={simResult.severity} />
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: simResult.is_anomalous ? '#991b1b' : '#065f46' }}>
                        Risk Score: {simResult.risk_score} / 100
                      </span>
                    </div>
                    {simResult.is_anomalous && (
                      <span className="badge badge-critical">Auto-Alert Triggered</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: simResult.is_anomalous ? '#7f1d1d' : '#047857' }}>
                    <strong>Evaluated Reasons:</strong>
                    <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                      {JSON.parse(simResult.anomaly_reasons || '[]').map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
