import React from 'react';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export const SeverityBadge = ({ severity }) => {
  const sev = (severity || 'Low').toLowerCase();

  if (sev === 'critical') {
    return (
      <span className="badge badge-critical">
        <ShieldAlert size={13} />
        Critical
      </span>
    );
  }
  if (sev === 'high') {
    return (
      <span className="badge badge-high">
        <AlertTriangle size={13} />
        High
      </span>
    );
  }
  if (sev === 'medium') {
    return (
      <span className="badge badge-medium">
        <AlertCircle size={13} />
        Medium
      </span>
    );
  }
  return (
    <span className="badge badge-low">
      <Info size={13} />
      Low
    </span>
  );
};
