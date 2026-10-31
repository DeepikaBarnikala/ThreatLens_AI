import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  LockKeyhole,
  Mail,
  Shield,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onBackToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (new TextEncoder().encode(formData.password).length > 72) {
      setError('Password must be no more than 72 UTF-8 bytes.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        department: formData.department.trim() || 'General',
        password: formData.password,
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((issue) => issue.msg).join(' ')
        : detail;
      setError(typeof message === 'string' ? message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <div className="auth-brand">
            <div className="auth-brand-mark"><Shield size={25} /></div>
            <div>
              <h1>ThreadLens AI</h1>
              <span>Security operations, made clear</span>
            </div>
          </div>
          <p className="auth-lead">
            Create a secure workspace account to monitor threats, triage phishing,
            and coordinate incident response.
          </p>
          <div className="auth-trust-note">
            <LockKeyhole size={18} />
            <span>New accounts receive employee access. Administrators can update access later.</span>
          </div>
        </section>

        <section className="auth-card" aria-labelledby="register-title">
          <div className="auth-card-icon"><UserPlus size={20} /></div>
          <p className="auth-kicker">GET STARTED</p>
          <h2 id="register-title">Create your account</h2>
          <p className="auth-card-description">Your account is protected with a signed access token.</p>

          {error && (
            <div className="auth-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="register-full-name">Full name</label>
                <input
                  id="register-full-name"
                  className="form-control"
                  type="text"
                  name="full_name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={formData.full_name}
                  onChange={handleChange}
                  maxLength={255}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  className="form-control"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={100}
                  pattern="[A-Za-z0-9._\\-]+"
                  title="Use letters, numbers, periods, underscores, or hyphens."
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Work email</label>
              <div className="auth-input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="register-email"
                  className="form-control"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@organization.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={255}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-department">Department <span>(optional)</span></label>
              <div className="auth-input-wrap">
                <Building2 size={17} aria-hidden="true" />
                <input
                  id="register-department"
                  className="form-control"
                  type="text"
                  name="department"
                  autoComplete="organization-title"
                  placeholder="e.g. Information Technology"
                  value={formData.department}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">Password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <input
                    id="register-password"
                    className="form-control"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="register-confirm-password">Confirm password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <input
                    id="register-confirm-password"
                    className="form-control"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit btn btn-primary" disabled={loading}>
              <span>{loading ? 'Creating account…' : 'Create account'}</span>
              <UserPlus size={17} />
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <button type="button" className="auth-link" onClick={onBackToLogin}>
              <ArrowLeft size={15} /> Sign in
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
