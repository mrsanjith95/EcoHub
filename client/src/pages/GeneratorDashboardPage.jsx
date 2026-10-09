import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import CategoryBadge, { formatCategoryTitle } from '../components/CategoryBadge';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { PlusCircle, Clock, CheckCircle2, Factory, FileText, ArrowRight, MapPin, Sparkles } from 'lucide-react';

export default function GeneratorDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/waste/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to load waste reports:', err);
      setError('Could not load recent waste reports');
    } finally {
      setLoading(false);
    }
  };

  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const activeCount = reports.filter((r) => ['Accepted', 'Collected', 'Delivered', 'Processing'].includes(r.status)).length;
  const completedCount = reports.filter((r) => r.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Editorial Welcome Header */}
      <RevealSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '2rem' }}>
          <div>
            <div className="editorial-eyebrow">
              <Sparkles size={14} /> GENERATOR PORTAL
            </div>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}>
              "Your waste has a destination."
            </h1>
            <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
              Logged in as <strong>{user?.name || 'Generator'}</strong>. Track pickup dispatches and processing outcomes.
            </p>
          </div>
          <Link to="/report-waste" className="btn-apple btn-apple-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>
            <PlusCircle size={18} /> Report Waste
          </Link>
        </div>
      </RevealSection>

      {/* Large Metric Cards */}
      <RevealSection delay={150}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <StatCard
            number={totalReports}
            label="TOTAL REPORTS"
            icon={FileText}
            color="#059669"
            description="Total logged waste recovery requests"
          />
          <StatCard
            number={pendingCount}
            label="PENDING PICKUPS"
            icon={Clock}
            color="#d97706"
            description="Awaiting collector acceptance"
          />
          <StatCard
            number={activeCount}
            label="ACTIVE IN TRANSIT"
            icon={Factory}
            color="#0284c7"
            description="Accepted or in-transit to hub"
          />
          <StatCard
            number={completedCount}
            label="DIVERTED / COMPLETED"
            icon={CheckCircle2}
            color="#059669"
            description="Verified processed landfill diversion"
          />
        </div>
      </RevealSection>

      {/* Recent Waste Reports Editorial List */}
      <RevealSection delay={250}>
        <div className="apple-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--forest-dark)', letterSpacing: '-0.02em' }}>
                Recent Waste Reports
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Track the journey of your submitted waste streams
              </p>
            </div>
            <Link to="/pickup-requests" className="btn-apple btn-apple-ghost" style={{ fontSize: '0.875rem' }}>
              View All Requests <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>Loading waste reports...</p>
          ) : error ? (
            <div style={{ color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <FileText size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Reports Created Yet</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Start by reporting your first recyclable waste stream in Delhi.</p>
              <Link to="/report-waste" className="btn-apple btn-apple-primary">
                Create Waste Report
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {reports.slice(0, 5).map((r) => {
                const hubName = r.assignedHubId?.name || r.assignedHub?.name || 'Hub pending assignment';
                const id = r._id || r.id;
                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      padding: '1.15rem 1.25rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <CategoryBadge category={r.category} items={r.items} size={42} />
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCategoryTitle(r.category, r.quantityKg)}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                          <Factory size={13} color="var(--primary-600)" />
                          <span>{hubName}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <StatusBadge status={r.status} />
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-light)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                      <Link to={`/pickup-details/${id}`} className="btn-apple btn-apple-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                        Track <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </RevealSection>
    </div>
  );
}
