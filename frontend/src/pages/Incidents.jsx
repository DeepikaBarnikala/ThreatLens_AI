import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  User,
  Filter,
  RefreshCw,
  Send,
  Sparkles,
  ChevronRight,
  Shield,
  FileCheck
} from 'lucide-react';
import { incidentsApi } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Incidents = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // New Incident Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    incident_type: 'Brute-force login attack',
    severity: 'High',
    description: '',
    assigned_to: user?.full_name || 'Alex Rivera (IT Lead)'
  });
  const [creating, setCreating] = useState(false);

  // New Action Form
  const [actionText, setActionText] = useState('');
  const [actionType, setActionType] = useState('note');
  const [addingAction, setAddingAction] = useState(false);

  const fetchIncidents = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await incidentsApi.getIncidents(params);
      setIncidents(res.data);
      if (res.data.length > 0 && !selectedIncident) {
        setSelectedIncident(res.data[0]);
      } else if (selectedIncident) {
        const updated = res.data.find(i => i.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident) return;
    try {
      const res = await incidentsApi.updateIncident(selectedIncident.id, { status: newStatus });
      setSelectedIncident(res.data);
      fetchIncidents();
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Error updating incident status');
    }
  };

  const handleToggleChecklist = async (itemId) => {
    if (!selectedIncident) return;
    try {
      let currentChecklist = [];
      try {
        currentChecklist = JSON.parse(selectedIncident.checklist || '[]');
      } catch (e) {}

      const updated = currentChecklist.map(item => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });

      const res = await incidentsApi.updateIncident(selectedIncident.id, {
        checklist: JSON.stringify(updated)
      });
      setSelectedIncident(res.data);
      fetchIncidents();
    } catch (err) {
      console.error('Failed to update checklist item:', err);
    }
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!actionText || !selectedIncident) return;
    setAddingAction(true);
    try {
      await incidentsApi.addAction(selectedIncident.id, {
        action_text: actionText,
        action_type: actionType
      });
      setActionText('');
      // Refresh selected incident details
      const refreshed = await incidentsApi.getIncident(selectedIncident.id);
      setSelectedIncident(refreshed.data);
      fetchIncidents();
    } catch (err) {
      console.error('Failed to append action:', err);
      alert('Error recording incident action');
    } finally {
      setAddingAction(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await incidentsApi.createIncident(createForm);
      setCreateModalOpen(false);
      setCreateForm({
        title: '',
        incident_type: 'Brute-force login attack',
        severity: 'High',
        description: '',
        assigned_to: user?.full_name || 'Alex Rivera (IT Lead)'
      });
      fetchIncidents();
      setSelectedIncident(res.data);
    } catch (err) {
      console.error('Incident creation failed:', err);
      alert('Error creating incident');
    } finally {
      setCreating(false);
    }
  };

  // Calculate checklist progress
  let checklistItems = [];
  try {
    checklistItems = JSON.parse(selectedIncident?.checklist || '[]');
  } catch (e) {}

  const completedCount = checklistItems.filter(i => i.completed).length;
  const progressPercent = checklistItems.length > 0 ? Math.round((completedCount / checklistItems.length) * 100) : 0;

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Incident Response & SANS/NIST Workflow</h2>
          <p>
            Structured 7-phase containment checklist and forensic audit timeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchIncidents}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
            <PlusCircle size={14} />
            <span>Declare Incident</span>
          </button>
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Incidents List */}
        <div className="card" style={{ padding: '16px', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              Incidents Registry ({incidents.length})
            </span>
            <select
              className="form-control"
              style={{ width: '130px', padding: '4px 8px', fontSize: '0.78rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Contained">Contained</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading incidents...</p>
            ) : incidents.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No incidents logged.</p>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                        {inc.incident_id}
                      </span>
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                      {inc.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <StatusBadge status={inc.status} />
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {inc.assigned_to?.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Incident Deep-Dive */}
        {selectedIncident ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Incident Header Card */}
            <div className="card">
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.95rem', color: '#2563eb' }}>
                      {selectedIncident.incident_id}
                    </span>
                    <SeverityBadge severity={selectedIncident.severity} />
                    <span style={{ fontSize: '0.8rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {selectedIncident.incident_type}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedIncident.title}
                  </h3>
                </div>

                {/* Status Switcher Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</span>
                  <select
                    className="form-control"
                    style={{ width: '150px', fontWeight: 600 }}
                    value={selectedIncident.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Contained">Contained</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, marginBottom: '14px' }}>
                {selectedIncident.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div><strong>Assigned:</strong> {selectedIncident.assigned_to}</div>
                <div><strong>Declared:</strong> {new Date(selectedIncident.created_at).toLocaleString()}</div>
                {selectedIncident.alert_id && <div><strong>Origin Alert:</strong> {selectedIncident.alert_id}</div>}
              </div>
            </div>

            {/* NIST 7-Phase Incident Response Checklist */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <FileCheck size={18} color="#2563eb" />
                    <span>NIST 7-Phase Incident Response Checklist</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Standard Operating Procedure: check items as containment progresses
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#2563eb' }}>
                    {completedCount} of {checklistItems.length} Steps Complete ({progressPercent}%)
                  </span>
                  <div style={{ width: '140px', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: progressPercent === 100 ? '#10b981' : '#2563eb',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: item.completed ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${item.completed ? '#bbf7d0' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px', color: item.completed ? '#10b981' : '#94a3b8' }}>
                      {item.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: item.completed ? '#047857' : '#2563eb',
                          background: item.completed ? '#dcfce7' : '#eff6ff',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Phase {item.id}: {item.phase}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: item.completed ? '#1e293b' : '#0f172a', textDecoration: item.completed ? 'line-through' : 'none' }}>
                          {item.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Actions Timeline Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Clock size={18} color="#06b6d4" />
                  <span>Incident Action Timeline & Audit Trail</span>
                </div>
              </div>

              {/* Action submission form */}
              <form onSubmit={handleAddAction} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="form-control"
                    style={{ width: '150px' }}
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option value="note">Investigator Note</option>
                    <option value="containment">Containment Step</option>
                    <option value="status_change">Milestone Update</option>
                  </select>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Log an action taken, evidence captured, or remediation note..."
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    required
                  />

                  <button type="submit" className="btn btn-primary" disabled={addingAction}>
                    <Send size={14} />
                    <span>Log Action</span>
                  </button>
                </div>
              </form>

              {/* Timeline list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '2px solid #e2e8f0', paddingLeft: '18px', marginLeft: '6px' }}>
                {(!selectedIncident.actions || selectedIncident.actions.length === 0) ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No timeline actions logged yet.</p>
                ) : (
                  selectedIncident.actions.map((act) => (
                    <div key={act.id} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-25px',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: act.action_type === 'containment' ? '#ef4444' : '#2563eb',
                        border: '2px solid #ffffff'
                      }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                          {act.performed_by}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: act.action_type === 'containment' ? '#fee2e2' : '#f1f5f9',
                          color: act.action_type === 'containment' ? '#b91c1c' : '#475569'
                        }}>
                          {act.action_type}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {act.action_text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Shield size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>Select an incident from the registry to view its response workflow.</p>
          </div>
        )}

      </div>

      {/* Declare Incident Modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <ShieldCheck size={20} color="#2563eb" />
                <span>Declare New Security Incident</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setCreateModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Incident Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Distributed Brute-force Spike on VPN"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Incident Type</label>
                    <select
                      className="form-control"
                      value={createForm.incident_type}
                      onChange={(e) => setCreateForm({ ...createForm, incident_type: e.target.value })}
                    >
                      <option value="Brute-force login attack">Brute-force login attack</option>
                      <option value="Suspicious account access">Suspicious account access</option>
                      <option value="Phishing email attack">Phishing email attack</option>
                      <option value="Unknown device login">Unknown device login</option>
                      <option value="Credential Compromise">Credential Compromise</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity Level</label>
                    <select
                      className="form-control"
                      value={createForm.severity}
                      onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Response Lead</label>
                  <input
                    type="text"
                    className="form-control"
                    value={createForm.assigned_to}
                    onChange={(e) => setCreateForm({ ...createForm, assigned_to: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Summary & Scope</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Detail initial telemetry, affected assets, and observed threat vectors..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Synthesizing NIST Checklist...' : 'Declare & Generate Response Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
