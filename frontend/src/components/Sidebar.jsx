import React from 'react';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  MailCheck,
  ShieldCheck,
  Bot,
  Laptop,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'Employee';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      roles: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
      section: 'Overview'
    },
    {
      id: 'logs',
      label: 'Login Monitoring',
      icon: Activity,
      roles: ['IT Administrator', 'Security Manager', 'Admin'],
      section: 'Monitoring'
    },
    {
      id: 'alerts',
      label: 'Security Alerts',
      icon: AlertTriangle,
      roles: ['IT Administrator', 'Security Manager', 'Admin'],
      badge: 'Active',
      badgeClass: 'danger',
      section: 'Monitoring'
    },
    {
      id: 'phishing',
      label: 'Phishing Detection',
      icon: MailCheck,
      roles: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
      section: 'Protection'
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      icon: ShieldCheck,
      roles: ['IT Administrator', 'Security Manager', 'Admin'],
      badge: 'NIST',
      badgeClass: 'warning',
      section: 'Protection'
    },
    {
      id: 'ai-assistant',
      label: 'AI Security Copilot',
      icon: Bot,
      roles: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
      section: 'AI Tools'
    },
    {
      id: 'devices',
      label: 'Device Registry',
      icon: Laptop,
      roles: ['Employee', 'IT Administrator', 'Security Manager', 'Admin'],
      section: 'Governance'
    },
    {
      id: 'policies',
      label: 'Security Policies',
      icon: FileText,
      roles: ['IT Administrator', 'Security Manager', 'Admin'],
      section: 'Governance'
    },
    {
      id: 'reports',
      label: 'Security Reports',
      icon: BarChart3,
      roles: ['Security Manager', 'Admin'],
      section: 'Governance'
    },
    {
      id: 'users',
      label: 'User Directory',
      icon: Users,
      roles: ['Admin'],
      section: 'Administration'
    }
  ];

  // Filter items by current user role
  const visibleItems = navItems.filter((item) =>
    role === 'Admin' || item.roles.includes(role)
  );

  // Group items by section
  const sections = Array.from(new Set(visibleItems.map(item => item.section)));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={22} />
        </div>
        <div className="brand-text">
          <h1>ThreatLens AI</h1>
          <span>SOC Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {sections.map(section => (
          <React.Fragment key={section}>
            <div className="nav-section-title">{section}</div>
            {visibleItems
              .filter(item => item.section === section)
              .map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`nav-badge ${item.badgeClass || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.full_name?.split(' ')[0] || user?.username}
            </div>
            <div className="role-pill">
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: 'none' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
