import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  Mail,
  User
} from 'lucide-react';
import { usersApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Add User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'Employee',
    department: 'Academic Operations'
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await usersApi.getUsers(params);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    try {
      await usersApi.toggleStatus(user.id);
      fetchUsers();
    } catch (err) {
      console.error('Toggle status error:', err);
      alert('Error updating user status');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.createUser(form);
      setModalOpen(false);
      setForm({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'Employee',
        department: 'Academic Operations'
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      alert(err.response?.data?.detail || 'Error creating user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Identity & Role-Based Access Control (Admin)</h2>
          <p>
            Manage organizational accounts, assign four-tier security permissions, and regulate account active status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
            <UserPlus size={14} />
            <span>Add New User</span>
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
            placeholder="Search users by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '180px' }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Security Manager">Security Manager</option>
          <option value="IT Administrator">IT Administrator</option>
          <option value="Employee">Employee</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>Role Tier</th>
                <th>Department</th>
                <th>Corporate Email</th>
                <th>Account Status</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>@{u.username}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: u.role === 'Admin' ? '#eff6ff' : u.role === 'Security Manager' ? '#f5f3ff' : u.role === 'IT Administrator' ? '#ecfeff' : '#f8fafc',
                        color: u.role === 'Admin' ? '#1d4ed8' : u.role === 'Security Manager' ? '#7c3aed' : u.role === 'IT Administrator' ? '#0891b2' : '#475569'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#334155' }}>{u.department}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#475569' }}>{u.email}</span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.78rem', fontWeight: 600 }}>
                          <CheckCircle size={13} /> Active
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
                          <XCircle size={13} /> Disabled
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never logged in'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleToggleStatus(u)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <UserPlus size={20} color="#2563eb" />
                <span>Create Organizational User</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddUserSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Jane Doe"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. jdoe"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jdoe@threatlens.ai"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Security Role Tier</label>
                    <select
                      className="form-control"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="Employee">Employee</option>
                      <option value="IT Administrator">IT Administrator</option>
                      <option value="Security Manager">Security Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. College of Science"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating User...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
