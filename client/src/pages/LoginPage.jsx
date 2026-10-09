import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogIn, AlertCircle, Sparkles, User, Truck, Factory, Shield } from 'lucide-react';
import RevealSection from '../components/RevealSection';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const redirectUser = (role) => {
    switch (role) {
      case 'collector':
        navigate('/collector-dashboard');
        break;
      case 'hub_operator':
        navigate('/hub-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'generator':
      default:
        navigate('/dashboard');
        break;
    }
  };

  const quickDemoLogin = async (demoRole, demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const user = await login(demoEmail, 'password123');
      redirectUser(user.role);
    } catch (err) {
      setErrorMsg(`Demo user (${demoEmail}) login failed.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <RevealSection>
        <div className="apple-card" style={{ padding: '2.25rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Leaf size={26} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--forest-dark)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Welcome to EcoHub
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sign in to your waste recovery account
            </p>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-apple btn-apple-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
              <LogIn size={18} /> {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Hackathon Quick Demo Login Buttons */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-medium)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
              <Sparkles size={14} color="var(--primary-600)" /> Quick Demo Role Logins:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => quickDemoLogin('generator', 'generator@ecohub.demo')}
                className="btn-apple btn-apple-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', justifyContent: 'flex-start' }}
              >
                <User size={14} color="var(--primary-600)" /> Generator
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('collector', 'collector@ecohub.demo')}
                className="btn-apple btn-apple-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', justifyContent: 'flex-start' }}
              >
                <Truck size={14} color="#0284c7" /> Collector
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('hub_operator', 'hub@ecohub.demo')}
                className="btn-apple btn-apple-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', justifyContent: 'flex-start' }}
              >
                <Factory size={14} color="#d97706" /> Hub Operator
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('admin', 'admin@ecohub.demo')}
                className="btn-apple btn-apple-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', justifyContent: 'flex-start' }}
              >
                <Shield size={14} color="#7e22ce" /> Admin
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Register Now</Link>
          </p>
        </div>
      </RevealSection>
    </div>
  );
}
