import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = (status || 'New').toLowerCase();
  return (
    <span className={`badge-status ${s}`}>
      {status}
    </span>
  );
};
