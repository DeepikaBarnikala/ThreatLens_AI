import React, { useState, useEffect } from 'react';
import {
  Laptop,
  PlusCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Filter
} from 'lucide-react';
import { devicesApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Devices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Register Device Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    device_name: '',
    assigned_user: '',
    ip_address: '',
    operating_system: 'macOS Sonoma 14.4',
    registration_status: 'Registered'
  });
  const [saving, setSaving] = useState(false);

  const fetchDevices = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await devicesApi.getDevices(params);
      setDevices(res.data);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [search, statusFilter]);

  const handleToggleStatus = async (dev) => {
    const nextStatus = dev.registration_status === 'Quarantined' ? 'Registered' : 'Quarantined';
    try {
      await devicesApi.updateDevice(dev.id, { registration_status: nextStatus });
      fetchDevices();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating device registration status');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await devicesApi.createDevice(form);
      setModalOpen(false);
      setForm({
        device_name: '',
        assigned_user: '',
        ip_address: '',
        operating_system: 'Windows 11 Enterprise',
        registration_status: 'Registered'
      });
      fetchDevices();
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Error registering device');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Authorized Device Registry & Endpoint Inventory</h2>
          <p>
            Track corporate workstations, research nodes, and mobile endpoints. Identify rogue unauthorized devices.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchDevices}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {['IT Administrator', 'Security Manager', 'Admin'].includes(user?.role) && (
            <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
              <PlusCircle size={14} />
              <span>Register Endpoint</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search devices by name, user, IP, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Device Statuses</option>
          <option value="Registered">Registered</option>
          <option value="Quarantined">Quarantined</option>
          <option value="Unregistered">Unregistered</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Device Name</th>
                <th>Assigned User</th>
                <th>IP Address</th>
                <th>Operating System</th>
                <th>Status</th>
                <th>Last Seen</th>
                {['IT Administrator', 'Security Manager', 'Admin'].includes(user?.role) && (
                  <th style={{ textAlign: 'right' }}>Security Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading devices...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No devices found matching criteria.
                  </td>
                </tr>
              ) : (
                devices.map((dev) => (
                  <tr key={dev.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.825rem', color: '#2563eb' }}>
                        {dev.device_id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{dev.device_name}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#334155' }}>{dev.assigned_user}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                        {dev.ip_address}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#475569' }}>{dev.operating_system}</span>
                    </td>
                    <td>
                      <StatusBadge status={dev.registration_status} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(dev.last_seen).toLocaleString()}
                    </td>
                    {['IT Administrator', 'Security Manager', 'Admin'].includes(user?.role) && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn btn-sm ${dev.registration_status === 'Quarantined' ? 'btn-secondary' : 'btn-danger'}`}
                          onClick={() => handleToggleStatus(dev)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {dev.registration_status === 'Quarantined' ? (
                            <>
                              <ShieldCheck size={13} color="#059669" />
                              <span>Restore Access</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert size={13} />
                              <span>Quarantine</span>
                            </>
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Device Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Laptop size={20} color="#2563eb" />
                <span>Register Endpoint Device</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Device Name / Model</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dell XPS 15 - Engineering Lab"
                    value={form.device_name}
                    onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned User / Owner</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Emma Watson (Staff Researcher)"
                    value={form.assigned_user}
                    onChange={(e) => setForm({ ...form, assigned_user: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Static / Assigned IP</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="192.168.10.75"
                      value={form.ip_address}
                      onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operating System</label>
                    <select
                      className="form-control"
                      value={form.operating_system}
                      onChange={(e) => setForm({ ...form, operating_system: e.target.value })}
                    >
                      <option value="Windows 11 Enterprise">Windows 11 Enterprise</option>
                      <option value="macOS Sonoma 14.4">macOS Sonoma 14.4</option>
                      <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
                      <option value="iOS 17.5 MDM">iOS 17.5 MDM</option>
                      <option value="Android 14 Work Profile">Android 14 Work Profile</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
