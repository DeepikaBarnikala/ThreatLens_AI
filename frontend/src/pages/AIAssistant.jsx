import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Shield,
  FileCheck,
  AlertTriangle,
  MailCheck,
  Send,
  HelpCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { aiApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AIAssistant = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('copilot');

  // Interactive Copilot State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'Administrator'}! I am your ThreatLens AI Cybersecurity Assistant. I can help analyze security telemetry, explain complex alerts in simple English, generate NIST-aligned incident checklists, and guide defensive containment strategies. How can I assist you today?`,
      time: 'Just now'
    }
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Alert Explainer State
  const [alertForm, setAlertForm] = useState({
    title: 'Brute-Force Authentication Burst on Administrator Account',
    description: '7 consecutive failed authentication attempts detected from Moscow, Russia (185.220.101.5) via Python Curl bot.',
    severity: 'Critical',
    source: 'Login Anomaly Engine'
  });
  const [alertResult, setAlertResult] = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  // Incident Checklist Generator State
  const [incidentForm, setIncidentForm] = useState({
    incident_type: 'Brute-force login attack',
    severity: 'Critical',
    description: 'Targeted dictionary credential stuffing targeting campus administrator accounts during off-hours.'
  });
  const [checklistResult, setChecklistResult] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Copilot Message Submit
  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const userMsg = { role: 'user', text: promptInput, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    const query = promptInput;
    setPromptInput('');
    setCopilotLoading(true);

    try {
      // Route query intelligently to GenAI engine
      let replyText = '';
      if (query.toLowerCase().includes('checklist') || query.toLowerCase().includes('incident') || query.toLowerCase().includes('respond')) {
        const res = await aiApi.incidentResponse({
          incident_type: 'Suspicious account access',
          severity: 'High',
          description: query
        });
        const steps = res.data.checklist?.map(c => `• [Phase ${c.id}: ${c.phase}] ${c.title}: ${c.description}`).join('\n') || '';
        replyText = `**Executive Summary:** ${res.data.executive_summary}\n\n**Containment Strategy:** ${res.data.containment_strategy}\n\n**Recommended NIST Checklist Steps:**\n${steps}`;
      } else if (query.toLowerCase().includes('alert') || query.toLowerCase().includes('log') || query.toLowerCase().includes('login') || query.toLowerCase().includes('anomaly')) {
        const res = await aiApi.explainAlert({
          title: 'Custom Inquired Security Event',
          description: query,
          severity: 'High',
          source: 'Cyber Copilot Inquiry'
        });
        const steps = res.data.recommended_steps?.map(s => `• ${s}`).join('\n') || '';
        replyText = `**What Happened:** ${res.data.what_happened}\n\n**Why It Is Suspicious:** ${res.data.why_suspicious}\n\n**Possible Impact:** ${res.data.possible_impact}\n\n**Recommended Administrator Actions:**\n${steps}`;
      } else {
        const res = await aiApi.explainAlert({
          title: 'General Cybersecurity Guidance',
          description: query,
          severity: 'Medium',
          source: 'Knowledge Base'
        });
        replyText = `${res.data.what_happened} In accordance with defense-in-depth security best practices, we recommend enforcing Multi-Factor Authentication (MFA), reducing failed login lockout windows, and maintaining regular automated backups.`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: replyText,
        time: 'Just now'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'ThreatLens AI security core is active with defense templates. To safeguard your infrastructure, prioritize isolating anomalous endpoints, resetting compromised credentials, and validating external IP origins.',
        time: 'Just now'
      }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleQuickQuestion = (q) => {
    setPromptInput(q);
  };

  const handleExplainAlert = async (e) => {
    e.preventDefault();
    setAlertLoading(true);
    setAlertResult(null);
    try {
      const res = await aiApi.explainAlert(alertForm);
      setAlertResult(res.data);
    } catch (err) {
      alert('Alert explanation failed');
    } finally {
      setAlertLoading(false);
    }
  };

  const handleGenerateChecklist = async (e) => {
    e.preventDefault();
    setChecklistLoading(true);
    setChecklistResult(null);
    try {
      const res = await aiApi.incidentResponse(incidentForm);
      setChecklistResult(res.data);
    } catch (err) {
      alert('Checklist generation failed');
    } finally {
      setChecklistLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Generative AI Security Assistant</h2>
          <p>
            Context-aware defensive cybersecurity reasoning powered by Google Gemini / Groq with deterministic fallbacks.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        {[
          { id: 'copilot', label: 'Interactive Cyber Copilot', icon: Bot },
          { id: 'explainer', label: 'Alert Explanation Engine', icon: AlertTriangle },
          { id: 'checklist', label: 'NIST Checklist Generator', icon: FileCheck },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.885rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Interactive Cyber Copilot */}
      {activeTab === 'copilot' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '68vh', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>ThreatLens Security Advisor</span>
                <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Live Defensive Guidance Ready</div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Defensive Security Mode Enforced
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div style={{ padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap', alignSelf: 'center' }}>Suggested:</span>
            {[
              'How do I handle a brute-force attack from Russia?',
              'Generate an incident checklist for a phishing outbreak',
              'What are the risk factors of impossible travel logins?',
              'Recommended password lockout policy for colleges'
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: isUser ? '#2563eb' : '#f8fafc',
                    color: isUser ? '#ffffff' : '#0f172a',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.885rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.text}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                    {isUser ? 'You' : 'ThreatLens Copilot'} • {m.time}
                  </span>
                </div>
              );
            })}
            {copilotLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                <Sparkles size={16} className="animate-spin" color="#2563eb" />
                <span>ThreatLens AI is formulating defensive security guidance...</span>
              </div>
            )}
          </div>

          {/* Prompt Input Form */}
          <form onSubmit={handleSendPrompt} style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Ask ThreatLens AI about any alert, incident containment, or policy recommendation..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              disabled={copilotLoading}
            />
            <button type="submit" className="btn btn-primary" disabled={copilotLoading || !promptInput.trim()}>
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Alert Explanation Engine */}
      {activeTab === 'explainer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={18} color="#f59e0b" />
                <span>Configure Security Alert to Explain</span>
              </div>
            </div>

            <form onSubmit={handleExplainAlert}>
              <div className="form-group">
                <label className="form-label">Alert Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select
                    className="form-control"
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Detection Source</label>
                  <input
                    type="text"
                    className="form-control"
                    value={alertForm.source}
                    onChange={(e) => setAlertForm({ ...alertForm, source: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Telemetry Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={alertForm.description}
                  onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-ai" style={{ width: '100%', padding: '12px' }} disabled={alertLoading}>
                <Sparkles size={16} />
                <span>{alertLoading ? 'Deconstructing Alert with AI...' : 'Generate 4-Part Admin Explanation'}</span>
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={18} color="#06b6d4" />
                <span>AI Plain-English Deconstruction</span>
              </div>
            </div>

            {!alertResult ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                <AlertTriangle size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>Click "Generate 4-Part Admin Explanation" to see AI reasoning.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>1. What Happened?</span>
                  <p style={{ fontSize: '0.875rem', color: '#0c4a6e', marginTop: '2px' }}>{alertResult.what_happened}</p>
                </div>

                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>2. Why Is It Suspicious?</span>
                  <p style={{ fontSize: '0.875rem', color: '#78350f', marginTop: '2px' }}>{alertResult.why_suspicious}</p>
                </div>

                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>3. Potential Impact</span>
                  <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginTop: '2px' }}>{alertResult.possible_impact}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>4. Recommended Steps for IT Admin</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {alertResult.recommended_steps?.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                        <CheckCircle2 size={15} color="#10b981" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: NIST Checklist Generator */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileCheck size={18} color="#2563eb" />
                <span>Synthesize Incident Response Checklist</span>
              </div>
            </div>

            <form onSubmit={handleGenerateChecklist}>
              <div className="form-group">
                <label className="form-label">Incident Classification</label>
                <select
                  className="form-control"
                  value={incidentForm.incident_type}
                  onChange={(e) => setIncidentForm({ ...incidentForm, incident_type: e.target.value })}
                >
                  <option value="Brute-force login attack">Brute-force login attack</option>
                  <option value="Suspicious account access">Suspicious account access</option>
                  <option value="Phishing email attack">Phishing email attack</option>
                  <option value="Unknown device login">Unknown device login</option>
                  <option value="Credential Compromise">Credential Compromise</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Severity</label>
                <select
                  className="form-control"
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Incident Scenario Details</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={checklistLoading}>
                <Sparkles size={16} />
                <span>{checklistLoading ? 'Synthesizing Response SOP...' : 'Generate 7-Phase NIST Checklist'}</span>
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Shield size={18} color="#10b981" />
                <span>Generated 7-Phase Response Checklist</span>
              </div>
            </div>

            {!checklistResult ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                <FileCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>Configure an incident type and click Generate to view SANS/NIST response steps.</p>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Executive Briefing</span>
                  <p style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '2px' }}>{checklistResult.executive_summary}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                  {checklistResult.checklist?.map((step) => (
                    <div key={step.id} style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                          Phase {step.id}: {step.phase}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{step.title}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
