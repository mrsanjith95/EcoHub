import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { formatCategoryTitle } from '../components/CategoryBadge';
import { Shield, Users, FileText, Factory, Recycle, Award, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/overview');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch admin overview:', err);
      setError(err.response?.data?.error || 'Could not load admin overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading EcoHub network control overview...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="apple-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: 700 }}>
          {error || 'Failed to load admin network overview'}
        </div>
        <button onClick={fetchAdminOverview} className="btn-apple btn-apple-primary">
          <RefreshCw size={16} /> Retry Loading
        </button>
      </div>
    );
  }

  const userRoleDist = data.userRoleDistribution || [];
  const activeHubsList = data.activeHubsList || [];
  const recentReportsList = data.recentReports || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Editorial Header */}
      <RevealSection>
        <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
          <div className="editorial-eyebrow">
            <Sparkles size={14} /> COMMAND CENTER
          </div>
          <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}>
            EcoHub Network
          </h1>
          <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
            System-wide administration, registered user distribution, facility capacity, and aggregated landfill diversion.
          </p>
        </div>
      </RevealSection>

      {/* Metric Cards Grid */}
      <RevealSection delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <StatCard
            number={data.totalUsers || 0}
            label="REGISTERED USERS"
            icon={Users}
            color="#7e22ce"
            description="Generators, Collectors, Hub Operators, Admins"
          />
          <StatCard
            number={data.totalReports || 0}
            label="WASTE REPORTS"
            icon={FileText}
            color="#0284c7"
            description="Total logged recovery requests"
          />
          <StatCard
            number={data.pendingReports || 0}
            label="PENDING PICKUPS"
            icon={FileText}
            color="#d97706"
            description="Requests awaiting assignment"
          />
          <StatCard
            number={data.activeHubs || 0}
            label="ACTIVE HUBS"
            icon={Factory}
            color="#059669"
            description="Verified active Delhi facilities"
          />
          <StatCard
            number={data.totalLandfillDivertedKg || 0}
            unit="kg"
            label="LANDFILL DIVERTED"
            icon={CheckCircle2}
            color="#059669"
            description="Total mass kept out of landfills"
          />
        </div>
      </RevealSection>

      {/* User Role Distribution & Active Hubs Directory */}
      <RevealSection delay={200}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Role Distribution */}
          <div className="apple-card">
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: '#7e22ce', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} /> USER ROLE DISTRIBUTION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {userRoleDist.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No user data available.</div>
              ) : (
                userRoleDist.map((r) => (
                  <div
                    key={r.role}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize', fontSize: '0.925rem' }}>
                      {r.role.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: 800, color: '#7e22ce', fontSize: '1.2rem' }}>{r.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Hubs Directory */}
          <div className="apple-card">
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary-600)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Factory size={16} /> ACTIVE PROCESSING HUBS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeHubsList.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No processing hubs found.</div>
              ) : (
                activeHubsList.map((h) => (
                  <div
                    key={h._id || h.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--forest-dark)', fontSize: '0.95rem' }}>{h.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Capacity: {h.capacityKgPerDay} kg/day | Stock: {h.currentStockKg} kg
                      </div>
                    </div>
                    <span className="badge-pill badge-pill-completed" style={{ fontSize: '0.72rem' }}>Active</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Recent Waste Reports List */}
      <RevealSection delay={300}>
        <div className="apple-card">
          <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0284c7', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} /> RECENT WASTE REPORTS AUDIT LOG
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentReportsList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No waste reports logged yet.</div>
            ) : (
              recentReportsList.map((r) => (
                <div
                  key={r._id || r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1rem 1.15rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--forest-dark)', fontSize: '0.95rem' }}>
                      {formatCategoryTitle(r.category, r.quantityKg)}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Generator: {r.generatorId?.name || 'Generator'} • Hub: {r.assignedHubId?.name || 'Unassigned'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge status={r.status} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
