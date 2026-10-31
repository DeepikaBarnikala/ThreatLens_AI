import React from 'react';
import { X, Sparkles, Shield, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const AIModal = ({ isOpen, onClose, title, data, type = 'alert' }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="#0284c7" />
            <span>ThreatLens AI Copilot Explanation</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {type === 'alert' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.825rem', textTransform: 'uppercase', color: '#0369a1', fontWeight: 700, marginBottom: '6px' }}>
                  What Happened?
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#0c4a6e', lineHeight: 1.5 }}>
                  {data.what_happened}
                </p>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.825rem', textTransform: 'uppercase', color: '#b45309', fontWeight: 700, marginBottom: '6px' }}>
                  Why Is It Suspicious?
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: 1.5 }}>
                  {data.why_suspicious}
                </p>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.825rem', textTransform: 'uppercase', color: '#b91c1c', fontWeight: 700, marginBottom: '6px' }}>
                  Possible Organizational Impact
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                  {data.possible_impact}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} color="#2563eb" />
                  Recommended Administrator Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.recommended_steps?.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: '#334155' }}>
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {data.source && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', textAlign: 'right' }}>
                  Engine: {data.source}
                </div>
              )}
            </div>
          )}

          {type === 'phishing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.825rem', textTransform: 'uppercase', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                  Security Analysis
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                  {data.analysis}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Detected Threat Indicators
                </h4>
                <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {data.threat_indicators?.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <h4 style={{ fontSize: '0.825rem', color: '#065f46', fontWeight: 700, marginBottom: '4px' }}>
                  Guidance for Staff / Employee
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#047857' }}>
                  {data.user_guidance}
                </p>
              </div>

              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <h4 style={{ fontSize: '0.825rem', color: '#1e40af', fontWeight: 700, marginBottom: '4px' }}>
                  Recommended IT Admin Action
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>
                  {data.admin_action}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
