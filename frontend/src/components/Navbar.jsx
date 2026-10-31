import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ pageTitle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="topbar-eyebrow">SECURITY WORKSPACE</span>
        <h2>{pageTitle}</h2>
      </div>

      <div className="topbar-actions">
        <div className="system-status-indicator">
          <span className="status-dot"></span>
          <span>All systems operational</span>
        </div>

        <div className="user-profile-badge">
          <div className="avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.full_name || user?.username}</span>
            <span className="user-role-label">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '10px', padding: '6px 10px', fontSize: '0.75rem' }}
            title="Logout"
            aria-label="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
