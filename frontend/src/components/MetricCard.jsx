import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, color = '#2563eb', bg = '#eff6ff' }) => {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        <div className="metric-icon-wrap" style={{ backgroundColor: bg, color }}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {subtext && <div className="metric-sub">{subtext}</div>}
    </div>
  );
};
