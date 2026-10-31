import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Edit2,
  RefreshCw,
  PlusCircle,
  Sliders
} from 'lucide-react';
import { policiesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Policies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Policy Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPolicies = async () => {
    try {
      const res = await policiesApi.getPolicies();
      setPolicies(res.data);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleToggleEnforcement = async (policy) => {
    try {
      await policiesApi.updatePolicy(policy.id, { is_enforced: !policy.is_enforced });
      fetchPolicies();
    } catch (err) {
      console.error('Enforcement toggle failed:', err);
      alert('Error updating policy enforcement');
    }
  };

  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setEditValue(policy.value);
    setEditDesc(policy.description);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setSaving(true);
    try {
      await policiesApi.updatePolicy(selectedPolicy.id, {
        value: editValue,
        description: editDesc
      });
      setEditModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error('Policy update failed:', err);
      alert('Error saving policy changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Security Policy Governance & Rules</h2>
          <p>
            Enforce threshold parameters for anomaly detection, failed logins, geo-fencing, and phishing containment.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchPolicies}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading organization policies...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {policies.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {p.category}
                  </span>

                  {/* Enforcement Switch */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={p.is_enforced}
                      onChange={() => handleToggleEnforcement(p)}
                      disabled={!['Security Manager', 'Admin'].includes(user?.role)}
                    />
                    <span style={{ color: p.is_enforced ? '#059669' : '#94a3b8' }}>
                      {p.is_enforced ? 'Enforced' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
                  {p.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Active Threshold:
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                    {p.value}
                  </div>
                </div>

                {['Security Manager', 'Admin'].includes(user?.role) && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(p)}
                  >
                    <Sliders size={13} />
                    <span>Adjust</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Policy Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Sliders size={20} color="#2563eb" />
                <span>Adjust Policy: {selectedPolicy?.name}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Policy Parameter / Threshold Value</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    required
                  />
                  <small style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Defines the exact criteria used by the anomaly detector and quarantine engines.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Operational Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Policy Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
