import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GeneratorDashboardPage from './pages/GeneratorDashboardPage';
import ReportWastePage from './pages/ReportWastePage';
import NearbyHubsPage from './pages/NearbyHubsPage';
import PickupRequestsPage from './pages/PickupRequestsPage';
import PickupDetailsPage from './pages/PickupDetailsPage';
import HubDashboardPage from './pages/HubDashboardPage';
import ProcessingDetailsPage from './pages/ProcessingDetailsPage';
import ImpactDashboardPage from './pages/ImpactDashboardPage';
import CollectorDashboardPage from './pages/CollectorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Leaf, AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem 2rem', textAlign: 'center', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.5rem' }}>
            Something went wrong rendering this view
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected application error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-apple btn-apple-primary"
          >
            <RefreshCw size={16} /> Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Generator Core MVP Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['generator', 'collector', 'hub_operator', 'admin']}>
                      <GeneratorDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report-waste"
                  element={
                    <ProtectedRoute allowedRoles={['generator', 'admin']}>
                      <ReportWastePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nearby-hubs"
                  element={
                    <ProtectedRoute allowedRoles={['generator', 'collector', 'hub_operator', 'admin']}>
                      <NearbyHubsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pickup-requests"
                  element={
                    <ProtectedRoute allowedRoles={['generator', 'collector', 'hub_operator', 'admin']}>
                      <PickupRequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pickup-details/:id"
                  element={
                    <ProtectedRoute allowedRoles={['generator', 'collector', 'hub_operator', 'admin']}>
                      <PickupDetailsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Phase 4: Processing Hub & Impact Routes */}
                <Route
                  path="/hub-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['hub_operator', 'admin']}>
                      <HubDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/processing/:id"
                  element={
                    <ProtectedRoute allowedRoles={['hub_operator', 'admin']}>
                      <ProcessingDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/impact"
                  element={
                    <ProtectedRoute allowedRoles={['generator', 'collector', 'hub_operator', 'admin']}>
                      <ImpactDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Placeholders */}
                <Route
                  path="/collector-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['collector', 'admin']}>
                      <CollectorDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-medium)', padding: '1.5rem', textAlign: 'center', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <Leaf size={18} color="var(--primary-600)" />
              <span>EcoHub — Local Waste Processing & Collection Network © 2026</span>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
