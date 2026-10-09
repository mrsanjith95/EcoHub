import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RevealSection from '../components/RevealSection';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge, { formatCategoryTitle } from '../components/CategoryBadge';
import { Clock, Factory, FileText, ArrowRight, Filter, PlusCircle, Sparkles, MapPin } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending', 'Accepted', 'Collected', 'Delivered', 'Processing', 'Completed', 'Cancelled'];

export default function PickupRequestsPage() {
  const [reports, setReports] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
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
      console.error('Failed to fetch pickup requests:', err);
      setError(err.response?.data?.error || 'Could not load pickup requests');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = selectedStatus === 'All'
    ? reports
    : reports.filter((r) => r.status === selectedStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Editorial Header */}
      <RevealSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '2rem' }}>
          <div>
            <div className="editorial-eyebrow">
              <Sparkles size={14} /> PICKUP DIRECTORY
            </div>
            <h1 className="editorial-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)' }}>
              Waste Reports
            </h1>
            <p className="editorial-subtitle" style={{ marginTop: '0.5rem' }}>
              All submitted waste recovery requests and assigned processing hubs.
            </p>
          </div>
          <Link to="/report-waste" className="btn-apple btn-apple-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>
            <PlusCircle size={18} /> New Waste Report
          </Link>
        </div>
      </RevealSection>

      {/* Status Filter Bar */}
      <RevealSection delay={100}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Filter Status:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`btn-apple ${selectedStatus === st ? 'btn-apple-primary' : 'btn-apple-secondary'}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.825rem' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Editorial Requests List */}
      <RevealSection delay={200}>
        <div className="apple-card">
          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '3rem 0', textAlign: 'center' }}>Loading pickup requests...</p>
          ) : error ? (
            <div style={{ color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-md)' }}>{error}</div>
          ) : filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <FileText size={40} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--forest-dark)', marginBottom: '0.25rem' }}>No Reports Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>No waste reports match status filter '{selectedStatus}'.</p>
              <Link to="/report-waste" className="btn-apple btn-apple-primary">
                Report Waste Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReports.map((r) => {
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
                      gap: '1.25rem',
                      padding: '1.25rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: '1 1 300px' }}>
                      <CategoryBadge category={r.category} items={r.items} size={48} />
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--forest-dark)' }}>
                          {formatCategoryTitle(r.category, r.quantityKg)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                          <Factory size={14} color="var(--primary-600)" />
                          <span>{hubName}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                          <MapPin size={13} color="var(--text-light)" />
                          <span>{r.pickupLocation?.address}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <StatusBadge status={r.status} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                      <Link to={`/pickup-details/${id}`} className="btn-apple btn-apple-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}>
                        View Details <ArrowRight size={14} />
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
